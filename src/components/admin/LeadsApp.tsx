"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CATEGORIES, CATEGORY_KEYS, type CategoryKey } from "@/lib/leads/categories";
import { waLink } from "@/lib/leads/format";
import {
  OUTCOMES,
  SENT_STATUSES,
  type Lead,
  type LeadStatus,
  type Settings,
  type Tap,
} from "@/lib/leads/types";
import { browserClient } from "@/lib/supabase/browser";
import { OK, btn, btnGhost, btnPrimary, btnSeg, chip, field } from "./styles";

interface LeadsAppProps {
  readonly initialLeads: Lead[];
  readonly initialSettings: Settings;
  readonly initialTaps: Tap[];
}

const PRESETS = [
  { min: 15, label: "15 min" },
  { min: 30, label: "30 min" },
  { min: 60, label: "1 hour" },
  { min: 120, label: "2 hours" },
  { min: 240, label: "4 hours" },
];

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "0%");

function gapText(min: number): string {
  if (min % 60 === 0) return min === 60 ? "1 hour" : `${min / 60} hours`;
  return min === 1 ? "1 minute" : `${min} minutes`;
}

function countdown(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

export function LeadsApp({ initialLeads, initialSettings, initialTaps }: LeadsAppProps) {
  const db = browserClient();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [taps, setTaps] = useState<Tap[]>(initialTaps);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [toast, setToast] = useState<{ text: string; err: boolean } | null>(null);
  const [draft, setDraft] = useState<{ id: string; text: string } | null>(null);
  const [saveNote, setSaveNote] = useState("Edits save automatically.");
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [customMin, setCustomMin] = useState("");
  const [city, setCity] = useState("Nairobi");
  const [category, setCategory] = useState<CategoryKey>("salon");
  const [findNote, setFindNote] = useState("");
  const saveTimer = useRef<number | undefined>(undefined);
  const toastTimer = useRef<number | undefined>(undefined);
  const draftRef = useRef<{ id: string; text: string } | null>(null);
  const updateDraft = useCallback((next: { id: string; text: string } | null) => {
    draftRef.current = next;
    setDraft(next);
  }, []);

  const say = useCallback((text: string, err = false) => {
    setToast({ text, err });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4500);
  }, []);

  // Clock for the countdown.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // One realtime subscription for the page's lifetime.
  useEffect(() => {
    const channel = db
      .channel("lead-queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, (payload) => {
        if (payload.eventType === "DELETE") {
          const id = (payload.old as Partial<Lead>).id;
          setLeads((list) => list.filter((l) => l.id !== id));
          return;
        }
        const row = payload.new as Lead;
        setLeads((list) => {
          const i = list.findIndex((l) => l.id === row.id);
          if (i === -1) return [...list, row];
          const next = list.slice();
          next[i] = row;
          return next;
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, (payload) => {
        if (payload.eventType !== "DELETE") setSettings(payload.new as Settings);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "taps" }, (payload) => {
        setTaps((list) => [...list, payload.new as Tap]);
      })
      .subscribe();
    return () => {
      void db.removeChannel(channel);
    };
  }, [db]);

  // ---- derived lists
  const byOrder = (a: Lead, b: Lead) => a.sort_order - b.sort_order;
  const fresh = useMemo(
    () =>
      leads
        .filter((l) => l.status === "new")
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [leads],
  );
  const queued = useMemo(() => leads.filter((l) => l.status === "queued").sort(byOrder), [leads]);
  const sent = useMemo(
    () =>
      leads
        .filter((l) => SENT_STATUSES.includes(l.status))
        .sort((a, b) => (b.sent_at ?? "").localeCompare(a.sent_at ?? "")),
    [leads],
  );
  const skipped = useMemo(() => leads.filter((l) => l.status === "skipped").sort(byOrder), [leads]);

  const tapsBySlug = useMemo(() => {
    const map = new Map<string, { visit: boolean; contact: boolean }>();
    for (const t of taps) {
      const v = map.get(t.slug) ?? { visit: false, contact: false };
      v[t.kind] = true;
      map.set(t.slug, v);
    }
    return map;
  }, [taps]);

  const current = (pickedId && queued.find((l) => l.id === pickedId)) || queued[0] || null;
  const messageText = current && draft?.id === current.id ? draft.text : (current?.message ?? "");

  // ---- stats
  const n = sent.length;
  const count = (list: LeadStatus[]) => sent.filter((l) => list.includes(l.status)).length;
  const interested = count(["interested", "won"]);
  const replied = count(["replied", "interested", "won", "not_interested"]);
  const won = count(["won"]);
  const opened = sent.filter((l) => tapsBySlug.get(l.slug)?.visit).length;
  const inPlay = leads.filter((l) => l.status !== "new").length;

  // ---- writes
  const patchLead = useCallback(
    async (id: string, patch: Partial<Lead>): Promise<boolean> => {
      let before: Lead | undefined;
      setLeads((list) =>
        list.map((l) => {
          if (l.id !== id) return l;
          before = l;
          return { ...l, ...patch };
        }),
      );
      const { error } = await db.from("leads").update(patch).eq("id", id);
      if (error) {
        if (before) {
          const old = before;
          setLeads((list) => list.map((l) => (l.id === id ? old : l)));
        }
        say("Could not save. Check your connection and try again.", true);
        return false;
      }
      return true;
    },
    [db, say],
  );

  const patchSettings = useCallback(
    async (patch: Partial<Settings>): Promise<boolean> => {
      const old = settings;
      setSettings({ ...settings, ...patch });
      const { error } = await db.from("settings").update(patch).eq("id", 1);
      if (error) {
        setSettings(old);
        say("Could not save the setting. Try again.", true);
        return false;
      }
      return true;
    },
    [db, settings, say],
  );

  const flushMessage = useCallback(async () => {
    window.clearTimeout(saveTimer.current);
    const pending = draftRef.current;
    if (!pending) return;
    const lead = leads.find((l) => l.id === pending.id);
    updateDraft(null);
    if (!lead || lead.message === pending.text) return;
    if (await patchLead(pending.id, { message: pending.text })) setSaveNote("Edit saved.");
  }, [leads, patchLead, updateDraft]);

  function onMessageInput(text: string) {
    if (!current) return;
    updateDraft({ id: current.id, text });
    setSaveNote("Saving…");
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => void flushMessage(), 900);
  }

  function pick(id: string) {
    void flushMessage();
    setPickedId(id);
    setArmed(false);
    document.getElementById("lead-name")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function copy(text: string, done: string) {
    try {
      await navigator.clipboard.writeText(text);
      say(done);
    } catch {
      say("Copy is blocked here. Press and hold the text to copy it.", true);
    }
  }

  async function markSent() {
    if (!current) return;
    await flushMessage();
    const at = new Date().toISOString();
    const ok = await patchLead(current.id, { status: "sent", sent_at: at });
    if (!ok) return;
    await patchSettings({ last_sent_at: at });
    say(`Marked ${current.name} as sent. Next one in ${gapText(settings.interval_min)}.`);
  }

  async function setStatus(lead: Lead, status: LeadStatus) {
    const patch: Partial<Lead> = { status };
    if (status === "queued") patch.sent_at = null;
    await patchLead(lead.id, patch);
  }

  async function skipCurrent() {
    if (!current) return;
    await flushMessage();
    if (await patchLead(current.id, { status: "skipped" })) say(`Skipped ${current.name}.`);
  }

  async function runDraft(lead: Lead): Promise<boolean> {
    setBusy((b) => ({ ...b, [lead.id]: true }));
    try {
      const res = await fetch("/api/admin/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const json = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        say(json.message ?? "Claude could not write the message. Try again.", true);
        return false;
      }
      return true;
    } catch {
      say("Could not reach the server. Try again.", true);
      return false;
    } finally {
      setBusy((b) => ({ ...b, [lead.id]: false }));
    }
  }

  async function redraft() {
    if (!current) return;
    if (!armed) {
      setArmed(true);
      window.setTimeout(() => setArmed(false), 4000);
      return;
    }
    setArmed(false);
    window.clearTimeout(saveTimer.current);
    updateDraft(null);
    if (await runDraft(current)) {
      setSaveNote("New draft saved.");
      say("Message replaced.");
    }
  }

  async function setGap(min: number) {
    const v = Math.max(1, Math.min(1440, Math.round(min)));
    if (!Number.isFinite(v) || v === settings.interval_min) return;
    if (await patchSettings({ interval_min: v })) say(`Gap set to ${gapText(v)}.`);
  }

  async function find() {
    setFindNote("Searching OpenStreetMap…");
    try {
      const res = await fetch("/api/admin/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, category }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        message?: string;
        added?: number;
        skipped?: number;
      };
      if (!res.ok) {
        setFindNote(json.message ?? "OpenStreetMap is busy. Try again in a few minutes.");
        return;
      }
      setFindNote(
        `Added ${json.added ?? 0} new leads. ${json.skipped ?? 0} were already in your list.`,
      );
    } catch {
      setFindNote("Could not reach the server. Try again.");
    }
  }

  // ---- timer
  const lastSent = settings.last_sent_at ? Date.parse(settings.last_sent_at) : 0;
  const left = lastSent ? lastSent + settings.interval_min * 60_000 - now : 0;
  const queueDone = inPlay > 0 && queued.length === 0;
  const presetMatch = PRESETS.some((p) => p.min === settings.interval_min);

  return (
    <div className="gutter-x text-[15px] leading-[1.6]">
      <header className="sticky top-[env(safe-area-inset-top)] z-10 flex h-[var(--header-h)] items-center justify-between gap-4 border-b border-divider bg-ink">
        <span className="truncate">Philip Ondieki · Lead Queue</span>
        <span className="whitespace-nowrap text-muted tabular-nums">
          {n} of {inPlay} sent
        </span>
      </header>

      <main>
        <Section label="Results" first>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-live="polite">
            <Stat
              label="Interested"
              value={pct(interested, n)}
              sub={`${interested} of ${n} sent`}
              main
            />
            <Stat label="Replied" value={pct(replied, n)} sub={`${replied} of ${n} sent`} />
            <Stat label="Opened link" value={pct(opened, n)} sub={`${opened} of ${n} sent`} />
            <Stat label="Won" value={pct(won, n)} sub={`${won} of ${n} sent`} />
          </div>
          <p className="mt-2 text-[13px] text-muted">Rates are a share of messages sent.</p>
        </Section>

        <Section label="Next send">
          <div
            className={`text-[32px] leading-[1.15] font-medium tracking-[-0.02em] tabular-nums ${queueDone || left <= 0 ? OK : ""}`}
            aria-live="polite"
          >
            {queueDone ? "Queue done" : left <= 0 ? "Ready now" : countdown(left)}
          </div>
          <div className="text-muted">
            {queueDone
              ? "All leads are sent or skipped."
              : left <= 0
                ? "Send the next message whenever you are ready."
                : "Wait until the timer reaches zero, then send the next one."}
          </div>
          <div
            className="mt-4 flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Time between messages"
          >
            {PRESETS.map((p) => {
              const on = p.min === settings.interval_min;
              return (
                <button
                  key={p.min}
                  type="button"
                  aria-pressed={on}
                  onClick={() => void setGap(p.min)}
                  className={on ? btnPrimary : btnSeg}
                >
                  {p.label}
                </button>
              );
            })}
            <label className="inline-flex items-center gap-2 text-muted">
              Custom
              <input
                type="number"
                min={1}
                max={1440}
                inputMode="numeric"
                value={customMin}
                placeholder={presetMatch ? "" : String(settings.interval_min)}
                onChange={(e) => setCustomMin(e.target.value)}
                onBlur={() => {
                  const v = Number(customMin);
                  if (customMin && v >= 1) void setGap(v);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                className={`${field} w-[84px] tabular-nums`}
              />
              min
            </label>
          </div>
        </Section>

        <Section
          label={
            current
              ? `Lead ${queued.findIndex((l) => l.id === current.id) + 1} of ${queued.length} in queue`
              : "Next lead"
          }
        >
          {!current ? (
            <p className="max-w-[60ch] text-muted">
              {inPlay
                ? "Queue done. Every lead is sent or skipped. Update outcomes in the Sent list."
                : "No leads in the queue yet. Find businesses below, then draft a message."}
            </p>
          ) : (
            <div>
              <h2 id="lead-name" className="text-xl leading-[1.4]">
                {current.name}
              </h2>
              <p className="mt-0.5 text-muted">
                {current.type ?? "Business"} · {current.area ?? current.city}
              </p>
              <dl className="mt-6 grid gap-4">
                <div>
                  <dt className="text-muted">Phone</dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-3">
                    <span className="tabular-nums select-all">{current.phone}</span>
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={() => current.phone && void copy(current.phone, "Number copied.")}
                    >
                      Copy number
                    </button>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Before you send</dt>
                  <dd className="mt-1">
                    <GoogleLink lead={current} label="Check Google for a website" />
                  </dd>
                </div>
              </dl>
              <label htmlFor="msg" className="mt-6 block text-muted">
                Message (you can edit it)
              </label>
              <textarea
                id="msg"
                value={messageText}
                onChange={(e) => onMessageInput(e.target.value)}
                onBlur={() => void flushMessage()}
                spellCheck
                className="mt-2 min-h-[230px] w-full resize-y rounded-md border border-divider bg-tile p-4 text-[15px] leading-[1.6] text-fg focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-fg"
              />
              <p className="mt-2 text-[13px] text-muted">{saveNote}</p>
              <div className="mt-5 flex flex-wrap gap-2 [&>*]:max-md:flex-auto">
                <a
                  className={`${btnPrimary} ${current.phone ? "" : "pointer-events-none opacity-35"}`}
                  href={current.phone ? waLink(current.phone, messageText) : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in WhatsApp
                </a>
                <button
                  type="button"
                  className={btn}
                  onClick={() => void copy(messageText, "Message copied.")}
                >
                  Copy message
                </button>
                <button type="button" className={btn} onClick={() => void markSent()}>
                  Mark as sent
                </button>
                <button type="button" className={btnGhost} onClick={() => void skipCurrent()}>
                  Skip: has a website
                </button>
                <button
                  type="button"
                  className={btnGhost}
                  disabled={busy[current.id]}
                  onClick={() => void redraft()}
                >
                  {busy[current.id] ? "Drafting…" : armed ? "Tap again to replace" : "Redraft"}
                </button>
              </div>
              <div role="status" className={`mt-3 min-h-6 ${toast?.err ? "text-[#D9A441]" : OK}`}>
                {toast?.text}
              </div>
            </div>
          )}
          {!current && toast && (
            <div role="status" className={`mt-3 min-h-6 ${toast.err ? "text-[#D9A441]" : OK}`}>
              {toast.text}
            </div>
          )}
        </Section>

        <Section label="Leads">
          <ListHeading label="Queue" count={queued.length} />
          <Rows>
            {queued.map((l) => (
              <li
                key={l.id}
                tabIndex={0}
                onClick={() => pick(l.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    pick(l.id);
                  }
                }}
                className={`${rowCls} cursor-pointer`}
              >
                <RowName lead={l} underline={l.id === current?.id} />
                <span className={chip}>To send</span>
              </li>
            ))}
          </Rows>

          <ListHeading label="Sent" count={sent.length} />
          <Rows>
            {sent.map((l) => {
              const t = tapsBySlug.get(l.slug);
              return (
                <li key={l.id} className={rowCls}>
                  <RowName lead={l} />
                  <span className="flex items-center gap-2">
                    {t?.contact ? (
                      <span className={chip}>Tapped Contact</span>
                    ) : t?.visit ? (
                      <span className={chip}>Opened</span>
                    ) : null}
                    <select
                      aria-label={`Outcome for ${l.name}`}
                      value={l.status}
                      onChange={(e) => void setStatus(l, e.target.value as LeadStatus)}
                      className={`${field} min-h-10 px-2.5`}
                      style={{
                        color:
                          l.status === "interested" || l.status === "won"
                            ? "#3FB27F"
                            : l.status === "not_interested"
                              ? "var(--muted)"
                              : undefined,
                      }}
                    >
                      {OUTCOMES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </span>
                </li>
              );
            })}
          </Rows>

          {skipped.length > 0 && (
            <>
              <ListHeading label="Skipped" count={skipped.length} />
              <Rows>
                {skipped.map((l) => (
                  <li key={l.id} className={rowCls}>
                    <RowName lead={l} />
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={() => void setStatus(l, l.message ? "queued" : "new")}
                    >
                      Return to queue
                    </button>
                  </li>
                ))}
              </Rows>
            </>
          )}
        </Section>

        <Section label="Find">
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void find();
            }}
          >
            <label className="flex flex-col gap-1 text-muted">
              City
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`${field} w-44`}
              />
            </label>
            <label className="flex flex-col gap-1 text-muted">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryKey)}
                className={field}
              >
                {CATEGORY_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {CATEGORIES[k].label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className={btnPrimary}
              disabled={findNote === "Searching OpenStreetMap…"}
            >
              Find businesses
            </button>
          </form>
          <p role="status" className="mt-3 min-h-6 text-muted">
            {findNote}
          </p>

          <ListHeading label="New" count={fresh.length} />
          <Rows>
            {fresh.map((l) => (
              <li key={l.id} className={`${rowCls} max-md:grid-cols-1`}>
                <span className="min-w-0">
                  <span className="block truncate">{l.name}</span>
                  <span className="text-[13px] text-muted">
                    {l.type ?? "Business"} · {l.area ?? l.city} ·{" "}
                    <GoogleLink lead={l} label="Check Google" />
                  </span>
                </span>
                <span className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={btn}
                    disabled={busy[l.id]}
                    onClick={() => void runDraft(l)}
                  >
                    {busy[l.id] ? "Drafting…" : "Draft message"}
                  </button>
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => void setStatus(l, "skipped")}
                  >
                    Skip: has a website
                  </button>
                </span>
              </li>
            ))}
          </Rows>
        </Section>

        <Section label="Rules">
          <div className="max-w-[62ch] [&>p]:mb-2">
            <p>
              Send each message yourself, one at a time, from your own WhatsApp. Never bulk-send.
            </p>
            <p>
              If someone says no, or does not reply after one follow-up, stop and mark them Not
              interested.
            </p>
            <p>Only mention facts you checked. If Google shows a website, skip the lead.</p>
          </div>
        </Section>
      </main>

      <footer className="flex justify-between border-t border-divider pt-5 pb-[calc(40px+env(safe-area-inset-bottom))] text-muted">
        <span>Data: © OpenStreetMap contributors</span>
      </footer>
    </div>
  );
}

const rowCls =
  "grid min-h-[52px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-divider py-1.5 first:border-t";

function Section({
  label,
  children,
  first = false,
}: {
  readonly label: string;
  readonly children: ReactNode;
  readonly first?: boolean;
}) {
  return (
    <>
      {!first && (
        <div aria-hidden="true" className="flex gap-4">
          <span className="h-px flex-1 bg-divider md:w-[calc(var(--col-left)-16px)] md:flex-none" />
          <span className="hidden h-px flex-1 bg-divider md:block" />
        </div>
      )}
      <section
        className={`grid pb-14 md:grid-cols-[var(--col-left)_minmax(0,1fr)] md:pb-[72px] ${first ? "pt-10 md:pt-16" : "pt-5"}`}
      >
        <div className="mb-3 text-muted md:mb-0">{label}</div>
        <div className="min-w-0">{children}</div>
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  sub,
  main = false,
}: {
  readonly label: string;
  readonly value: string;
  readonly sub: string;
  readonly main?: boolean;
}) {
  return (
    <div className="min-w-0 border-t border-divider pt-3">
      <div className="text-muted">{label}</div>
      <div
        className={`text-[28px] leading-[1.15] font-medium tracking-[-0.02em] tabular-nums ${main ? OK : ""}`}
      >
        {value}
      </div>
      <div className="text-[13px] text-muted tabular-nums">{sub}</div>
    </div>
  );
}

function ListHeading({ label, count }: { readonly label: string; readonly count: number }) {
  return (
    <h3 className="mt-8 mb-2 text-[15px] font-normal text-muted first:mt-0">
      {label} ({count})
    </h3>
  );
}

function Rows({ children }: { readonly children: ReactNode }) {
  return <ul className="m-0 list-none p-0">{children}</ul>;
}

function RowName({
  lead,
  underline = false,
}: {
  readonly lead: Lead;
  readonly underline?: boolean;
}) {
  return (
    <span
      className={`min-w-0 truncate ${underline ? "underline decoration-1 underline-offset-4" : ""}`}
    >
      {lead.name}
      <small className="ml-2 text-[13px] text-muted">{lead.area ?? lead.city}</small>
    </span>
  );
}

function GoogleLink({ lead, label }: { readonly lead: Lead; readonly label: string }) {
  const q = `${lead.name} ${lead.city ?? ""}`.trim();
  return (
    <a
      href={`https://www.google.com/search?q=${encodeURIComponent(q)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted underline decoration-1 underline-offset-[3px]"
    >
      {label}
    </a>
  );
}

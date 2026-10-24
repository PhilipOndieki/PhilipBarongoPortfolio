"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { btn, btnPrimary, field } from "./styles";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  async function post(url: string, body: object) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  }

  async function sendLink(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await post("/api/auth/login", { email });
    setBusy(false);
    setNote(r.message ?? "Something went wrong. Try again.");
    if (r.ok) setSent(true);
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await post("/api/auth/verify", { email, token: code });
    setBusy(false);
    if (r.ok) router.replace("/admin/leads");
    else setNote(r.message ?? "That code did not work.");
  }

  return (
    <div className="max-w-md text-[15px] leading-[1.6]">
      <form onSubmit={sendLink} className="flex flex-col gap-3">
        <label htmlFor="email" className="text-muted">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
        />
        <button type="submit" disabled={busy} className={btnPrimary}>
          Send login link
        </button>
      </form>

      {sent && (
        <form onSubmit={verify} className="mt-8 flex flex-col gap-3">
          <label htmlFor="code" className="text-muted">
            Or type the code from the email
          </label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={field}
          />
          <button type="submit" disabled={busy} className={btn}>
            Sign in with code
          </button>
        </form>
      )}

      <p role="status" className="mt-4 min-h-6 text-muted">
        {note}
      </p>
    </div>
  );
}

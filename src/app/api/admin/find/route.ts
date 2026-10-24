import { NextResponse } from "next/server";
import { z } from "zod";
import { CATEGORIES, CATEGORY_KEYS, typeLabel } from "@/lib/leads/categories";
import { cleanPhone, uniqueSlug } from "@/lib/leads/format";
import { getAdmin } from "@/lib/supabase/server";

export const maxDuration = 60;

const Body = z.object({
  city: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[\p{L} '\-]+$/u),
  category: z.enum(CATEGORY_KEYS),
});

const SERVERS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];
const UA = "philipondieki-lead-finder/1.0 (contact: philipbarongo30@gmail.com)";
/** Stop trying new servers after this, so the route ends inside maxDuration. */
const BUDGET_MS = 54_000;

interface OsmElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function buildQuery(city: string, filters: readonly string[]): string {
  const name = city.replace(/["\\]/g, "");
  const parts = filters
    .map((f) => `${f}["name"][!"website"][!"contact:website"][!"url"](area.a);`)
    .join("");
  return `[out:json][timeout:25];area["name"="${name}"]["boundary"="administrative"]->.a;(${parts});out center tags;`;
}

async function overpass(query: string): Promise<OsmElement[] | null> {
  const start = Date.now();
  for (const server of SERVERS) {
    const left = BUDGET_MS - (Date.now() - start);
    if (left < 5_000) break;
    try {
      const res = await fetch(server, {
        method: "POST",
        headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(Math.min(28_000, left)),
        cache: "no-store",
      });
      if (!res.ok) continue;
      const json = (await res.json()) as { elements?: OsmElement[] };
      return json.elements ?? [];
    } catch {
      // Busy or slow: try the next server.
    }
  }
  return null;
}

export async function POST(request: Request) {
  const db = await getAdmin();
  if (!db) return NextResponse.json({ message: "Not signed in." }, { status: 401 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Use a city name with letters, spaces or hyphens only." },
      { status: 400 },
    );
  }
  const { city, category } = parsed.data;
  const cc = process.env.WHATSAPP_COUNTRY_CODE || "254";

  const elements = await overpass(buildQuery(city, CATEGORIES[category].filters));
  if (!elements) {
    return NextResponse.json(
      { message: "OpenStreetMap is busy. Try again in a few minutes." },
      { status: 503 },
    );
  }

  // Everything already stored, page by page (Supabase returns 1,000 rows at most).
  const slugs = new Set<string>();
  const osmIds = new Set<string>();
  const namePhone = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from("leads")
      .select("slug,name,phone,osm_id")
      .range(from, from + 999);
    if (error) return NextResponse.json({ message: "Could not read your leads." }, { status: 500 });
    for (const row of data ?? []) {
      slugs.add(row.slug as string);
      if (row.osm_id) osmIds.add(row.osm_id as string);
      namePhone.add(`${String(row.name).toLowerCase()}|${row.phone ?? ""}`);
    }
    if (!data || data.length < 1000) break;
  }

  let found = 0;
  const rows: Record<string, string | null>[] = [];
  for (const el of elements) {
    const t = el.tags ?? {};
    const name = (t.name ?? "").trim();
    const phone = cleanPhone(t.phone || t["contact:phone"] || t["contact:mobile"], cc);
    if (!name || !phone) continue;
    found++;
    const osmId = `${el.type}/${el.id}`;
    const key = `${name.toLowerCase()}|${phone}`;
    if (osmIds.has(osmId) || namePhone.has(key)) {
      continue;
    }
    osmIds.add(osmId);
    namePhone.add(key);
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    rows.push({
      slug: uniqueSlug(name, slugs),
      name,
      type: typeLabel(t),
      area: t["addr:suburb"] || t["addr:street"] || city,
      city,
      phone,
      email: t.email || t["contact:email"] || null,
      address:
        ["addr:housenumber", "addr:street", "addr:suburb", "addr:city"]
          .map((k) => t[k])
          .filter(Boolean)
          .join(", ") || null,
      map_url:
        lat !== undefined && lon !== undefined
          ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=19/${lat}/${lon}`
          : null,
      osm_id: osmId,
      status: "new",
    });
  }

  let added = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { data, error } = await db
      .from("leads")
      .upsert(chunk, { onConflict: "osm_id", ignoreDuplicates: true })
      .select("id");
    if (error)
      return NextResponse.json({ message: "Could not save the new leads." }, { status: 500 });
    added += data?.length ?? 0;
  }

  return NextResponse.json({ found, added, skipped: found - added });
}

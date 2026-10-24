/**
 * Imports leads into Supabase. Upserts on slug, so it is safe to run twice.
 *
 *   npm run import-leads -- scripts/leads-import.json
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * Keep the JSON file out of git: this repo is public.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { z } from "zod";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Fall back to variables already in the shell.
}

const File = z.object({
  city: z.string().min(1),
  settings: z
    .object({
      interval_min: z.number().int().min(1).max(1440),
      last_sent_at: z.string().nullish(),
    })
    .optional(),
  leads: z
    .array(
      z.object({
        slug: z.string().regex(/^[a-z0-9-]{1,80}$/),
        name: z.string().min(1),
        type: z.string().nullish(),
        area: z.string().nullish(),
        phone: z.string().nullish(),
        message: z.string().nullish(),
        sort_order: z.number().int(),
        status: z.enum([
          "new",
          "queued",
          "sent",
          "replied",
          "interested",
          "won",
          "not_interested",
          "skipped",
        ]),
        sent_at: z.string().nullish(),
      }),
    )
    .min(1),
});

const path = process.argv[2];
if (!path) {
  console.error("Usage: npm run import-leads -- <file.json>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}

const parsed = File.safeParse(JSON.parse(readFileSync(path, "utf8")));
if (!parsed.success) {
  console.error("The file does not match the expected shape:", parsed.error.issues[0]);
  process.exit(1);
}

const { city, leads, settings } = parsed.data;
const rows = leads.map((l) => ({ ...l, city }));
const db = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await db.from("leads").upsert(rows, { onConflict: "slug" }).select("slug");
if (error) {
  console.error("Import failed:", error.message);
  process.exit(1);
}
console.log(`Imported ${data?.length ?? 0} leads.`);

if (settings) {
  const { error: settingsError } = await db.from("settings").update(settings).eq("id", 1);
  if (settingsError) {
    console.error("Settings update failed:", settingsError.message);
    process.exit(1);
  }
  console.log(`Settings updated: ${settings.interval_min} min gap.`);
}

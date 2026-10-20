import { redirect } from "next/navigation";
import { LeadsApp } from "@/components/admin/LeadsApp";
import { LEAD_COLUMNS, type Lead, type Settings, type Tap } from "@/lib/leads/types";
import { getAdmin } from "@/lib/supabase/server";

// Always read fresh data with the signed-in session.
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const db = await getAdmin();
  if (!db) redirect("/admin/login");

  const leads: Lead[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await db
      .from("leads")
      .select(LEAD_COLUMNS)
      .order("sort_order")
      .range(from, from + 999);
    leads.push(...((data ?? []) as Lead[]));
    if (!data || data.length < 1000) break;
  }

  const [{ data: settings }, { data: taps }] = await Promise.all([
    db.from("settings").select("id,interval_min,last_sent_at").eq("id", 1).maybeSingle(),
    db.from("taps").select("id,slug,kind,created_at").limit(10000),
  ]);

  return (
    <LeadsApp
      initialLeads={leads}
      initialSettings={
        (settings as Settings | null) ?? { id: 1, interval_min: 60, last_sent_at: null }
      }
      initialTaps={(taps ?? []) as Tap[]}
    />
  );
}

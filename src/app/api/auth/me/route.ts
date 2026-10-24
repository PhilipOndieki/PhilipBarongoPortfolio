import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Tells the header whether the visitor is the signed-in admin. */
export async function GET() {
  const admin = Boolean(await getAdmin());
  return NextResponse.json({ admin }, { headers: { "Cache-Control": "no-store" } });
}

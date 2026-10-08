import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });
  const supabase = createClient(url, key);
  const { data, error } = await supabase.rpc("keep_alive");
  return NextResponse.json({ ok: !error, result: data ?? null, error: error?.message ?? null });
}

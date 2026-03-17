import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const db = getDb();
  // simple sanity query to confirm the connection is usable
  const row = db.prepare("SELECT 1 as ok").get() as { ok: number } | undefined;
  return NextResponse.json({ ok: row?.ok === 1 });
}

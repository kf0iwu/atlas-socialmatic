import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import crypto from "node:crypto";

export const runtime = "nodejs";

const PREVIEW_LEN = 160;

function safeJsonParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

function makePreview(outputsJson: string | null): string {
  const outputs = safeJsonParse<Record<string, { text?: string }>>(outputsJson);
  if (!outputs) return "";
  const first = Object.values(outputs).find((v) => typeof v?.text === "string" && v.text.trim().length > 0);
  if (!first?.text) return "";
  return first.text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, PREVIEW_LEN);
}

function isMeaningful(body: any): boolean {
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";
  const platforms = Array.isArray(body?.platforms) ? body.platforms : [];
  const outputs = body?.outputs && typeof body.outputs === "object" ? Object.keys(body.outputs).length : 0;
  const hooks = body?.hooks && typeof body.hooks === "object" ? Object.keys(body.hooks).length : 0;
  const packs = body?.hashtag_packs && typeof body.hashtag_packs === "object" ? Object.keys(body.hashtag_packs).length : 0;

  return topic.length > 0 || platforms.length > 0 || outputs > 0 || hooks > 0 || packs > 0;
}

export async function GET() {
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT id, created_at, updated_at, topic, platforms, outputs
       FROM drafts
       ORDER BY updated_at DESC`
    )
    .all() as Array<{
      id: string;
      created_at: number;
      updated_at: number;
      topic: string;
      platforms: string;
      outputs: string | null;
    }>;

  const drafts = rows.map((r) => ({
    id: r.id,
    created_at: r.created_at,
    updated_at: r.updated_at,
    topic: r.topic,
    platforms: safeJsonParse<string[]>(r.platforms) ?? [],
    preview: makePreview(r.outputs),
  }));

  return NextResponse.json({ drafts });
}

export async function POST(req: Request) {
  const db = getDb();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isMeaningful(body)) {
    return NextResponse.json({ error: "empty_draft_not_allowed" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const now = Date.now();

  const topic = typeof body.topic === "string" ? body.topic : "";
  const audience = typeof body.audience === "string" ? body.audience : null;
  const tone = typeof body.tone === "string" ? body.tone : null;
  const length_tier = typeof body.length_tier === "string" ? body.length_tier : null;

  const platformsArr = Array.isArray(body.platforms) ? body.platforms : [];
  const platforms = JSON.stringify(platformsArr);

  const outputs = body.outputs ? JSON.stringify(body.outputs) : null;
  const hooks = body.hooks ? JSON.stringify(body.hooks) : null;
  const hashtag_packs = body.hashtag_packs ? JSON.stringify(body.hashtag_packs) : null;
  const meta = body.meta ? JSON.stringify(body.meta) : null;

  db.prepare(
    `INSERT INTO drafts
      (id, created_at, updated_at, topic, audience, tone, length_tier, platforms, outputs, hooks, hashtag_packs, meta)
     VALUES
      (?,  ?,         ?,         ?,     ?,        ?,    ?,           ?,         ?,       ?,     ?,            ?)`
  ).run(
    id,
    now,
    now,
    topic,
    audience,
    tone,
    length_tier,
    platforms,
    outputs,
    hooks,
    hashtag_packs,
    meta
  );

  const draft = {
    id,
    created_at: now,
    updated_at: now,
    topic,
    audience,
    tone,
    length_tier,
    platforms: platformsArr,
    outputs: body.outputs ?? null,
    hooks: body.hooks ?? null,
    hashtag_packs: body.hashtag_packs ?? null,
    meta: body.meta ?? null,
  };

  return NextResponse.json({ draft }, { status: 201 });
}

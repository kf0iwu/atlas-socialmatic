"use client";

/**
 * Atlas-Socialmatic UI (single page)
 *
 * This file is intentionally organized into:
 *  1) Types/constants
 *  2) Small UI helpers (Copy button, selects)
 *  3) History helpers (localStorage)
 *  4) Main component:
 *     - State (search for: // --- STATE ---)
 *     - Handlers (search for: // --- HANDLERS ---)
 *     - Render
 */

import { useEffect, useMemo, useState } from "react";

/* =========================
 * 1) Types + constants
 * ========================= */

type LengthTier = "short" | "medium" | "long";
type Platform = "linkedin" | "x" | "instagram" | "threads" | "blog";

type Posts = Partial<
  Record<Exclude<Platform, "blog">, string[]> & { blog: string }
>;

type TopicIdea = {
  topic: string;
  angle?: string;
  why?: string;
  keywords?: string[];
};

type HistoryItem = {
  id: string;
  ts: number;
  topic: string;
  audience: string;
  tone: string;
  focus: string;
  platforms: Platform[];
  lengths: Record<string, LengthTier>;
  posts: Posts;
};

const PLATFORM_LABELS: Record<Platform, string> = {
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  threads: "Threads",
  blog: "Blog Post",
};

const ORDERED_PLATFORMS: Platform[] = [
  "linkedin",
  "x",
  "instagram",
  "threads",
  "blog",
];

const DEFAULT_PLATFORMS: Platform[] = ["linkedin", "x", "instagram", "threads"];

const HISTORY_KEY = "atlas_socialmatic_history_v2";
const HISTORY_LIMIT = 20;

/* =========================
 * 2) Small UI helpers
 * ========================= */

function cls(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="text-xs border rounded px-2 py-1 hover:bg-slate-50"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      type="button"
      title="Copy to clipboard"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

function LengthSelect({
  value,
  onChange,
}: {
  value: LengthTier;
  onChange: (v: LengthTier) => void;
}) {
  return (
    <select
      className="border rounded px-2 py-1 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value as LengthTier)}
    >
      <option value="short">Short</option>
      <option value="medium">Medium</option>
      <option value="long">Long</option>
    </select>
  );
}

function PlatformCard({
  platform,
  title,
  items,
  blog,
  onRegenerate,
}: {
  platform: Platform;
  title: string;
  items?: string[];
  blog?: string;
  onRegenerate: () => void;
}) {
  const hasArray = !!items?.length;
  const hasBlog = typeof blog === "string" && blog.trim().length > 0;
  if (!hasArray && !hasBlog) return null;

  return (
    <section className="border rounded-xl p-4 space-y-3 bg-white">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          className="text-xs border rounded px-2 py-1 hover:bg-slate-50"
          onClick={onRegenerate}
          type="button"
        >
          Regenerate
        </button>
      </div>

      {hasArray && (
        <div className="space-y-3">
          {items!.map((txt, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-3 bg-slate-50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-700">
                  Variant {idx + 1}
                </div>
                <CopyButton text={txt} />
              </div>
              <pre className="text-sm whitespace-pre-wrap font-sans">{txt}</pre>
            </div>
          ))}
        </div>
      )}

      {hasBlog && (
        <div className="border rounded-lg p-3 bg-slate-50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-700">Blog Draft</div>
            <CopyButton text={blog!} />
          </div>
          <pre className="text-sm whitespace-pre-wrap font-sans">{blog}</pre>
        </div>
      )}
    </section>
  );
}

/* =========================
 * 3) History helpers (localStorage)
 * ========================= */

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryItem[];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(items.slice(0, HISTORY_LIMIT))
  );
}

function defaultLengths(): Record<string, LengthTier> {
  return {
    linkedin: "medium",
    x: "medium",
    instagram: "medium",
    threads: "medium",
    blog: "medium",
  };
}

/* =========================
 * 4) Main component
 * ========================= */

export default function Home() {
  // --- STATE ---
  // These are the fields the user can edit.
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Friendly");

  // NEW: "Focus / Domain" field used for topic suggestions
  const [focus, setFocus] = useState(
    "ISO 14971 medical device risk management consultancy"
  );

  // Platform selection + per-platform length tiers
  const [platforms, setPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS);
  const [lengths, setLengths] = useState<Record<string, LengthTier>>(
    defaultLengths()
  );

  // Outputs and errors
  const [busy, setBusy] = useState(false);
  const [posts, setPosts] = useState<Posts | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Topic suggestion outputs
  const [topicBusy, setTopicBusy] = useState(false);
  const [topicIdeas, setTopicIdeas] = useState<TopicIdea[] | null>(null);

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(true);

  // Derived enable/disable conditions
  const canGenerate = useMemo(
    () => topic.trim().length >= 3 && platforms.length > 0,
    [topic, platforms]
  );

  const canSuggestTopics = useMemo(
    () => focus.trim().length >= 5,
    [focus]
  );

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // --- HANDLERS ---
  // Small helper to keep platform ordering stable.
  function togglePlatform(p: Platform) {
    setPlatforms((prev) => {
      const has = prev.includes(p);
      const next = has ? prev.filter((x) => x !== p) : [...prev, p];
      return ORDERED_PLATFORMS.filter((x) => next.includes(x));
    });
  }

  function setPlatformLength(p: Platform, v: LengthTier) {
    setLengths((prev) => ({ ...prev, [p]: v }));
  }

  // Calls your existing generator endpoint.
  // If requested.length > 1, we also snapshot the result into history.
  async function callGenerate(requested: Platform[]) {
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          audience,
          tone,
          platforms: requested,
          lengths,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Request failed");

      if (data?.posts) {
        const newPosts = data.posts as Posts;

        // Merge results (so regen updates only one platform)
        setPosts((prev) => ({ ...(prev ?? {}), ...newPosts }));

        // Save to history when generating multiple platforms at once
        if (requested.length > 1) {
          const item: HistoryItem = {
            id: uid(),
            ts: Date.now(),
            topic,
            audience,
            tone,
            focus,
            platforms: requested,
            lengths,
            posts: newPosts,
          };

          setHistory((prev) => {
            const next = [item, ...prev].slice(0, HISTORY_LIMIT);
            saveHistory(next);
            return next;
          });
        }
      } else if (data?.raw) {
        setError(String(data.raw));
      } else {
        setError("No structured output returned.");
      }
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  function generateAllSelected() {
    setPosts(null);
    callGenerate(platforms);
  }

  function regenerateOne(p: Platform) {
    callGenerate([p]);
  }

  // NEW: suggest topics endpoint.
  async function suggestTopics() {
    setTopicBusy(true);
    setError(null);
    setTopicIdeas(null);

    try {
      const res = await fetch("/api/suggest-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focus,
          platform: "linkedin",
          audience,
          tone,
          count: 12,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Suggest topics failed");

      if (data?.topics) {
        setTopicIdeas(data.topics as TopicIdea[]);
      } else if (data?.raw) {
        setError(String(data.raw));
      } else {
        setError("No topics returned.");
      }
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setTopicBusy(false);
    }
  }

  function loadFromHistory(item: HistoryItem) {
    setTopic(item.topic);
    setAudience(item.audience);
    setTone(item.tone);
    setFocus(item.focus ?? focus);
    setPlatforms(item.platforms);
    setLengths(item.lengths);
    setPosts(item.posts);
  }

  function clearHistory() {
    saveHistory([]);
    setHistory([]);
  }

  /* =========================
   * Render
   * ========================= */

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto p-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold">Atlas-Socialmatic</h1>
            <p className="text-slate-600">
              Generate platform-ready drafts, with topic suggestions, per-platform length,
              regeneration, and local history.
            </p>
          </header>

          {/* Inputs */}
          <section className="border rounded-xl p-4 bg-white space-y-5">
            {/* Topic Suggestions */}
            <div className="space-y-1">
              <label className="font-medium">Topic Focus / Domain</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="e.g., ISO 14971 medical device risk management consultancy"
              />
              <div className="flex items-center gap-3 pt-2">
                <button
                  className="text-sm border rounded px-3 py-2 hover:bg-slate-50 disabled:opacity-50"
                  onClick={suggestTopics}
                  disabled={topicBusy || !canSuggestTopics}
                  type="button"
                >
                  {topicBusy ? "Suggesting..." : "Suggest Topics"}
                </button>
                <span className="text-xs text-slate-500">
                  Click a suggestion below to populate the Topic field.
                </span>
              </div>
            </div>

            {topicIdeas && (
              <div className="border rounded-xl p-4 bg-slate-50 space-y-2">
                <div className="font-medium">Suggested Topics</div>
                <div className="space-y-2">
                  {topicIdeas.map((t, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left border rounded-lg p-3 bg-white hover:bg-slate-50"
                      onClick={() => {
                        setTopic(t.topic);
                        // optional: clear list after picking
                        // setTopicIdeas(null);
                      }}
                      type="button"
                    >
                      <div className="text-sm font-semibold">{t.topic}</div>
                      {t.angle && (
                        <div className="text-sm text-slate-700 mt-1">{t.angle}</div>
                      )}
                      {t.why && (
                        <div className="text-xs text-slate-500 mt-1">{t.why}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Core inputs */}
            <div className="grid gap-3">
              <div className="space-y-1">
                <label className="font-medium">Topic</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Common ISO 14971 mistakes that create audit findings"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium">Audience</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g., medical device QA/RA leaders"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium">Tone</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option>Professional</option>
                  <option>Friendly</option>
                  <option>Bold</option>
                  <option>Playful</option>
                </select>
              </div>
            </div>

            {/* Platform selection + per-platform length */}
            <div className="space-y-2">
              <div className="font-medium">Platforms</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {ORDERED_PLATFORMS.map((p) => {
                  const checked = platforms.includes(p);
                  return (
                    <div
                      key={p}
                      className={cls(
                        "flex items-center justify-between gap-3 border rounded-lg px-3 py-2",
                        checked ? "bg-slate-50" : "bg-white"
                      )}
                    >
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePlatform(p)}
                        />
                        {PLATFORM_LABELS[p]}
                      </label>

                      <div className={cls("flex items-center gap-2", !checked && "opacity-40")}>
                        <span className="text-xs text-slate-500">Length</span>
                        <LengthSelect
                          value={lengths[p] ?? "medium"}
                          onChange={(v) => setPlatformLength(p, v)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-slate-500">
                Social platforms return 3 variants; Blog returns a single markdown draft.
              </div>
            </div>

            {/* Generate */}
            <div className="flex items-center gap-3">
              <button
                className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
                onClick={generateAllSelected}
                disabled={busy || !canGenerate}
                type="button"
              >
                {busy ? "Generating..." : "Generate Selected"}
              </button>

              {!canGenerate && (
                <span className="text-sm text-slate-500">
                  Enter a topic and select at least one platform
                </span>
              )}
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                {error}
              </div>
            )}
          </section>

          {/* Outputs */}
          {posts && (
            <div className="grid gap-4">
              <PlatformCard
                platform="linkedin"
                title="LinkedIn"
                items={posts.linkedin}
                onRegenerate={() => regenerateOne("linkedin")}
              />
              <PlatformCard
                platform="x"
                title="X"
                items={posts.x}
                onRegenerate={() => regenerateOne("x")}
              />
              <PlatformCard
                platform="instagram"
                title="Instagram"
                items={posts.instagram}
                onRegenerate={() => regenerateOne("instagram")}
              />
              <PlatformCard
                platform="threads"
                title="Threads"
                items={posts.threads}
                onRegenerate={() => regenerateOne("threads")}
              />
              <PlatformCard
                platform="blog"
                title="Blog Post"
                blog={posts.blog}
                onRegenerate={() => regenerateOne("blog")}
              />
            </div>
          )}
        </div>

        {/* History sidebar */}
        <aside className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">History</h2>
            <button
              className="text-xs border rounded px-2 py-1 hover:bg-slate-50"
              onClick={() => setShowHistory((v) => !v)}
              type="button"
            >
              {showHistory ? "Hide" : "Show"}
            </button>
          </div>

          {showHistory && (
            <div className="border rounded-xl bg-white p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Stored locally in this browser (max {HISTORY_LIMIT})
                </div>
                <button
                  className="text-xs border rounded px-2 py-1 hover:bg-slate-50"
                  onClick={clearHistory}
                  type="button"
                  disabled={history.length === 0}
                >
                  Clear
                </button>
              </div>

              {history.length === 0 ? (
                <div className="text-sm text-slate-600">No history yet.</div>
              ) : (
                <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
                  {history.map((h) => (
                    <button
                      key={h.id}
                      className="w-full text-left border rounded-lg p-3 hover:bg-slate-50"
                      onClick={() => loadFromHistory(h)}
                      type="button"
                    >
                      <div className="text-sm font-medium line-clamp-2">
                        {h.topic || "(no topic)"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(h.ts).toLocaleString()} •{" "}
                        {h.platforms.map((p) => PLATFORM_LABELS[p]).join(", ")}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
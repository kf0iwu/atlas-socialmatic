"use client";

/*
Atlas-Socialmatic
Copyright (C) 2026 David Grilli

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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

type HashtagSize = "small" | "medium" | "large";

type HashtagPack = {
  broad: string[];
  niche: string[];
  longtail: string[];
  mixed_line?: string; // Adding grouped + mixed line functionality (Sprint 3)
};

type Meta = {
  linkedin_hooks?: string[];
  hashtag_packs?: Partial<Record<"instagram" | "linkedin", HashtagPack>>;
};

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

type DraftListItem = {  //Sprint 4 - Issue #6
  id: string;
  created_at: number;
  updated_at: number;
  topic: string;
  platforms: Platform[];
  preview: string;
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


/* function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryItem[];
  } catch {
    return [];
  }
} *///Removed for Sprint 4 Issue #6

/* function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(items.slice(0, HISTORY_LIMIT)),
  );
} *///Removed for Sprint 4 Issue #6

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
    "ISO 14971 medical device risk management consultancy",
  );

  // Platform selection + per-platform length tiers
  const [platforms, setPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS);
  const [lengths, setLengths] =
    useState<Record<string, LengthTier>>(defaultLengths());

  // Outputs and errors
  const [busy, setBusy] = useState(false);
  const [posts, setPosts] = useState<Posts | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Topic suggestion outputs
  const [topicBusy, setTopicBusy] = useState(false);
  const [topicIdeas, setTopicIdeas] = useState<TopicIdea[] | null>(null);

  // --- Draft persistence tracking (Issue #23) ---
// When a draft is auto-created during generation we store its ID here.
// After intelligence runs we PATCH the same draft with hooks/hashtags.
const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  // History (DB-backed) - Sprint 4, Issue #6
  const [history, setHistory] = useState<DraftListItem[]>([]);
  const [historyBusy, setHistoryBusy] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);

  // Derived enable/disable conditions
  const canGenerate = useMemo(
    () => topic.trim().length >= 3 && platforms.length > 0,
    [topic, platforms],
  );

  const canSuggestTopics = useMemo(() => focus.trim().length >= 5, [focus]);

  // -- Sprint 4, Issue #6 --
  useEffect(() => {
    let cancelled = false;

    async function loadDbHistory() {
      setHistoryBusy(true);
      setHistoryError(null);

      try {
        const res = await fetch("/api/drafts", { method: "GET" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Failed to load history");

        const drafts = Array.isArray(data?.drafts) ? data.drafts : [];
        if (!cancelled) setHistory(drafts as DraftListItem[]);
      } catch (e: any) {
        if (!cancelled) setHistoryError(e?.message ?? String(e));
      } finally {
        if (!cancelled) setHistoryBusy(false);
      }
    }

    loadDbHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Intelligence (Sprint 3) ---
  const [meta, setMeta] = useState<Meta | null>(null);

  const [enableHooks, setEnableHooks] = useState(true);
  const [hookCount, setHookCount] = useState(5);

  const [enableHashtags, setEnableHashtags] = useState(false);
  const [hashtagSize, setHashtagSize] = useState<HashtagSize>("medium");
  const [hashtagPlatforms, setHashtagPlatforms] = useState<
    ("instagram" | "linkedin")[]
  >(["instagram"]);

  const [intelBusy, setIntelBusy] = useState(false);

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

        // Auto-save to DB and refresh history sidebar
        if (requested.length > 1) {
          fetch("/api/drafts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic,
              audience,
              tone,
              platforms: requested,
              outputs: newPosts,
              meta: { lengths },
            }),
          })
            .then((r) => r.json())
            .then((d) => {
              // Store the draft ID so intelligence results can update it later
              if (d?.id) {
                setCurrentDraftId(d.id);
              }

              return fetch("/api/drafts");
            })
            .then((r) => r.json())
            .then((d) => {
              if (Array.isArray(d?.drafts)) {
                setHistory(d.drafts as DraftListItem[]);
              }
            })
            .catch(() => {
              // Non-fatal: generation succeeded; history will refresh on next load
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

  async function generateAllSelected() {
    setPosts(null);
    setMeta(null); // optional: clear old intel when starting fresh
    await callGenerate(platforms);

    // Only run intelligence if user enabled it
    if ((enableHooks || enableHashtags) && topic.trim().length >= 3) {
      await runIntel();
    }
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

/*   function clearHistory() {
    saveHistory([]);
    setHistory([]);
  } *///Removed for Sprint 4 Issue #6

  // Sprint 3 hashtag toggle
  function toggleHashtagPlatform(p: "instagram" | "linkedin") {
    setHashtagPlatforms((prev) => {
      const has = prev.includes(p);
      const next = has ? prev.filter((x) => x !== p) : [...prev, p];
      return next.length ? next : ["instagram"]; // never allow empty
    });
  }

  //Sprint 3 intel caller
  async function runIntel(opts?: {
    hooksOnly?: boolean;
    hashtagsOnly?: boolean;
  }) {
    setIntelBusy(true);
    setError(null);

    try {
      const hooksOnly = !!opts?.hooksOnly;
      const hashtagsOnly = !!opts?.hashtagsOnly;

      // Make the "only" modes mutually exclusive + credit-safe
      const generate_hooks = hooksOnly
        ? true
        : hashtagsOnly
          ? false
          : enableHooks;
      const generate_hashtags = hashtagsOnly
        ? true
        : hooksOnly
          ? false
          : enableHashtags;

      const res = await fetch("/api/intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          audience,
          tone,

          generate_hooks,
          hook_count: hookCount,

          generate_hashtags,
          hashtag_size: hashtagSize,
          hashtag_platforms: hashtagPlatforms,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Intel request failed");

      if (data?.meta) {
        const incoming = data.meta as Partial<Meta>;

        setMeta((prev) => {
          const next = { ...(prev ?? {}) };

          if (incoming.linkedin_hooks !== undefined) {
            next.linkedin_hooks = incoming.linkedin_hooks;
          }

          if (incoming.hashtag_packs !== undefined) {
            next.hashtag_packs = incoming.hashtag_packs;
          }

          return next;
        });

        // Issue #23: persist intelligence results back onto the existing draft
        if (currentDraftId) {
          fetch(`/api/drafts/${currentDraftId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic,
              audience,
              tone,
              platforms,
              outputs: posts ?? {},
              hooks: incoming.linkedin_hooks ?? null,
              hashtag_packs: incoming.hashtag_packs ?? null,
              meta: {
                lengths,
                enableHooks,
                hookCount,
                enableHashtags,
                hashtagSize,
                hashtagPlatforms,
              },
            }),
          }).catch(() => {
            // Non-fatal: UI still shows intel results even if persistence fails
          });
        }
      } else if (data?.raw) {
        setError(String(data.raw));
      } else {
        setError("No intel returned.");
      }
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setIntelBusy(false);
    }
  }

  async function deleteDraft(id: string) {
    if (!window.confirm("Delete this draft?")) return;
    try {
      const res = await fetch(`/api/drafts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch {
      // Non-fatal; draft remains in sidebar until next reload
    }
  }

  async function loadDraft(id: string) {
    if (
      (posts !== null || topic.trim() !== "") &&
      !window.confirm("Load this draft? Your current work will be replaced.")
    ) return;

    try {
      const res = await fetch(`/api/drafts/${id}`);
      if (!res.ok) throw new Error("Failed to load draft");
      const { draft } = await res.json();
      if (!draft) return;

      setTopic(draft.topic ?? "");
      setAudience(draft.audience ?? "");
      setTone(draft.tone ?? "Friendly");
      setPlatforms((draft.platforms as Platform[]) ?? DEFAULT_PLATFORMS);
      setLengths({
        ...defaultLengths(),
        ...((draft.meta?.lengths as Record<string, LengthTier> | undefined) ?? {}),
      });
      setPosts((draft.outputs as Posts) ?? null);
      setError(null);
      setTopicIdeas(null);

      const linkedin_hooks = Array.isArray(draft.hooks) ? draft.hooks : undefined;
      const hashtag_packs =
        draft.hashtag_packs && typeof draft.hashtag_packs === "object"
          ? draft.hashtag_packs
          : undefined;
      setMeta(linkedin_hooks || hashtag_packs ? { linkedin_hooks, hashtag_packs } : null);
    } catch {
      // Non-fatal; editor state unchanged on failure
    }
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
              Generate platform-ready drafts, with topic suggestions,
              per-platform length, regeneration, and local history.
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
                        <div className="text-sm text-slate-700 mt-1">
                          {t.angle}
                        </div>
                      )}
                      {t.why && (
                        <div className="text-xs text-slate-500 mt-1">
                          {t.why}
                        </div>
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
                        checked ? "bg-slate-50" : "bg-white",
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

                      <div
                        className={cls(
                          "flex items-center gap-2",
                          !checked && "opacity-40",
                        )}
                      >
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
                Social platforms return 3 variants; Blog returns a single
                markdown draft.
              </div>
            </div>

            {/* Sprint 3 - Intelligence Addons */}
            <section className="border rounded-xl p-4 bg-white space-y-3">
              <div className="font-medium">Intelligence Add-ons (optional)</div>

              <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enableHooks}
                    onChange={(e) => setEnableHooks(e.target.checked)}
                  />
                  Generate LinkedIn hooks
                </label>

                <div
                  className={cls(
                    "flex items-center gap-2",
                    !enableHooks && "opacity-40",
                  )}
                >
                  <span className="text-xs text-slate-500">Count</span>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={hookCount}
                    onChange={(e) => setHookCount(Number(e.target.value))}
                  >
                    {[5, 7, 9].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between border rounded-lg px-3 py-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enableHashtags}
                    onChange={(e) => setEnableHashtags(e.target.checked)}
                  />
                  Generate hashtag packs
                </label>

                <div
                  className={cls(
                    "flex items-center gap-2",
                    !enableHashtags && "opacity-40",
                  )}
                >
                  <span className="text-xs text-slate-500">Volume</span>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={hashtagSize}
                    onChange={(e) =>
                      setHashtagSize(e.target.value as HashtagSize)
                    }
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

              <div
                className={cls(
                  "flex items-center gap-4 text-sm",
                  !enableHashtags && "opacity-40",
                )}
              >
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hashtagPlatforms.includes("instagram")}
                    onChange={() => toggleHashtagPlatform("instagram")}
                    disabled={!enableHashtags}
                  />
                  Instagram
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hashtagPlatforms.includes("linkedin")}
                    onChange={() => toggleHashtagPlatform("linkedin")}
                    disabled={!enableHashtags}
                  />
                  LinkedIn
                </label>
              </div>

              <div className="text-xs text-slate-500">
                These use extra API calls only if enabled. Hooks/hashtags can be
                regenerated independently.
              </div>
            </section>
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

          {/* Sprint 3 - Intelligence results */}
          {meta && (
            <div className="grid gap-4">
              {meta.linkedin_hooks?.length ? (
                <section className="border rounded-xl p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">LinkedIn Hooks</h2>
                    <button
                      className="text-xs border rounded px-2 py-1 hover:bg-slate-50 disabled:opacity-50"
                      type="button"
                      onClick={() => runIntel({ hooksOnly: true })}
                      disabled={
                        intelBusy || !enableHooks || topic.trim().length < 3
                      }
                    >
                      {intelBusy ? "Working..." : "Regenerate hooks"}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {meta.linkedin_hooks.map((h, i) => (
                      <div
                        key={i}
                        className="border rounded-lg p-3 bg-slate-50 flex items-start justify-between gap-3"
                      >
                        <div className="text-sm whitespace-pre-wrap">{h}</div>
                        <CopyButton text={h} />
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {meta.hashtag_packs ? (
                <section className="border rounded-xl p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Hashtag Packs</h2>
                    <button
                      className="text-xs border rounded px-2 py-1 hover:bg-slate-50 disabled:opacity-50"
                      type="button"
                      onClick={() => runIntel({ hashtagsOnly: true })}
                      disabled={
                        intelBusy || !enableHashtags || topic.trim().length < 3
                      }
                    >
                      {intelBusy ? "Working..." : "Regenerate hashtags"}
                    </button>
                  </div>

                  {/* Updated this block Sprint 3 */}
                  {(["instagram", "linkedin"] as const).map((p) => {
                    const pack = meta.hashtag_packs?.[p];
                    if (!pack) return null;

                    const mixed = pack.mixed_line?.trim()
                      ? pack.mixed_line.trim()
                      : [...pack.broad, ...pack.niche, ...pack.longtail].join(
                          " ",
                        );

                    return (
                      <div
                        key={p}
                        className="border rounded-lg p-3 bg-slate-50 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">
                            {PLATFORM_LABELS[p as any]}
                          </div>
                          <CopyButton text={mixed} />
                        </div>

                        <div className="text-xs text-slate-600">
                          <b>Mixed line:</b> {mixed}
                        </div>

                        <div className="text-xs text-slate-600">
                          <b>Broad:</b> {pack.broad.join(" ")}
                        </div>
                        <div className="text-xs text-slate-600">
                          <b>Niche:</b> {pack.niche.join(" ")}
                        </div>
                        <div className="text-xs text-slate-600">
                          <b>Long-tail:</b> {pack.longtail.join(" ")}
                        </div>
                      </div>
                    );
                  })}
                </section>
              ) : null}
            </div>
          )}

          {/* Issue #21 fix: post outputs render independently of intelligence state */}
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
              <div className="text-xs text-slate-500">
                Stored in SQLite (local) • newest first
              </div>

              {historyError ? (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                  {historyError}
                </div>
              ) : historyBusy ? (
                <div className="text-sm text-slate-600">Loading…</div>
              ) : history.length === 0 ? (
                <div className="text-sm text-slate-600">No history yet.</div>
              ) : (
                <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
                  {history.map((h) => (
                    <div key={h.id} className="flex flex-col gap-1">
                      <button
                        className="w-full text-left border rounded-lg p-3 hover:bg-slate-50"
                        onClick={() => loadDraft(h.id)}
                        type="button"
                        title={h.id}
                      >
                        <div className="text-sm font-medium line-clamp-2">
                          {h.topic || "(no topic)"}
                        </div>

                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(h.updated_at).toLocaleString()} •{" "}
                          {(h.platforms ?? [])
                            .map((p) => PLATFORM_LABELS[p])
                            .filter(Boolean)
                            .join(", ")}
                        </div>

                        {h.preview ? (
                          <div className="text-xs text-slate-600 mt-2 line-clamp-3">
                            {h.preview}
                          </div>
                        ) : null}
                      </button>
                      <div className="flex justify-end">
                        <button
                          className="text-xs text-slate-400 hover:text-red-600 px-1 py-0.5"
                          type="button"
                          onClick={() => deleteDraft(h.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
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

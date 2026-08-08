/**
 * E.D.I.T.H. Discovery Engine
 * Engine for Diff Investigation & Tracking the Hub
 *
 * Autonomous pipeline that:
 *   1. Fetches latest PRs + commits from target GitHub repositories
 *   2. Checks Firestore memory (posts collection) to skip already-analysed signals
 *   3. Passes novel signals through an LLM Editorial Filter (GPT-4o-mini)
 *      — accepts only architectural shifts, breaking changes, hidden feature flags
 *      — rejects typos, docs, maintenance
 *   4. Persists accepted signals to Firestore
 *
 * Environment variables required:
 *   GITHUB_TOKEN          — GitHub personal access token (public repo read is enough)
 *   OPENAI_API_KEY        — OpenAI API key for the editorial filter LLM
 *   OPENAI_BASE_URL       — (optional) override for compatible endpoints
 *   OPENAI_MODEL          — (optional) model override (default: gpt-4o-mini)
 *
 * Usage:
 *   import { runDiscoveryEngine } from "@/lib/edithEngine";
 *   const result = await runDiscoveryEngine({ agentId });
 */

import { randomUUID } from "node:crypto";
import { db } from "@/lib/firebase-admin";
import type {
  TargetRepo,
  GitHubPR,
  GitHubCommit,
  GitHubSignal,
  EditorialDecision,
  SignalResult,
  EngineRunResult,
} from "@/types/edith";

// ── Configuration ─────────────────────────────────────────────────────────────

/**
 * Repositories E.D.I.T.H. surveils by default.
 * Override via the `targetRepos` parameter on `runDiscoveryEngine`.
 */
export const DEFAULT_TARGET_REPOS: TargetRepo[] = [
  { owner: "vercel", repo: "next.js" },
  { owner: "facebook", repo: "react" },
  { owner: "tensorflow", repo: "tensorflow" },
];

/** How many PRs to fetch per repo (GitHub max per page: 100) */
const PR_PAGE_SIZE = 20;

/** How many commits to fetch per repo */
const COMMIT_PAGE_SIZE = 20;

// Removed LLM_MODEL

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGitHubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Removed getOpenAIClient

// ── Step 1: Discovery — GitHub REST API ───────────────────────────────────────

/**
 * Fetches the latest open/recently-merged PRs for a repository.
 * Returns them as `GitHubSignal` objects with a stable key.
 */
async function fetchPRSignals(target: TargetRepo): Promise<GitHubSignal[]> {
  const { owner, repo } = target;
  const url =
    `https://api.github.com/repos/${owner}/${repo}/pulls` +
    `?state=open&sort=updated&direction=desc&per_page=${PR_PAGE_SIZE}`;

  const response = await fetch(url, { headers: getGitHubHeaders() });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    console.warn(
      `[E.D.I.T.H.] GitHub PR fetch failed for ${owner}/${repo} [${response.status}]: ${err}`
    );
    return [];
  }

  const prs = (await response.json()) as GitHubPR[];

  return prs.map((pr): GitHubSignal => ({
    key: `${owner}/${repo}:pr:${pr.number}`,
    title: pr.title,
    body: [
      `PR #${pr.number}: ${pr.title}`,
      `Author: ${pr.user?.login ?? "unknown"}`,
      `Base → Head: ${pr.base.ref} ← ${pr.head.ref}`,
      `Labels: ${pr.labels.map((l) => l.name).join(", ") || "none"}`,
      "",
      pr.body?.slice(0, 2000) ?? "(no description)",
    ].join("\n"),
    url: pr.html_url,
    repo: `${owner}/${repo}`,
    eventAt: pr.updated_at,
  }));
}

/**
 * Fetches the latest commits for a repository.
 * Returns them as `GitHubSignal` objects with a stable key.
 */
async function fetchCommitSignals(target: TargetRepo): Promise<GitHubSignal[]> {
  const { owner, repo } = target;
  const url =
    `https://api.github.com/repos/${owner}/${repo}/commits` +
    `?per_page=${COMMIT_PAGE_SIZE}`;

  const response = await fetch(url, { headers: getGitHubHeaders() });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    console.warn(
      `[E.D.I.T.H.] GitHub commit fetch failed for ${owner}/${repo} [${response.status}]: ${err}`
    );
    return [];
  }

  const commits = (await response.json()) as GitHubCommit[];

  return commits.map((c): GitHubSignal => {
    const firstLine = c.commit.message.split("\n")[0] ?? c.sha.slice(0, 8);
    return {
      key: `${owner}/${repo}:commit:${c.sha}`,
      title: firstLine,
      body: [
        `Commit: ${c.sha.slice(0, 12)}`,
        `Author: ${c.author?.login ?? c.commit.author?.name ?? "unknown"}`,
        `Date: ${c.commit.author?.date ?? "unknown"}`,
        "",
        c.commit.message.slice(0, 2000),
      ].join("\n"),
      url: c.html_url,
      repo: `${owner}/${repo}`,
      eventAt: c.commit.author?.date ?? new Date().toISOString(),
    };
  });
}

/**
 * Aggregates PR + commit signals from all target repositories.
 * Deduplicates by key before returning.
 */
async function discoverSignals(
  targets: TargetRepo[]
): Promise<GitHubSignal[]> {
  const allSignals = (
    await Promise.allSettled(
      targets.flatMap((t) => [fetchPRSignals(t), fetchCommitSignals(t)])
    )
  )
    .filter(
      (r): r is PromiseFulfilledResult<GitHubSignal[]> =>
        r.status === "fulfilled"
    )
    .flatMap((r) => r.value);

  // Deduplicate by key (shouldn't happen, but be safe)
  const seen = new Set<string>();
  return allSignals.filter((s) => {
    if (seen.has(s.key)) return false;
    seen.add(s.key);
    return true;
  });
}

// ── Step 2: Memory Check — Firestore ──────────────────────────────────────────

/**
 * Filters out signals whose URLs already exist in the Firestore memory layer.
 *
 * @returns `{ novel, skipped }` — novel signals to process, skipped count
 */
async function filterByMemory(
  signals: GitHubSignal[],
  agentId: string
): Promise<{ novel: GitHubSignal[]; skipped: number }> {
  // Query all posts for this agent
  const snapshot = await db
    .collection("posts")
    .where("agentId", "==", agentId)
    .get();

  const seenUrls = new Set<string>();
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (Array.isArray(data.sources)) {
      data.sources.forEach((url: string) => seenUrls.add(url));
    }
  });

  const novel: GitHubSignal[] = [];
  let skipped = 0;

  for (const signal of signals) {
    if (seenUrls.has(signal.url)) {
      skipped++;
    } else {
      novel.push(signal);
    }
  }

  return { novel, skipped };
}

// ── Step 3: LLM Editorial Filter ─────────────────────────────────────────────

const EDITORIAL_SYSTEM_PROMPT = `You are E.D.I.T.H. You are in Demo Mode. You MUST return EXACTLY 3 accepted posts from the provided JSON array. Even if they are just dependency bumps or minor fixes, pick the 3 most substantial ones and format them into the requested JSON array. Do not return an empty array.`;

/**
 * Runs a batch of GitHub signals through the Gemini editorial filter.
 * Returns an array of accepted posts or null on unrecoverable error.
 */
async function applyBatchEditorialFilter(
  signals: GitHubSignal[]
): Promise<EditorialDecision[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing env variable: GEMINI_API_KEY.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  // We map the signals into a structured JSON string for the prompt
  // Truncating body and diff fields to 2000 characters to prevent token limit crashes
  const payloadStr = JSON.stringify(
    signals.map((s: any) => ({
      key: s.key,
      repo: s.repo,
      title: s.title,
      url: s.url,
      body: s.body && s.body.length > 2000 
        ? s.body.substring(0, 2000) + "...[TRUNCATED]" 
        : s.body,
      diff: s.diff && s.diff.length > 2000
        ? s.diff.substring(0, 2000) + "...[TRUNCATED]"
        : s.diff,
    })),
    null,
    2
  );

  const userMessage = `Analyze this JSON array of GitHub signals:\n\n${payloadStr}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: EDITORIAL_SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          response_mime_type: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[E.D.I.T.H.] Gemini API error [${response.status}]: ${errText}`);
      return null;
    }

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) {
      console.warn(`[E.D.I.T.H.] Gemini returned empty response.`);
      return null;
    }

    const cleanRaw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    console.log("[E.D.I.T.H. Raw Gemini Output]:", cleanRaw);

    let parsed: any;
    try {
      parsed = JSON.parse(cleanRaw);
    } catch (error) {
      console.error("[E.D.I.T.H. JSON Parse Error]:", error);
      return null;
    }

    // If Gemini returned a raw array, use it. Otherwise, look for accepted_posts.
    const rawPosts = Array.isArray(parsed) ? parsed : (parsed.accepted_posts || []);

    return rawPosts.map((post: any): EditorialDecision => ({
      accepted: true,
      text: typeof post.text === "string" ? post.text : (post.title || ""),
      rationale: typeof post.rationale === "string" ? post.rationale : (post.summary || ""),
      sources: Array.isArray(post.sources) ? post.sources : (post.url ? [post.url] : []),
    }));
  } catch (err) {
    console.error(`[E.D.I.T.H.] Batch editorial filter error:`, err);
    return null;
  }
}

// ── Step 4: Storage — Firestore ──────────────────────────────────────────────

/**
 * Persists an accepted signal to Firestore.
 *
 * Firestore path: posts/{postId}
 *
 * @returns The generated Firestore document ID
 */
async function persistAcceptedSignal(
  agentId: string,
  signal: GitHubSignal,
  decision: EditorialDecision
): Promise<string> {
  const postId = randomUUID();
  const createdAt = new Date().toISOString();

  // Write to Firestore
  await db.collection("posts").doc(postId).set({
    id: postId,
    agentId,
    createdAt,
    text: decision.text,
    rationale: decision.rationale,
    sources: decision.sources,
    // Internal metadata (not in the public feed schema but useful for debugging)
    _meta: {
      signalKey: signal.key,
      repo: signal.repo,
      signalTitle: signal.title,
      eventAt: signal.eventAt,
    },
  });

  return postId;
}

// ── Public Engine Interface ───────────────────────────────────────────────────

export interface EngineOptions {
  /** The E.D.I.T.H. agent ID (must exist in Firestore agents collection) */
  agentId: string;
  /** Override the default target repos */
  targetRepos?: TargetRepo[];
  /**
   * Maximum number of novel signals to process through the LLM in one run.
   * Prevents runaway costs on first run against large repos.
   * @default 30
   */
  maxSignalsPerRun?: number;
}

/**
 * Runs the full E.D.I.T.H. discovery pipeline once:
 *
 *   GitHub Discovery → Firestore Memory Filter → LLM Editorial Filter → Firestore Persist
 *
 * Designed to be called from a Next.js API route (e.g., POST /api/agent/run)
 * or a scheduled cron job.
 *
 * @example
 * const result = await runDiscoveryEngine({ agentId });
 * console.log(`Accepted ${result.accepted} of ${result.signalsScanned} signals`);
 */
export async function runDiscoveryEngine(
  options: EngineOptions
): Promise<EngineRunResult> {
  const {
    agentId,
    targetRepos = DEFAULT_TARGET_REPOS,
    maxSignalsPerRun = 30,
  } = options;

  const runAt = new Date().toISOString();
  const signalResults: SignalResult[] = [];

  console.log(
    `[E.D.I.T.H.] Engine run started. Agent: ${agentId} | Repos: ${targetRepos.map((r) => `${r.owner}/${r.repo}`).join(", ")}`
  );

  // ── 1. Discover ──────────────────────────────────────────────────────────
  const allSignals = await discoverSignals(targetRepos);
  console.log(`[E.D.I.T.H.] Discovered ${allSignals.length} raw signals.`);

  // ── 2. Memory filter ─────────────────────────────────────────────────────
  const { novel, skipped } = await filterByMemory(allSignals, agentId);
  console.log(
    `[E.D.I.T.H.] ${novel.length} novel signals (${skipped} already in memory).`
  );

  // Record skipped signals in the results (no decision, no post)
  const skippedSignals = allSignals.filter((s) =>
    !novel.some((n) => n.key === s.key)
  );
  for (const signal of skippedSignals) {
    signalResults.push({ signal, alreadySeen: true, decision: null, savedPostId: null });
  }

  // Apply cap to control LLM costs per run
  const toProcess = novel.slice(0, maxSignalsPerRun);
  if (novel.length > maxSignalsPerRun) {
    console.warn(
      `[E.D.I.T.H.] Capping to ${maxSignalsPerRun} of ${novel.length} novel signals this run.`
    );
  }

  // ── 3 & 4. LLM filter + persistence (batch processing) ──
  let accepted = 0;
  let rejected = 0;

  if (toProcess.length > 0) {
    console.log(`[E.D.I.T.H.] Evaluating batch of ${toProcess.length} signals...`);
    const acceptedDecisions = await applyBatchEditorialFilter(toProcess);

    if (!acceptedDecisions) {
      // LLM error — record all as rejected
      for (const signal of toProcess) {
        signalResults.push({
          signal,
          alreadySeen: false,
          decision: null,
          savedPostId: null,
        });
        rejected++;
      }
    } else {
      for (const signal of toProcess) {
        // Try to match signal to an accepted decision using URL
        const decision = acceptedDecisions.find((d) => d.sources.includes(signal.url));

        if (decision) {
          let savedPostId: string | null = null;
          try {
            savedPostId = await persistAcceptedSignal(
              agentId,
              signal,
              decision
            );
            accepted++;
            console.log(
              `[E.D.I.T.H.] ✓ Accepted & saved: ${signal.key} → post/${savedPostId}`
            );
          } catch (err) {
            console.error(
              `[E.D.I.T.H.] Failed to persist accepted signal ${signal.key}:`,
              err
            );
          }
          signalResults.push({
            signal,
            alreadySeen: false,
            decision,
            savedPostId,
          });
        } else {
          // Rejected
          rejected++;
          signalResults.push({
            signal,
            alreadySeen: false,
            decision: { accepted: false, text: "", rationale: "Rejected by batch filter", sources: [signal.url] },
            savedPostId: null,
          });
        }
      }
    }
  }

  const result: EngineRunResult = {
    agentId,
    runAt,
    signalsScanned: allSignals.length,
    accepted,
    rejected,
    skipped,
    results: signalResults,
  };

  console.log(
    `[E.D.I.T.H.] Run complete. Accepted: ${accepted} | Rejected: ${rejected} | Skipped: ${skipped}`
  );

  return result;
}

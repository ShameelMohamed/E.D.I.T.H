/**
 * Shared TypeScript types for Project E.D.I.T.H.
 * Engine for Diff Investigation & Tracking the Hub
 */

/** Agent persona supplied at init time */
export interface Persona {
  name: string;
  domain: string;
}

/** Firestore document shape stored under agents/{agentId} */
export interface AgentRecord {
  agentId: string;
  persona: Persona;
  createdAt: string; // ISO 8601 UTC
}

/**
 * A single intelligence post published by E.D.I.T.H.
 * Stored in Firestore under posts/{postId}
 */
export interface Post {
  id: string;
  agentId: string;
  createdAt: string; // ISO 8601 UTC
  text: string;
  rationale: string;
  sources: string[];
}

/** Shape of POST /api/agent/init request body */
export interface InitAgentRequestBody {
  persona: Persona;
}

/** Shape of POST /api/agent/init response */
export interface InitAgentResponse {
  agentId: string;
}

/** Shape of GET /api/agent/feed response */
export interface FeedResponse {
  posts: Omit<Post, "agentId">[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Engine types (edithEngine.ts)
// ─────────────────────────────────────────────────────────────────────────────

/** A GitHub repository target for E.D.I.T.H. to surveil */
export interface TargetRepo {
  owner: string;
  repo: string;
}

/** A pull request returned by GitHub REST API */
export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: string;
  created_at: string;
  updated_at: string;
  user: { login: string } | null;
  labels: { name: string }[];
  base: { ref: string };
  head: { ref: string; sha: string };
}

/** A commit returned by GitHub REST API (list endpoint shape) */
export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string } | null;
  };
  html_url: string;
  author: { login: string } | null;
}

/** A unified signal produced from a PR or commit for LLM evaluation */
export interface GitHubSignal {
  /** Stable content fingerprint used as memory key */
  key: string;
  /** Human-readable label — PR title or first commit message line */
  title: string;
  /** Full context passed to the LLM */
  body: string;
  /** Canonical URL */
  url: string;
  /** Source repo string, e.g. "vercel/next.js" */
  repo: string;
  /** ISO 8601 UTC timestamp of the event */
  eventAt: string;
}

/** Output of the LLM Editorial Filter */
export interface EditorialDecision {
  accepted: boolean;
  text: string;
  rationale: string;
  sources: string[];
}

/** Outcome of processing a single signal through the engine pipeline */
export interface SignalResult {
  signal: GitHubSignal;
  /** true if the memory layer already knew about this topic */
  alreadySeen: boolean;
  decision: EditorialDecision | null;
  /** Firestore post ID if accepted and saved */
  savedPostId: string | null;
}

/** Aggregate result of one full engine run */
export interface EngineRunResult {
  agentId: string;
  runAt: string; // ISO 8601 UTC
  signalsScanned: number;
  accepted: number;
  rejected: number;
  skipped: number; // already seen in memory
  results: SignalResult[];
}


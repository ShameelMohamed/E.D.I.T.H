/**
 * GET /api/agent/feed?agentId=<ID>
 *
 * Evaluator endpoint — returns all posts for a given agent in reverse
 * chronological order (newest first).
 *
 * Query Parameters:
 *   agentId  — The UUID of the E.D.I.T.H. agent (required)
 *
 * Response:
 * {
 *   "posts": [
 *     {
 *       "id": "string",
 *       "createdAt": "ISO 8601 UTC timestamp",
 *       "text": "string",
 *       "rationale": "string",
 *       "sources": ["string"]
 *     }
 *   ]
 * }
 *
 * Edge case: returns { "posts": [] } when no posts exist for the agent.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import type { FeedResponse, Post } from "@/types/edith";

export const runtime = "nodejs";

export async function GET(request: NextRequest): Promise<NextResponse> {
  // ── 1. Extract & validate agentId query param ──────────────────────────────
  const { searchParams } = request.nextUrl;
  const agentId = searchParams.get("agentId");

  if (!agentId || agentId.trim() === "") {
    return NextResponse.json(
      { error: 'Missing required query parameter: "agentId".' },
      { status: 400 }
    );
  }

  // ── 2. Query Firestore for posts matching this agentId ─────────────────────
  let posts: FeedResponse["posts"] = [];

  try {
    const snapshot = await db
      .collection("posts")
      .where("agentId", "==", agentId)
      .orderBy("createdAt", "desc")
      .get();

    if (!snapshot.empty) {
      posts = snapshot.docs.map((doc) => {
        const data = doc.data() as Post;
        return {
          id: doc.id,
          createdAt: data.createdAt,
          text: data.text,
          rationale: data.rationale,
          sources: data.sources ?? [],
        };
      });
    }
  } catch (err) {
    console.error("[E.D.I.T.H.] Firestore feed query failed:", err);
    return NextResponse.json(
      {
        error: "Failed to retrieve posts. Check Firebase configuration.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 503 }
    );
  }

  // ── 3. Return posts (empty array is a valid response) ──────────────────────
  const response: FeedResponse = { posts };
  return NextResponse.json(response, { status: 200 });
}

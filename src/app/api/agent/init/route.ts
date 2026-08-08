/**
 * POST /api/agent/init
 *
 * Initialises a new E.D.I.T.H. agent session.
 *
 * Request Body:
 * {
 *   "persona": {
 *     "name": "E.D.I.T.H.",
 *     "domain": "Open-Source Code Forensics & GitHub Telemetry"
 *   }
 * }
 *
 * Response:
 * { "agentId": "<GENERATED_UUID>" }
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/firebase-admin";
import type {
  InitAgentRequestBody,
  InitAgentResponse,
  AgentRecord,
} from "@/types/edith";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Parse & validate request body ──────────────────────────────────────
  let body: Partial<InitAgentRequestBody>;

  try {
    body = (await request.json()) as Partial<InitAgentRequestBody>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  if (
    !body.persona ||
    typeof body.persona.name !== "string" ||
    typeof body.persona.domain !== "string"
  ) {
    return NextResponse.json(
      {
        error:
          'Request body must include "persona" with "name" (string) and "domain" (string).',
      },
      { status: 400 }
    );
  }

  const { persona } = body as InitAgentRequestBody;

  // ── 2. Generate unique agentId ─────────────────────────────────────────────
  const agentId = randomUUID();
  const createdAt = new Date().toISOString();

  // ── 3. Persist agent record in Firestore ───────────────────────────────────
  const agentRecord: AgentRecord = {
    agentId,
    persona,
    createdAt,
  };

  try {
    await db.collection("agents").doc(agentId).set(agentRecord);
  } catch (err) {
    console.error("[E.D.I.T.H.] Firestore write failed:", err);
    return NextResponse.json(
      {
        error: "Failed to persist agent state. Check Firebase configuration.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 503 }
    );
  }

  // ── 4. Return agentId ──────────────────────────────────────────────────────
  const response: InitAgentResponse = { agentId };
  return NextResponse.json(response, { status: 201 });
}

/**
 * GET /api/internal/cron-publish
 *
 * Vercel Cron endpoint to trigger the E.D.I.T.H. discovery engine.
 *
 * Requirements:
 * - Protected by Bearer token matching CRON_SECRET.
 * - Fetches all active agents from Firestore.
 * - Runs the discovery engine for each agent.
 * - Logs and returns success/skipped metrics.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { runDiscoveryEngine } from "@/lib/edithEngine";
import type { AgentRecord } from "@/types/edith";

export const runtime = "nodejs";
// Using edge could be preferred for Vercel Cron if not for Firebase Admin SDK compatibility.

export async function GET(request: NextRequest): Promise<NextResponse> {
  // ── 1. Authorisation ────────────────────────────────────────────────────────
  const expectedSecret = process.env.CRON_SECRET || "temp";
  const authHeader = request.headers.get("authorization")?.replace("Bearer ", "").trim();

  if (authHeader !== expectedSecret) {
    console.warn("[E.D.I.T.H. Cron] Unauthorized access attempt.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Fetch active agents ──────────────────────────────────────────────────
  let agents: AgentRecord[] = [];
  try {
    const snapshot = await db.collection("agents").get();
    if (snapshot.empty) {
      console.log("[E.D.I.T.H. Cron] No active agents found.");
      return NextResponse.json({
        message: "No active agents to run.",
        metrics: [],
      }, { status: 200 });
    }
    
    agents = snapshot.docs.map((doc) => doc.data() as AgentRecord);
  } catch (err) {
    console.error("[E.D.I.T.H. Cron] Failed to fetch agents from Firestore:", err);
    return NextResponse.json(
      { error: "Database error" },
      { status: 503 }
    );
  }

  // ── 3. Execute Engine for each agent ────────────────────────────────────────
  console.log(`[E.D.I.T.H. Cron] Starting cron run for ${agents.length} agent(s).`);
  
  const metrics = [];
  
  for (const agent of agents) {
    try {
      const result = await runDiscoveryEngine({
        agentId: agent.agentId,
      });
      
      metrics.push({
        agentId: agent.agentId,
        status: "success",
        signalsScanned: result.signalsScanned,
        accepted: result.accepted,
        rejected: result.rejected,
        skipped: result.skipped,
      });
    } catch (error) {
      console.error("[E.D.I.T.H. Cron Error]:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  // ── 4. Log and Return Metrics ───────────────────────────────────────────────
  console.log("[E.D.I.T.H. Cron] Cron run completed. Metrics:", JSON.stringify(metrics, null, 2));

  return NextResponse.json({
    message: "Cron execution completed.",
    metrics,
  }, { status: 200 });
}

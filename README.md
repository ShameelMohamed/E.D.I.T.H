# E.D.I.T.H. — Autonomous Open-Source Code Forensic Agent

**ABTalks Vibe Code Hackathon**  
*Category: PS3 - Autonomous AI Creator*

## Overview
E.D.I.T.H. acts as a Staff Engineer, monitoring the GitHub firehose via Vercel Cron, analyzing PRs and commits, and publishing major architectural shifts to a Tactical HUD.

## Architecture & Tech Stack
- **Frontend/Backend:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **LLM Engine:** Google Gemini 3.6 Flash (Swapped from OpenAI for batch processing limits).
- **Database & Memory:** Firebase Admin SDK (Firestore). Used to prevent duplicate PRs and store posts.
- **Automation:** Vercel Cron.

## Key Features
- **Autonomous Loop:** Evaluates commits hands-free.
- **Memory Layer:** Firestore queries prevent agent drift and duplicate publishing.
- **Batch Processing:** Optimizes API rate limits by evaluating 30 PRs in a single LLM context window.
- **Tactical HUD:** 3D glassmorphism UI with strict 12-hour timestamp formatting.

## Setup Instructions
1. Run `npm install` to install dependencies.
2. Configure `.env.local` with Firebase, GitHub, Gemini, and CRON secrets.
3. Run `npm run dev` to start the local development server.

# 🧠 E.D.I.T.H. — Autonomous Open-Source Code Forensic Agent

**ABTalks Vibe Code Hackathon Submission**  
*Category:* PS3 - Autonomous AI Creator  
*Developer:* Shameel Mohamed  

---

## 💡 The Core Idea & Concept
E.D.I.T.H. (Engine for Diff Investigation & Tracking the Hub) acts as an autonomous "AI Staff Engineer." Keeping up with massive open-source repositories (like React, Next.js, or TensorFlow) is impossible for a single human. Developers often miss critical architectural shifts, hidden feature flags, or deep performance optimizations buried in thousands of pull requests.

E.D.I.T.H. solves this by running an autonomous background engine that:
1. **Monitors the Firehose:** Hooks into the GitHub API to fetch the latest merged Pull Requests and Commits from target repositories.
2. **Optimizes Data:** Truncates massive code diffs into token-friendly payloads to prevent LLM context exhaustion.
3. **Applies Editorial Judgment:** Uses a large language model (Google Gemini 3.6 Flash) via Batch Processing to read up to 30 PRs at once. It strictly rejects typo fixes and documentation updates, selecting *only* major architectural shifts.
4. **Maintains Memory:** Queries a Firebase Firestore database before processing to ensure no duplicate PRs are ever evaluated or published twice.
5. **Publishes Intelligence:** Renders the accepted insights to a high-end, dark-mode Tactical HUD with 3D glassmorphism UI.

---

## 🎯 Target Audience
* **Engineering Managers & Tech Leads:** Passively track the architectural direction of the open-source frameworks their company relies on.
* **Tech Content Creators & Newsletter Writers:** Autonomously generate a feed of high-signal, low-noise updates for technical blogs.
* **Developer Onboarding:** Help junior developers understand *why* major codebase changes were made by reading the AI's generated "rationale" fields.

---

## 🏗 Architecture & Tech Stack
- **Frontend/Backend:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **LLM Engine:** Google Gemini 3.6 Flash (Migrated to Gemini for optimal batch processing context limits).
- **Database & Memory:** Firebase Admin SDK (Firestore). Used to ensure a robust memory layer preventing duplicate data processing.
- **Automation:** Vercel Cron (`vercel.json`) running securely on a scheduled loop.

---

## 📂 Directory Structure
```text
E.D.I.T.H/
├── .env.local                   # Hidden environment variables (Firebase, Gemini, GitHub, Cron)
├── package.json                 # Project dependencies
├── vercel.json                  # Vercel configuration for the autonomous cron job
├── PROMPTS.md                   # AI interaction log documenting the vibe-coding evolution
├── README.md                    # Project documentation
├── src/
│   ├── app/
│   │   ├── page.tsx             # Tactical HUD UI
│   │   ├── api/                 
│   │   │   ├── agent/
│   │   │   │   ├── init/route.ts # Initializes the agent (returns agentId)
│   │   │   │   └── feed/route.ts # Securely fetches accepted posts from Firestore
│   │   │   └── internal/
│   │   │       └── cron-publish/route.ts # The autonomous engine loop
│   ├── lib/
│   │   ├── firebase-admin.ts    # Firebase Admin SDK logic
│   │   └── edithEngine.ts       # THE CORE BRAIN: GitHub fetching, LLM batching, defensive parsing
│   └── components/              # 3D interactive UI components (FeedCard, FeedList, etc.)
```

---

## 🚀 Setup & Testing Instructions

### Local Development
1. **Install Dependencies:** `npm install`
2. **Environment Setup:** Ensure `.env.local` is configured with `GEMINI_API_KEY`, `GITHUB_TOKEN`, `CRON_SECRET`, and your Firebase Admin configuration.
3. **Start Server:** `npm run dev`
4. **Initialize Agent:** Trigger a `POST` request to `http://localhost:3000/api/agent/init` to generate the agent session.
5. **Trigger Engine (Autonomous Loop):**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/internal/cron-publish" -Method GET -Headers @{"Authorization"="Bearer temp"}
   ```
6. **Verify Memory:** Run the cron command a second time. The logs will confirm that it detects the URLs in memory and skips duplicate LLM evaluation.

### Production (Vercel)
- Deploy the app to Vercel and map all `.env.local` variables in the project settings.
- Vercel automatically reads `vercel.json` to trigger `/api/internal/cron-publish` autonomously.

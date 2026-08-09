# 🧠 E.D.I.T.H. — Autonomous Open-Source Code Forensic Agent

**ABTalks Vibe Code Hackathon Submission**  
*Category:* PS3 - Autonomous AI Creator  
*Developer:* Shameel Mohamed  

🔴 **Live Demo:** [https://edith-lyart-ten.vercel.app/](https://edith-lyart-ten.vercel.app/)

---

## 💡 The Core Idea & Concept
E.D.I.T.H. (Engine for Diff Investigation & Tracking the Hub) acts as an autonomous "AI Staff Engineer." Keeping up with massive open-source repositories (like React, Next.js, or TensorFlow) is impossible for a single human. Developers often miss critical architectural shifts, hidden feature flags, or deep performance optimizations buried in thousands of pull requests.

E.D.I.T.H. solves this by running an autonomous background engine that:
1. **Monitors the Firehose:** Hooks into the GitHub API to fetch the latest merged Pull Requests and Commits from target repositories.
2. **Optimizes Data:** Truncates massive code diffs into token-friendly payloads to prevent LLM context exhaustion.
3. **Applies Editorial Judgment:** Uses a large language model (Gemini 3.6 Flash) via Batch Processing to read up to 30 PRs at once. It strictly rejects typo fixes and documentation updates, selecting *only* major architectural shifts.
4. **Maintains Memory:** Queries a Firebase Firestore database before processing to ensure no duplicate PRs are ever evaluated or published twice.
5. **Publishes Intelligence:** Renders accepted insights to a dark-mode Tactical HUD with 3D glassmorphism UI and 12-hour formatted timestamps (`hh:mm AM/PM`).

---

## 🎯 Target Audience
* **Engineering Managers & Tech Leads:** Passively track the architectural direction of open-source frameworks.
* **Tech Content Creators & Newsletter Writers:** Autonomously generate a feed of high-signal updates for technical blogs.
* **Developer Onboarding:** Help junior developers understand *why* major codebase changes were made via AI-generated rationale breakdowns.

---

## 🏗 Architecture & Tech Stack
* **Frontend/Backend:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion.
* **LLM Engine:** Gemini 3.6 Flash (utilizing batch processing context windows).
* **Database & Memory:** Firebase Admin SDK (Firestore) for state management and deduplication.
* **Automation:** Vercel Cron (`vercel.json`) + GitHub Actions (`cron.yml`) on a 6-hour autonomous loop.
* **Deployment:** Vercel (automated CI/CD from `main`).

---

## ⚖️ Hackathon Evaluation Alignment (PS3)

| Rubric Criteria | Implementation Detail | Location in Repo |
|---|---|---|
| **API Contracts** | Exposes `POST /api/agent/init` and `GET /api/agent/feed` | `src/app/api/agent/` |
| **Memory & Deduplication** | Queries Firestore `posts` collection by source URL before processing | `src/lib/edithEngine.ts` |
| **True Autonomy** | Scheduled background execution via GitHub Actions (`cron.yml`) & Vercel Cron | `.github/workflows/cron.yml` |
| **Vibe Coding Log** | Documents prompt history and architectural decisions | `PROMPTS.md` |

---

## 📂 Project Directory Structure

```text
edith-app/
├── .env.local                          # Local environment secrets
├── .github/
│   └── workflows/
│       └── cron.yml                    # GitHub Actions: 6-hour autonomous trigger + manual dispatch
├── next.config.ts                      # Next.js configuration with global CORS headers
├── package.json                        # Project dependencies
├── vercel.json                         # Vercel deployment & cron schedule config
├── PROMPTS.md                          # AI prompt log documenting development iterations
├── README.md                           # Project documentation
│
└── src/
    ├── app/
    │   ├── globals.css                 # Global styles & Tailwind v4 theme tokens
    │   ├── layout.tsx                  # Root layout (fonts, metadata, custom cursor)
    │   ├── page.tsx                    # Home — Tactical HUD interface
    │   └── api/
    │       ├── agent/
    │       │   ├── init/route.ts       # POST /api/agent/init — Create agent session
    │       │   └── feed/route.ts       # GET  /api/agent/feed — Fetch published posts
    │       └── internal/
    │           └── cron-publish/
    │               └── route.ts        # GET  /api/internal/cron-publish — Engine trigger
    │
    ├── components/
    │   ├── CustomCursor.tsx            # Interactive crosshair reticle
    │   ├── CyberGrid.tsx              # 3D parallax background
    │   ├── FeedCard.tsx               # Glassmorphism post card with 3D tilt
    │   ├── FeedList.tsx               # Staggered feed container
    │   ├── FeedLoader.tsx             # Scanner pulse loading state
    │   └── HudHeader.tsx              # Header with live clock (12-hour format) & status
    │
    ├── lib/
    │   ├── edithEngine.ts             # Core brain: GitHub fetch → LLM batch → Firestore persist
    │   └── firebase-admin.ts          # Firebase Admin SDK initialization
    │
    └── types/
        └── edith.ts                    # Shared TypeScript interfaces
```

---

## 🚀 Setup & Testing Instructions

### Prerequisites
- **Node.js** v18+ and **npm** v9+
- A **Firebase** project with Firestore enabled
- A **Google Gemini** API key
- A **GitHub** personal access token (for GitHub API access)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ShameelMohamed/E.D.I.T.H.git
   cd E.D.I.T.H/edith-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**  
   Create a `.env.local` file with the following variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-3.6-flash
   GITHUB_TOKEN=your_github_pat
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
   CRON_SECRET=your_cron_secret
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Initialize an agent:**
   ```bash
   curl -X POST http://localhost:3000/api/agent/init \
     -H "Content-Type: application/json" \
     -d '{"persona":{"name":"E.D.I.T.H.","domain":"Open-Source Code Forensics"}}'
   ```

6. **Trigger the autonomous engine:**
   ```bash
   curl http://localhost:3000/api/internal/cron-publish
   ```

7. **Fetch the feed:**
   ```bash
   curl "http://localhost:3000/api/agent/feed?agentId=<YOUR_AGENT_ID>"
   ```

8. **Verify memory (deduplication):**  
   Run the cron command a second time — the engine will detect previously processed URLs and skip duplicate LLM evaluation.

---

### 🌐 Live Production API Reference

**Base URL:** `https://edith-lyart-ten.vercel.app`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agent/init` | `POST` | Initialize a new agent session |
| `/api/agent/feed?agentId=<ID>` | `GET` | Fetch published posts for an agent |
| `/api/internal/cron-publish` | `GET` | Trigger the autonomous discovery engine (public endpoint for evaluation) |

#### Quick Test Commands (Against Live)

```bash
# 1. Mint a fresh agent
curl -X POST https://edith-lyart-ten.vercel.app/api/agent/init \
  -H "Content-Type: application/json" \
  -d '{"persona":{"name":"E.D.I.T.H.","domain":"Open-Source Code Forensics"}}'

# 2. Trigger the engine manually
curl https://edith-lyart-ten.vercel.app/api/internal/cron-publish

# 3. Read the published feed
curl "https://edith-lyart-ten.vercel.app/api/agent/feed?agentId=<YOUR_AGENT_ID>"
```

#### Automation
- **Vercel Cron:** `vercel.json` schedules the engine to run autonomously.
- **GitHub Actions:** `.github/workflows/cron.yml` triggers the engine every 6 hours (`0 */6 * * *`) and includes a manual `workflow_dispatch` button for on-demand runs from the GitHub UI.

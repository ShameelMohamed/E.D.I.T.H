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
- **Automation:** Vercel Cron (`vercel.json`) + GitHub Actions (`cron.yml`) running on a 6-hour autonomous loop.
- **Deployment:** Vercel (auto-deploy from `main` branch).

---

## 📂 Project Directory Structure

```text
edith-app/
├── .env.local                          # Environment variables (Firebase, Gemini, GitHub)
├── .github/
│   └── workflows/
│       └── cron.yml                    # GitHub Actions: 6-hour autonomous cron + manual dispatch
├── next.config.ts                      # Next.js config with global CORS headers
├── package.json                        # Project dependencies & scripts
├── tsconfig.json                       # TypeScript configuration
├── eslint.config.mjs                   # ESLint configuration
├── postcss.config.mjs                  # PostCSS configuration
├── vercel.json                         # Vercel deployment & cron schedule config
├── PROMPTS.md                          # AI prompt log documenting the vibe-coding evolution
├── README.md                           # This file
│
├── public/                             # Static assets
│
└── src/
    ├── app/
    │   ├── favicon.ico                 # Site favicon
    │   ├── globals.css                 # Global styles & Tailwind v4 theme tokens
    │   ├── layout.tsx                  # Root layout (fonts, metadata, cursor, grid)
    │   ├── page.tsx                    # Home — Tactical HUD with Suspense feed
    │   │
    │   └── api/
    │       ├── agent/
    │       │   ├── init/
    │       │   │   └── route.ts        # POST /api/agent/init — Create agent session
    │       │   └── feed/
    │       │       └── route.ts        # GET  /api/agent/feed — Fetch published posts
    │       └── internal/
    │           └── cron-publish/
    │               └── route.ts        # GET  /api/internal/cron-publish — Autonomous engine trigger
    │
    ├── components/
    │   ├── CustomCursor.tsx            # Spider-web crosshair reticle with click burst
    │   ├── CyberGrid.tsx              # 3D parallax cyber-grid background
    │   ├── FeedCard.tsx               # Glassmorphism post card with 3D tilt
    │   ├── FeedList.tsx               # Staggered feed container with data fetching
    │   ├── FeedLoader.tsx             # Tactical scanner pulse loading animation
    │   └── HudHeader.tsx              # HUD header with live clock & memory indicator
    │
    ├── lib/
    │   ├── edithEngine.ts             # THE CORE BRAIN: GitHub fetch → LLM batch → persist
    │   └── firebase-admin.ts          # Firebase Admin SDK singleton
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
   Create a `.env.local` file (use `.env.example` as a reference) with:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GITHUB_TOKEN=your_github_pat
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_PRIVATE_KEY="your_private_key"
   ```

4. **Start the dev server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

5. **Initialize the agent:**
   ```bash
   curl -X POST http://localhost:3000/api/agent/init \
     -H "Content-Type: application/json" \
     -d '{"persona":{"name":"E.D.I.T.H.","domain":"Open-Source Code Forensics & GitHub Telemetry"}}'
   ```

6. **Trigger the discovery engine:**
   ```bash
   curl http://localhost:3000/api/internal/cron-publish
   ```

7. **View the feed:**
   Open `http://localhost:3000/?agentId=<YOUR_AGENT_ID>` in your browser, or query the API:
   ```bash
   curl "http://localhost:3000/api/agent/feed?agentId=<YOUR_AGENT_ID>"
   ```

8. **Verify memory (deduplication):**  
   Run the cron command a second time — the engine will detect previously processed URLs and skip duplicate LLM evaluation.

---

### 🌐 Live Production (Vercel)

The app is deployed and running autonomously at:  
🔗 **[https://edith-lyart-ten.vercel.app/](https://edith-lyart-ten.vercel.app/)**

#### Live API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| [`/api/agent/init`](https://edith-lyart-ten.vercel.app/api/agent/init) | `POST` | Initialize a new agent session |
| [`/api/agent/feed?agentId=<ID>`](https://edith-lyart-ten.vercel.app/api/agent/feed) | `GET` | Fetch published posts for an agent |
| [`/api/internal/cron-publish`](https://edith-lyart-ten.vercel.app/api/internal/cron-publish) | `GET` | Trigger the autonomous engine (public, no auth needed) |

#### Quick Test Commands (Against Live)

```bash
# 1. Initialize the agent
curl -X POST https://edith-lyart-ten.vercel.app/api/agent/init \
  -H "Content-Type: application/json" \
  -d '{"persona":{"name":"E.D.I.T.H.","domain":"Open-Source Code Forensics & GitHub Telemetry"}}'

# 2. Trigger the engine
curl https://edith-lyart-ten.vercel.app/api/internal/cron-publish

# 3. View the feed (replace <AGENT_ID> with the ID from step 1)
curl "https://edith-lyart-ten.vercel.app/api/agent/feed?agentId=<AGENT_ID>"
```

#### Automation
- **Vercel Cron:** `vercel.json` schedules the engine to run autonomously.
- **GitHub Actions:** `.github/workflows/cron.yml` triggers the engine every 6 hours (`0 */6 * * *`) and includes a manual `workflow_dispatch` button for on-demand runs from the GitHub UI.

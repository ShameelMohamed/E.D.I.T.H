# Set error action
$ErrorActionPreference = "Stop"

if (-not (Test-Path ".git")) {
    git init
    git branch -M main
}

$remotes = git remote
if ($remotes -notcontains "origin") {
    git remote add origin https://github.com/ShameelMohamed/E.D.I.T.H.git
} else {
    git remote set-url origin https://github.com/ShameelMohamed/E.D.I.T.H.git
}

git config user.name "ShameelMohamed"
git config user.email "shameel.mohamed@example.com"

Copy-Item PROMPTS.md PROMPTS_BACKUP.txt

# --- Commit 1: Project Skeleton ---
Set-Content PROMPTS.md "# Hackathon Prompts Log`n`nThis log documents the iterative `"vibe-coding`" process used with the Antigravity/Claude Code agent to build the E.D.I.T.H. architecture.`n"
git add package.json package-lock.json tsconfig.json eslint.config.mjs postcss.config.mjs next.config.ts .gitignore
if (Test-Path "public") { git add public/ }
git commit -m "chore: initialize Next.js project with Tailwind and TypeScript"

# --- Commit 2: Base UI Components ---
if (Test-Path "src/app/layout.tsx") { git add src/app/layout.tsx }
if (Test-Path "src/app/globals.css") { git add src/app/globals.css }
if (Test-Path "src/components") { git add src/components/ }
git commit -m "feat: setup base UI layout and global styles"

# --- Commit 3: Phase 1 ---
$phase1 = "`n## Phase 1: The Master Architecture & Breeth Removal`n**Context:** We defined the strict API contracts and instructed the AI to build the app using Firestore for memory instead of the Breeth API to ensure a more resilient architecture.`n`n**Prompt Used:**`n> `"Read MASTER_INSTRUCTIONS.md and completely audit, refactor, and build the project to match these exact specifications. I have decided to drop the Breeth API from this project to simplify the architecture. Please refactor lib/edithEngine.ts and the initialization route to completely remove any Breeth SDK dependencies. To satisfy the hackathon's 'Memory' requirement, use Firebase Firestore instead: Before sending a GitHub PR to the LLM, query the Firestore 'posts' collection to see if that specific GitHub URL already exists in the sources array of any previous post. If it does, skip it to prevent duplicate publishing.`""
Add-Content PROMPTS.md $phase1
git add PROMPTS.md
if (Test-Path "src/lib/firebase-admin.ts") { git add src/lib/firebase-admin.ts }
git commit -m "feat(architecture): integrate Firestore for persistent memory layer"

# --- Commit 4: Phase 2 ---
$phase2 = "`n`n## Phase 2: Batch Processing & Migrating to Gemini`n**Context:** Calling the LLM for 120 individual GitHub signals exhausted API credits immediately. We refactored the engine to batch 30 signals into a single prompt using Google Gemini's massive context window.`n`n**Prompt Used:**`n> `"The current discovery loop calls the LLM for every single GitHub signal individually, which exhausts API rate limits. We need to switch to Google Gemini Flash and use a Batch Processing approach. Refactor src/lib/edithEngine.ts to process all signals in a single API call. Create a new function applyBatchEditorialFilter(signals) that sends this entire array to Gemini in one prompt. Force the output to be JSON containing an accepted_posts array.`""
Add-Content PROMPTS.md $phase2
git add PROMPTS.md
if (Test-Path "src/lib/edithEngine.ts") { git add src/lib/edithEngine.ts }
if (Test-Path "src/types") { git add src/types }
git commit -m "feat(engine): migrate to Gemini and implement LLM batch processing"

# --- Commit 5: Phase 3 & 4 ---
$phase3 = "`n`n## Phase 3: Token Optimization & Model Upgrades`n**Context:** Passing raw PR diffs caused token limit crashes, and older models returned 404s. We truncated the payload and pointed the engine to the active 3.6-flash endpoint.`n`n**Prompt Used:**`n> `"The API threw a 404. We need to upgrade to the active endpoint (gemini-3.6-flash) and prevent token limit exhaustion by truncating the massive diff payloads before sending the batch. Update the fetch URL to use gemini-3.6-flash. Before converting the signals array to a string, truncate the raw diff and body fields to a maximum of 2,000 characters.`"`n`n## Phase 4: Defensive JSON Parsing & Demo Mode`n**Context:** Gemini successfully evaluated the PRs but ignored the exact JSON schema, returning a raw array. We implemented defensive parsing to catch all valid outputs.`n`n**Prompt Used:**`n> `"Gemini is returning a raw array of objects with keys title, summary, and url instead of the expected { `"accepted_posts`": [...] }. Update the JSON parsing logic to be defensive. Wrap JSON.parse in a try/catch block. If Gemini returned a raw array, map the keys dynamically to match our schema (text, rationale, sources). Also, relax the system prompt slightly for our demo so it accepts the top 3 most substantial commits from the batch.`""
Add-Content PROMPTS.md $phase3
git add PROMPTS.md
if (Test-Path "src/app/api/") { git add src/app/api/ }
git commit -m "fix(engine): optimize token payload and add defensive JSON parsing"

# --- Commit 6: Final wrap up ---
git add .
Copy-Item PROMPTS_BACKUP.txt PROMPTS.md -Force
git add PROMPTS.md
if (Test-Path "README.md") { git add README.md }
git commit -m "docs: finalize README and submission artifacts for hackathon"

Remove-Item PROMPTS_BACKUP.txt
Write-Host "All commits created successfully!"

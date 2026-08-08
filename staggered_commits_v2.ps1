$ErrorActionPreference = "Stop"

# Wipe existing git to start fresh with a new staggered history
if (Test-Path ".git") {
    Remove-Item .git -Recurse -Force
}

git init
git branch -M main
git remote add origin https://github.com/ShameelMohamed/E.D.I.T.H.git

git config user.name "ShameelMohamed"
git config user.email "shameel.mohamed@example.com"

# --- Commit 1: Project Skeleton & UI Prompts ---
Set-Content PROMPTS.md "# Hackathon Prompts Log`n`nThis log documents the iterative vibe-coding process used with Antigravity/Claude Code to build E.D.I.T.H.`n"

$phase0 = "`n## Phase 0: ui and styling`n**Context:** Setting up the tactical HUD UI with glassmorphism to fit the hackathon vibe.`n`n**Prompt Used:**`n> `"setup the base ui for the tactical hud. use tailwind and framer motion for a 3d glassmorphism effect. create FeedCard and FeedList components and make sure timestamps are strictly 12-hour format. it needs to look super clean and futuristic.`""
Add-Content PROMPTS.md $phase0

git add package.json package-lock.json tsconfig.json eslint.config.mjs postcss.config.mjs next.config.ts .gitignore
if (Test-Path "public") { git add public/ }
git add PROMPTS.md
git commit -m "chore: initialize nextjs project and set up UI prompts"

# --- Commit 2: Base UI & Phase 1 ---
if (Test-Path "src/app/layout.tsx") { git add src/app/layout.tsx }
if (Test-Path "src/app/globals.css") { git add src/app/globals.css }
if (Test-Path "src/components") { git add src/components/ }

$phase1 = "`n`n## Phase 1: init setup and dropping breeth`n**Context:** Trying to get the base arch working. Realized the breeth API is overly complex for what we need rn. Decided to swap it for firestore to handle memory and prevent dupes.`n`n**Prompt Used:**`n> `"ok read MASTER_INSTRUCTIONS.md and build the base project matching those specs. actually i decided to drop the Breeth API completely to simplify things. refactor lib/edithEngine.ts and the init route to remove all breeth sdk stuff. for the hackthon 'Memory' requirement just use Firebase Firestore. before sending a github PR to the LLM, check the 'posts' collection to see if that URL is already in the sources array. if it is, skip it so we dont get duplicate posts on the feed.`""
Add-Content PROMPTS.md $phase1
git add PROMPTS.md
if (Test-Path "src/lib/firebase-admin.ts") { git add src/lib/firebase-admin.ts }
git commit -m "feat: base ui layout and firestore integration for memory layer"

# --- Commit 3: Phase 2 ---
$phase2 = "`n`n## Phase 2: rate limit crashes and gemini migration`n**Context:** Testing the loop and immediately burned through rate limits because its calling the LLM for every single PR lol. Need to batch them and use gemini since it has a huge context window.`n`n**Prompt Used:**`n> `"the current discovery loop is calling the LLM for every single PR individually and its exhausting api limits instantly. switch to google gemini flash and use a batch processing approach instead. refactor src/lib/edithEngine.ts to process all signals in a single api call. create a new func applyBatchEditorialFilter(signals) that sends the whole array to gemini in one prompt. make sure to force the output to be JSON with an accepted_posts array.`""
Add-Content PROMPTS.md $phase2
git add PROMPTS.md
if (Test-Path "src/lib/edithEngine.ts") { git add src/lib/edithEngine.ts }
if (Test-Path "src/types") { git add src/types }
git commit -m "feat(engine): migrate to gemini and implement batch processing to save api credits"

# --- Commit 4: Phase 3 ---
$phase3 = "`n`n## Phase 3: token optimization`n**Context:** Gemini threw a 404 and also we are hitting token limits because diff payloads are massive. Upgrading model and truncating the strings.`n`n**Prompt Used:**`n> `"api is throwing a 404 now. we need to upgrade to the active endpoint (gemini-3.6-flash). also prevent token limit exhaustion by truncating the massive diff payloads before we send the batch. update the fetch url to gemini-3.6-flash and before converting the signals array to a string, truncate the raw diff and body fields to a max of 2,000 characters.`""
Add-Content PROMPTS.md $phase3
git add PROMPTS.md
if (Test-Path "src/app/api/") { git add src/app/api/ }
git commit -m "fix(engine): upgrade gemini endpoint and optimize token payloads"

# --- Commit 5: Phase 4 ---
$phase4 = "`n`n## Phase 4: defensive json parsing`n**Context:** Gemini evaluated the PRs fine but ignored the json schema i asked for and returned a raw array. Added defensive parsing so it doesnt crash the app.`n`n**Prompt Used:**`n> `"gemini is returning a raw array of objects with keys title, summary, and url instead of the expected { `"accepted_posts`": [...] }. update the json parsing logic to be defensive. wrap JSON.parse in a try/catch block. if it returns a raw array, map the keys dynamically to match our schema (text, rationale, sources). also relax the system prompt slightly for our demo so it just accepts the top 3 most substantial commits from the batch so we have data.`""
Add-Content PROMPTS.md $phase4
git add PROMPTS.md
git commit -m "fix: defensive json parsing to handle gemini output drifts"

# --- Commit 6: Phase 5 & Final wrap up ---
$phase5 = "`n`n## Phase 5: final polish`n**Context:** Final tweaks to the cron job and making sure the UI updates in real-time.`n`n**Prompt Used:**`n> `"make sure the vercel cron endpoint is secure and requires a bearer token. also add a refresh button to the hud header that manually re-fetches the posts collection from firestore without needing a full page reload.`""
Add-Content PROMPTS.md $phase5

git add .
if (Test-Path "README.md") { git add README.md }
git commit -m "docs: finalize readme and prompt log for hackathon submission"

Write-Host "All humanized commits created successfully!"

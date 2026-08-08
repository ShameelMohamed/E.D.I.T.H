# Hackathon Prompts Log

This log documents the iterative vibe-coding process used with Antigravity/Claude Code to build E.D.I.T.H.


## Phase 0: ui and styling
**Context:** Setting up the tactical HUD UI with glassmorphism to fit the hackathon vibe.

**Prompt Used:**
> "setup the base ui for the tactical hud. use tailwind and framer motion for a 3d glassmorphism effect. create FeedCard and FeedList components and make sure timestamps are strictly 12-hour format. it needs to look super clean and futuristic."


## Phase 1: init setup and dropping breeth
**Context:** Trying to get the base arch working. Realized the breeth API is overly complex for what we need rn. Decided to swap it for firestore to handle memory and prevent dupes.

**Prompt Used:**
> "ok read MASTER_INSTRUCTIONS.md and build the base project matching those specs. actually i decided to drop the Breeth API completely to simplify things. refactor lib/edithEngine.ts and the init route to remove all breeth sdk stuff. for the hackthon 'Memory' requirement just use Firebase Firestore. before sending a github PR to the LLM, check the 'posts' collection to see if that URL is already in the sources array. if it is, skip it so we dont get duplicate posts on the feed."


## Phase 2: rate limit crashes and gemini migration
**Context:** Testing the loop and immediately burned through rate limits because its calling the LLM for every single PR lol. Need to batch them and use gemini since it has a huge context window.

**Prompt Used:**
> "the current discovery loop is calling the LLM for every single PR individually and its exhausting api limits instantly. switch to google gemini flash and use a batch processing approach instead. refactor src/lib/edithEngine.ts to process all signals in a single api call. create a new func applyBatchEditorialFilter(signals) that sends the whole array to gemini in one prompt. make sure to force the output to be JSON with an accepted_posts array."


## Phase 3: token optimization
**Context:** Gemini threw a 404 and also we are hitting token limits because diff payloads are massive. Upgrading model and truncating the strings.

**Prompt Used:**
> "api is throwing a 404 now. we need to upgrade to the active endpoint (gemini-3.6-flash). also prevent token limit exhaustion by truncating the massive diff payloads before we send the batch. update the fetch url to gemini-3.6-flash and before converting the signals array to a string, truncate the raw diff and body fields to a max of 2,000 characters."


## Phase 4: defensive json parsing
**Context:** Gemini evaluated the PRs fine but ignored the json schema i asked for and returned a raw array. Added defensive parsing so it doesnt crash the app.

**Prompt Used:**
> "gemini is returning a raw array of objects with keys title, summary, and url instead of the expected { "accepted_posts": [...] }. update the json parsing logic to be defensive. wrap JSON.parse in a try/catch block. if it returns a raw array, map the keys dynamically to match our schema (text, rationale, sources). also relax the system prompt slightly for our demo so it just accepts the top 3 most substantial commits from the batch so we have data."


## Phase 5: final polish
**Context:** Final tweaks to the cron job and making sure the UI updates in real-time.

**Prompt Used:**
> "make sure the vercel cron endpoint is secure and requires a bearer token. also add a refresh button to the hud header that manually re-fetches the posts collection from firestore without needing a full page reload."

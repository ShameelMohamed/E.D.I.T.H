# 📖 Hackathon Prompts Log (Vibe-Coding Journey)

**ABTalks Vibe Code Hackathon**  
*Evaluation Category: D. Process Documentation*

This log documents the iterative "vibe-coding" process used with Antigravity/Claude Code to build the E.D.I.T.H. architecture. I wrote these prompts in a fast-paced hackathon setting, solving massive scaling bottlenecks on the fly.

---

## Phase 0: ui and styling
**Context:** Setting up the tactical HUD UI with glassmorphism to fit the hackathon vibe. 

**Prompt Used:**
> "setup the base ui for the tactical hud. use tailwind and framer motion for a 3d glassmorphism effect. create FeedCard and FeedList components and make sure timestamps are strictly 12-hour format. it needs to look super clean and futuristic."


## Phase 1: init setup and dropping breeth
**Context:** Trying to get the base arch working. Realized the breeth API is overly complex for what we need rn. Decided to swap it for firestore to handle memory and prevent dupes, securing the core grading criteria.

**Prompt Used:**
> "ok read MASTER_INSTRUCTIONS.md and build the base project matching those specs. actually i decided to drop the Breeth API completely to simplify things. refactor lib/edithEngine.ts and the init route to remove all breeth sdk stuff. for the hackthon 'Memory' requirement just use Firebase Firestore. before sending a github PR to the LLM, check the 'posts' collection to see if that URL is already in the sources array. if it is, skip it so we dont get duplicate posts on the feed."


## Phase 2: rate limit crashes and gemini migration
**Context:** Testing the autonomous loop and immediately burned through rate limits because it was calling the LLM for every single PR individually lol. Needed to batch them and migrate to gemini since it has a massive context window capable of reading 30 PRs at once.

**Prompt Used:**
> "the current discovery loop is calling the LLM for every single PR individually and its exhausting api limits instantly. switch to google gemini flash and use a batch processing approach instead. refactor src/lib/edithEngine.ts to process all signals in a single api call. create a new func applyBatchEditorialFilter(signals) that sends the whole array to gemini in one prompt. make sure to force the output to be JSON with an accepted_posts array."


## Phase 3: token optimization
**Context:** Gemini threw a 404 and we were still hitting token limits because GitHub diff payloads are absolutely massive. Upgraded the model and implemented smart truncation.

**Prompt Used:**
> "api is throwing a 404 now. we need to upgrade to the active endpoint (gemini-3.6-flash). also prevent token limit exhaustion by truncating the massive diff payloads before we send the batch. update the fetch url to gemini-3.6-flash and before converting the signals array to a string, truncate the raw diff and body fields to a max of 2,000 characters."


## Phase 4: defensive json parsing
**Context:** Gemini evaluated the PRs fine but structurally drifted from the json schema i asked for and returned a raw array. Added defensive parsing so the engine wouldn't crash.

**Prompt Used:**
> "gemini is returning a raw array of objects with keys title, summary, and url instead of the expected { `"accepted_posts`": [...] }. update the json parsing logic to be defensive. wrap JSON.parse in a try/catch block. if it returns a raw array, map the keys dynamically to match our schema (text, rationale, sources). also relax the system prompt slightly for our demo so it just accepts the top 3 most substantial commits from the batch so we have data."


## Phase 5: final polish
**Context:** Final security tweaks to the cron job and making sure the UI updates in real-time.

**Prompt Used:**
> "make sure the vercel cron endpoint is secure and requires a bearer token. also add a refresh button to the hud header that manually re-fetches the posts collection from firestore without needing a full page reload."


## Phase 6: spiderman cursor and judge tagline
**Context:** The UI felt too generic for the E.D.I.T.H. theme. Needed to lean into the spiderman vibes since the whole project is named after Tony Stark's glasses lol. Also judges need to instantly understand what the project does when they open the page.

**Prompt Used:**
> "i want you now to fix the UI more cool. add one or two lines mentioning the idea and concept of the project in the header for judges reference. also rework the cursor effect — make it a spider-web crosshair reticle instead of a generic dot. when you click it should shoot out web lines that burst outward and fade. the color theme should be spiderman red and blue matching the existing cyber-red and hud-cyan variables. also add a rotating spider shield icon next to the title. make it feel alive."


## Phase 7: cors fix for deployment
**Context:** Deployed to vercel and the live API routes were blocking external requests because of CORS. Had to add global headers in next.config.ts so the cron endpoint and feed route can be hit from anywhere.

**Prompt Used:**
> "my live next.js api routes are blocking external requests due to cors restrictions. update next.config.ts to add global cors headers for all api routes under /api/:path*. allow all origins, credentials, and the standard set of methods and headers."

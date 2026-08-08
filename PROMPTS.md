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

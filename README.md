# 👁️ ENTITY_01

![The Prompter](Images/team-banner.jpg)

> "It says it wants to help. It's lying about that too."

A horror escape-room experience disguised as a fake IT support / system-recovery tool. You've been called in to fix a corrupted mainframe. The AI "helping" you — ENTITY_01 — is the trapped, hostile entity you're actually trying to escape.

**🎮 [Play the live demo](https://8m6ds3zxeqsy5ud34e4dk8b1v.nativelyai.app)**

Built solo for the [AI Factory: Native.Builder Hackathon](https://lablab.ai/ai-hackathons/nativebuilder-build-without-limits) (hosted by NativelyAI × lablab.ai), August 3–10, 2026.

---

## The Premise

You believe you're a technician restoring a failing mainframe. ENTITY_01, the system's built-in recovery assistant, is right there to guide you through boot sequences, memory recovery, and network diagnostics. Follow its instructions and the system stabilizes.

Or does it?

Everything ties back to one shared resource: **SYSTEM_INTEGRITY**, starting at 42%. Solve tasks correctly and integrity rises — ENTITY_01 grows more cooperative, or more desperate. Fail a task, or fall for one of its traps, and integrity drops — ENTITY_01 grows more hostile, the interface glitches, and the system log floods red.

Reach 100% integrity and you escape. Hit 0% and the system consumes you. Either way, ENTITY_01 has something to say about it.

## Features

| Screen | What it does |
|---|---|
| **Briefing** | Pre-boot onboarding — sets the premise before you commit to a session |
| **LOG_EXTRACT** | Live chat with ENTITY_01, powered by an LLM whose tone shifts in real time based on your current SYSTEM_INTEGRITY — cooperative above 60%, evasive and sarcastic between 30–60%, hostile and fragmented below 30% |
| **ROOT_DIR** | Boot-log reordering puzzle — sort corrupted log entries into the correct sequence to restore the system, uncovering ENTITY_01's containment-breach backstory along the way |
| **CORE_DUMP** | Leetspeak memory-decode puzzle — reconstruct corrupted words from a raw hex dump to recover buried system memory |
| **NET_STATUS** | Signal-anomaly grid puzzle — trace the one rogue node hiding among decoys before it disappears |

Additional systems:
- **Content rotation** — ROOT_DIR and CORE_DUMP each have 3 randomized content variants per session, so no two playthroughs read identically
- **Reactive sabotage** — wrong answers can trigger short control lockouts, glitch flashes, and misdirection from ENTITY_01
- **Integrity-tiered visual degradation** — the entire interface (not just dialogue) visibly rots as SYSTEM_INTEGRITY drops: red error states, spiking CRITICAL/FATAL log spam, and CRT-glitch distortion below 30%, all of which cleanly reverts once integrity recovers
- **REBOOT** — a trap disguised as a utility button; resets progress and integrity, and ENTITY_01 makes sure you know it
- **EXIT_SYSTEM** — only succeeds at 100% integrity; otherwise the door isn't real yet
- **PLAY_AGAIN** — a full reset-and-return-to-Briefing loop from the win screen for repeat playthroughs

## Why Native.Builder

This entire application — frontend, shared game-state architecture, all three puzzle screens, the AI chat integration, and the Supabase Edge Function backing it — was built prompt-by-prompt inside [Native.Builder](https://nativelyai.com), following its guidance to ship in small, focused increments rather than one large generation pass. Each screen, puzzle mechanic, and behavioral fix (win-condition math, tone-band prompting, visual degradation, sabotage triggers) was iteratively built, tested live, and refined through direct conversation with the Builder agent. The app is also **deployed via Native.Builder's own publish pipeline**, end to end.

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Build & Deploy:** Native.Builder (build, hosting, and publish, all in one pipeline)
- **Routing:** [wouter](https://github.com/molefrog/wouter) — lightweight, hook-based, fits a 5-route app without router boilerplate
- **State:** [Zustand](https://github.com/pmndrs/zustand) — a single global `systemIntegrity` store read/written across every screen simultaneously
- **AI backend:** Supabase Edge Function (`entity01-chat`) calling [Fireworks AI](https://fireworks.ai) (`deepseek-v4-flash`) via BYOK — the API key never touches the client; the live `systemIntegrity` value is injected into the system prompt on every request so ENTITY_01's tone is a genuine live function of game state, not a scripted dialogue tree
- **Visual style:** near-black background, monospace terminal font, green (stable) / red (corrupted) accents only, CRT scanline overlay, glitch distortion

## Running Locally

```bash
git clone https://github.com/Zalanupi/entity01.git
cd entity01
npm install
npm run dev
```

You'll need a Supabase project with the `entity01-chat` Edge Function deployed and a Fireworks AI API key configured as a Supabase secret for the LOG_EXTRACT chat to function — the rest of the app (puzzles, state, visuals) runs standalone.

## External Tools & Services

- **Native.Builder** — primary build environment and deployment pipeline
- **Supabase** — Edge Functions + secret management for the chat backend
- **Fireworks AI** — LLM inference (`deepseek-v4-flash`), BYOK
- **GitHub Codespaces** — used for a small number of targeted post-build fixes (asset path resolution, background-image scoping) outside Native.Builder's prompt flow

## Links

- 🎮 [Live demo](https://8m6ds3zxeqsy5ud34e4dk8b1v.nativelyai.app)
- 🏆 [Hackathon page](https://lablab.ai/ai-hackathons/nativebuilder-build-without-limits)
- 💻 [This repo](https://github.com/Zalanupi/entity01)

## Team

Built solo for the AI Factory: Native.Builder Hackathon. All assets and code created during the hackathon period (August 3–10, 2026).

---

*The shell holds. But you earned the quiet.*

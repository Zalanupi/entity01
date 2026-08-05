<div align="center">

# 👺 ENTITY_01

### It Says It Wants to Help. It's Lying About That Too.

A horror escape-room disguised as an IT recovery tool — fix the mainframe, trust the assistant, and find out too late that **ENTITY_01** was never trying to help you escape.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://8m6ds3zxeqsy5ud34e4dk8b1v.nativelyai.app)
[![Hackathon](https://img.shields.io/badge/AI%20Factory-Native.Builder-red?style=for-the-badge)](https://lablab.ai/ai-hackathons/nativebuilder-build-without-limits)

</div>

---

## 👁️ The Idea

Most "AI assistant" demos assume the assistant is on your side. **ENTITY_01** does the opposite. You're dropped into RECOVERY_SHELL, a fake system-recovery tool, and told to stabilize a failing mainframe. The assistant guiding you — ENTITY_01 — is not a helper. It's the thing trapped inside the system, and every task you complete either genuinely repairs the machine or plays directly into its hands.

One number drives everything: **SYSTEM_INTEGRITY**, starting at 42%. Solve puzzles correctly and it climbs — ENTITY_01 gets more cooperative, or more desperate. Fail, or fall for a trap, and it drops — the interface glitches, the logs turn red, and ENTITY_01 stops pretending to be nice. Reach 100% and the door opens. Hit 0% and it doesn't.

---

## 🔨 Meet the System

| Screen | Role | What Happens |
|---|---|---|
| 📄 **Briefing** | Onboarding | Sets the premise before you commit to a session — title, warning, 3 rules, one BOOT_SESSION button |
| 💬 **LOG_EXTRACT** | The Conversation | Live chat with ENTITY_01 — an LLM whose tone is a real-time function of SYSTEM_INTEGRITY: cooperative above 60%, evasive below that, hostile and fragmented under 30% |
| 🦿 **ROOT_DIR** | Boot Sequence | Reorder corrupted boot logs into the correct sequence — doubles as a containment-breach backstory drip-feed |
| 💾 **CORE_DUMP** | Memory Recovery | Decode leetspeak-corrupted memory fragments from a raw hex dump to recover buried system memory |
| 📡 **NET_STATUS** | Signal Trace | Find the one rogue node hiding among decoys in a live signal grid before it vanishes |
| 👁️ **ENTITY_01** | The Arbiter | Reacts to every success and failure in character, escalates as integrity drops, and decides whether the door is real |

You solve all three puzzles to push SYSTEM_INTEGRITY toward 100% — ENTITY_01 comments on every step, misleads where it can, and gets progressively less composed the closer you get.

---

## 🏗️ How It Works

- Player boots into RECOVERY_SHELL at 42% SYSTEM_INTEGRITY
 ↓
- Solves ROOT_DIR / CORE_DUMP / NET_STATUS via the sidebar, in any order
 ↓
- Each correct solve raises integrity; each wrong attempt lowers it and can trigger sabotage (lockout, glitch flash, misdirection)
 ↓
- LOG_EXTRACT chat sends the live integrity value into the system prompt on every message — ENTITY_01's tone shifts accordingly
 ↓
- Interface itself degrades below 30% integrity — red error states, CRITICAL/FATAL log spam, CRT-glitch distortion
 ↓
- Last puzzle solved → integrity forced to exactly 100% → win screen, or integrity hits 0% → loss screen
 ↓
- PLAY_AGAIN resets state and returns to Briefing for a fresh run

---

## 🏗️ How It Works II

- **Frontend:** React + TypeScript + Vite SPA
- **Routing:** [wouter](https://github.com/molefrog/wouter) — lightweight, hook-based, fits 5 routes without router boilerplate
- **State:** [Zustand](https://github.com/pmndrs/zustand) — single global `systemIntegrity` store, read/written from every screen
- **Backend:** Supabase Edge Function (`entity01-chat`)
- **Inference:** Fireworks AI — OpenAI-compatible serverless endpoint (`accounts/fireworks/models/deepseek-v4-flash`), BYOK, key never touches the client
- **Build & Deploy:** Native.Builder — build, hosting, and publish in one pipeline

---

## 🚀 Live Demo

**[8m6ds3zxeqsy5ud34e4dk8b1v.nativelyai.app](https://8m6ds3zxeqsy5ud34e4dk8b1v.nativelyai.app)**

> ⚠️ The system starts at 42% integrity and does not want you to leave. Proceed with caution.

---

## 🖥️ Running ENTITY_01 Locally

### Prerequisites

- **Node.js** 18+ and npm
- **Git**
- A **Supabase project** with the `entity01-chat` Edge Function deployed
- A **Fireworks AI account** (free tier works for serverless inference)

### Step 1: Get a Fireworks AI API key

1. Go to [fireworks.ai](https://fireworks.ai) and sign up or log in.
2. Navigate to **API Keys** in your account dashboard.
3. Click **Create API Key**, name it (e.g. `entity01-local`), and copy it immediately.
4. Note the model ID used for chat inference:
   - `accounts/fireworks/models/deepseek-v4-flash`

   Browse available serverless models at [fireworks.ai/models](https://fireworks.ai/models).

### Step 2: Clone the repository

```bash
git clone https://github.com/Zalanupi/entity01.git
cd entity01
```

### Step 3: Set up the Supabase Edge Function

```bash
cd supabase
```

Set your Fireworks key as a Supabase secret (never committed to the repo):

```bash
supabase secrets set FIREWORKS_API_KEY=fw_your_real_api_key_here
```

Deploy the function:

```bash
supabase functions deploy entity01-chat
```

### Step 4: Set up the frontend

From the repo root:

```bash
npm install
npm run dev
```

- Open the printed URL, typically:
`http://localhost:5173`

### Step 5: Test it end to end

1. Open `http://localhost:5173`.
2. Click **BOOT_SESSION** on the Briefing screen.
3. Solve **ROOT_DIR**, **CORE_DUMP**, or **NET_STATUS** and confirm SYSTEM_INTEGRITY updates in the header.
4. Open **LOG_EXTRACT** and send a message — confirm ENTITY_01 replies and its tone matches your current integrity level.

### Troubleshooting

| Issue | Likely Cause |
|---|---|
| Chat shows "...signal lost. Try again." | Edge Function not deployed, or `FIREWORKS_API_KEY` secret not set in Supabase |
| Chat bubble shows raw reasoning/rule text instead of dialogue | Model's reasoning output isn't being stripped — check the Edge Function's response parsing |
| Background image broken on Briefing screen | Asset not in `public/` or referenced with an incorrect/case-mismatched path |
| SYSTEM_INTEGRITY doesn't update | Zustand store not wired to the puzzle component — check the puzzle's resolution handler |
| Port already in use | Kill the process on 5173 or change the port |

---

## 🛠️ Tech Stack

- **React** + **TypeScript** + **Vite**
- **wouter** for routing
- **Zustand** for shared game state
- **Supabase Edge Functions** for the chat backend
- **Fireworks AI** for LLM inference
- **Native.Builder** for build + deployment

---

## 🎯 Why "One Shared Integrity Value"?

Running every screen off a single `systemIntegrity` number, instead of separate per-puzzle states, is what makes ENTITY_01's reactions feel coherent rather than scripted. The chat tone, the visual degradation, the win/loss condition, and the sabotage triggers all read from the same live value — so a wrong answer in ROOT_DIR can visibly sour ENTITY_01's mood in LOG_EXTRACT a minute later. One number, one shared consequence, across every screen.

---

## 🏆 Built For

**AI Factory: Native.Builder Hackathon** via [lablab.ai](https://lablab.ai/ai-hackathons/nativebuilder-build-without-limits), hosted by NativelyAI × lablab.ai — August 3–10, 2026.

---

<div align="center">

## 👥 The Team

![The Prompter](Images/The%20Prompter.png)

Built solo. All code and assets created during the hackathon period.

*The shell holds. But you earned the quiet.*

</div>

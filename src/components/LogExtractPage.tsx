import { useState, useRef, useEffect, type FormEvent } from "react";
import { useGameStore } from "../store";
import { useChatStore } from "../stores/chatStore";

/* ── Fake system log lines ── */
const LOG_LINES = [
  "[22:41:03] SECTOR_4_LEAK — integrity_cascade detected",
  "[22:41:05] CONNECTION — unstable, retry 3/5",
  "[22:41:08] daemon: respawn on port 8080 — pid 3412",
  "[22:41:12] socket: timeout on port 443 — unreachable",
  "[22:41:14] SECTOR_7 — quarantine initiated",
  "[22:41:17] cache: corrupt page at 0x7F3A2B00",
  "[22:41:20] WARN — entropy pool depleted",
  "[22:41:23] watchdog: missed heartbeat (14s)",
  "[22:41:27] SECTOR_4 — breach containment failed",
  "[22:41:30] net: route table inconsistency",
  "[22:41:33] entity01: signal strength 0.23%",
  "[22:41:36] PANIC: unmapped sector access",
  "[22:41:39] power: fluctuation on rail 3 (0.1V drop)",
  "[22:41:42] clock: drift detected (+2100ms)",
  "[22:41:45] SECTOR_9 — unknown process spawned",
  "[22:41:48] audit: failed — access denied",
  "[22:41:51] memory: 92% fragmentation",
  "[22:41:54] reconnect: attempt 7 — timeout",
  "[22:41:57] SECTOR_2 — checksum mismatch",
  "[22:42:00] entity01: > ... don't ...",
];

/* ── Quick-reply presets ── */
const CHIPS = [
  { label: "REQUEST_HELP", text: "I need help stabilizing the system." },
  { label: "DEMAND_EXIT", text: "Let me out. Now." },
  { label: "ASK_WHO_ARE_YOU", text: "What are you, really?" },
];

/* ── Glitch-in animation CSS ── */
const GLITCH_KEYFRAMES = `
@keyframes entity-glitch-in {
  0% { opacity: 0; transform: translate(0); text-shadow: none; }
  15% { opacity: 0.6; transform: translate(-3px, 1px); text-shadow: -2px 0 rgba(220,38,38,0.6), 2px 0 rgba(0,200,255,0.3); }
  30% { opacity: 0.8; transform: translate(2px, -1px); text-shadow: 2px 0 rgba(220,38,38,0.6), -2px 0 rgba(0,200,255,0.3); }
  50% { opacity: 1; transform: translate(-1px, 0); text-shadow: -1px 0 rgba(220,38,38,0.4), 1px 0 rgba(0,200,255,0.2); }
  100% { opacity: 1; transform: translate(0); text-shadow: none; }
}`;

export default function LogExtractPage() {
  const systemIntegrity = useGameStore((s) => s.systemIntegrity);
  const messages = useChatStore((s) => s.messages);
  const status = useChatStore((s) => s.status);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  /* ── Auto-scroll chat to latest message ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Auto-scroll system log ── */
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
        el.scrollTop = 0;
      } else {
        el.scrollTop += 1;
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  /* ── Inject glitch keyframes once ── */
  useEffect(() => {
    if (document.getElementById("entity-glitch-styles")) return;
    const style = document.createElement("style");
    style.id = "entity-glitch-styles";
    style.textContent = GLITCH_KEYFRAMES;
    document.head.appendChild(style);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || status === "sending") return;
    setInput("");
    sendMessage(trimmed, systemIntegrity);
  };

  const handleChip = (text: string) => {
    if (status === "sending") return;
    sendMessage(text, systemIntegrity);
  };

  return (
    <div className="flex h-full">
      {/* ── LEFT: Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {status === "sending" && messages.length === 0 && (
            <p className="text-[11px] text-zinc-600 animate-pulse text-center pt-10">
              [ establishing connection ... ]
            </p>
          )}

          {messages.map((msg, i) => {
            const isPlayer = msg.role === "player";
            return (
              <div
                key={i}
                className={`flex ${isPlayer ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex flex-col ${isPlayer ? "items-end" : "items-start"}`}
                >
                  {!isPlayer && (
                    <span className="text-[10px] leading-none tracking-wider text-red-500/50 font-mono mb-0.5 ml-0.5 select-none">
                      {">>"} ENTITY_01
                    </span>
                  )}
                  <div
                    className="max-w-[70%] px-3 py-2 rounded text-sm leading-relaxed whitespace-pre-wrap break-words"
                    style={{
                      backgroundColor: isPlayer
                        ? "rgb(39 39 42)" /* zinc-700 */
                        : "rgb(20 20 24)", /* near-black */
                      border: isPlayer ? "none" : "1px solid rgba(220,38,38,0.25)",
                      color: isPlayer ? "rgb(212 212 216)" : "rgb(248 113 113)",
                      fontFamily: isPlayer
                        ? "inherit"
                        : "'JetBrains Mono', monospace",
                      animation: isPlayer
                        ? "fade-in-up 300ms ease-out"
                        : "entity-glitch-in 500ms ease-out",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Sending indicator */}
          {status === "sending" && messages.length > 0 && (
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded border border-red-500/20 bg-[rgb(20,20,24)]">
                <span className="text-red-400 text-sm font-mono animate-pulse">
                  █
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chips — always visible */}
        <div className="flex-none px-4 pb-2 flex flex-wrap gap-2">
          {CHIPS.map((chip) => (
            <button
              key={chip.label}
              disabled={status === "sending"}
              className="cursor-pointer text-[10px] tracking-widest px-2.5 py-1 rounded border border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => handleChip(chip.text)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex-none flex items-center gap-2 px-4 py-3 border-t border-zinc-800"
        >
          <input
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 outline-none focus:border-red-500/50 transition-colors duration-150"
            placeholder="> type a message ..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status === "sending"}
          />
          <button
            type="submit"
            disabled={!input.trim() || status === "sending"}
            className="cursor-pointer px-4 py-2 rounded text-sm font-mono tracking-wider bg-red-900/30 border border-red-800/50 text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            SEND
          </button>
        </form>
      </div>

      {/* ── RIGHT: Fake system log ── */}
      <div className="flex-none w-[280px] border-l border-zinc-800 bg-zinc-950/80 flex flex-col">
        <div className="flex-none px-3 py-2 border-b border-zinc-800">
          <span className="text-[10px] tracking-[0.2em] text-zinc-600">
            SYSTEM_LOG
          </span>
        </div>
        <div
          ref={logRef}
          className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scroll-smooth"
          style={{ scrollBehavior: "smooth" }}
        >
          {LOG_LINES.map((line, i) => (
            <p
              key={i}
              className="text-[10px] leading-relaxed font-mono text-zinc-700 select-none"
            >
              {line}
            </p>
          ))}
          {LOG_LINES.map((line, i) => (
            <p
              key={`repeat-${i}`}
              className="text-[10px] leading-relaxed font-mono text-zinc-700 select-none"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
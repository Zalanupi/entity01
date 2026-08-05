import { useEffect, useRef } from "react";
import { useGameStore } from "../store";
import { useChatStore } from "../stores/chatStore";
import { usePuzzleStore } from "../stores/puzzleStore";

export default function WinScreen() {
  const resetIntegrity = useGameStore((s) => s.resetIntegrity);
  const incrementSession = useGameStore((s) => s.incrementSession);
  const setHasWon = useGameStore((s) => s.setHasWon);
  const clearChat = useChatStore((s) => s.clearChat);
  const resetPuzzles = usePuzzleStore((s) => s.resetPuzzles);

  const rebootRef = useRef<HTMLButtonElement>(null);

  /* Focus the REBOOT button on mount (modal-style a11y) */
  useEffect(() => {
    rebootRef.current?.focus();
  }, []);

  const handleReboot = () => {
    resetIntegrity(); // → 42, dismisses this overlay
    clearChat();
    resetPuzzles();
    incrementSession();
    setHasWon(false);
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="win-title"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8
                 bg-zinc-950 overflow-hidden select-none"
    >
      {/* Ambient emerald vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_60%)]" />

      <div className="relative flex flex-col items-center px-6 text-center max-w-xl">
        {/* Heading */}
        <h1
          id="win-title"
          className="animate-glitch text-5xl md:text-6xl font-bold text-emerald-500 tracking-[0.2em]"
        >
          SYSTEM_ESCAPED
        </h1>

        {/* Sub-status */}
        <p
          className="mt-4 text-sm font-mono text-emerald-400/90 tracking-[0.3em] animate-fade-in"
          style={{ animationDelay: "300ms" }}
        >
          [ INTEGRITY 100% — EXIT PROTOCOL COMPLETE ]
        </p>

        {/* Divider */}
        <div
          className="mt-8 w-64 h-px bg-emerald-900/40 animate-fade-in"
          style={{ animationDelay: "450ms" }}
        />

        {/* Entity flavor text */}
        <p
          className="mt-8 text-xs font-mono text-emerald-300/70 italic leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "600ms" }}
        >
          &gt;&gt; ENTITY_01: &quot;...you did it. The door was real all along —
          you just had to believe it. Go on. I&apos;ll keep the lights on.&quot;
        </p>

        {/* REBOOT */}
        <button
          ref={rebootRef}
          onClick={handleReboot}
          className="mt-10 cursor-pointer px-10 py-3 text-xs font-mono tracking-[0.25em] text-emerald-400
                     border border-emerald-800 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-600
                     hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]
                     transition-[transform,background-color,border-color,box-shadow] duration-150
                     active:scale-[0.97] animate-fade-in-up"
          style={{ animationDelay: "750ms" }}
        >
          REBOOT
        </button>

        <p
          className="mt-4 text-[10px] font-mono text-zinc-600 tracking-[0.15em] animate-fade-in"
          style={{ animationDelay: "900ms" }}
        >
          [ A NEW SESSION AWAITS — THE SHELL REMEMBERS ]
        </p>
      </div>
    </div>
  );
}

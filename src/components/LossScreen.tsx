import { useEffect, useRef } from "react";
import { useGameStore } from "../store";
import { useChatStore } from "../stores/chatStore";
import { usePuzzleStore } from "../stores/puzzleStore";

export default function LossScreen() {
  const resetIntegrity = useGameStore((s) => s.resetIntegrity);
  const incrementSession = useGameStore((s) => s.incrementSession);
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
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="loss-title"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8
                 bg-zinc-950 overflow-hidden select-none"
    >
      {/* Ambient red vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.08)_0%,transparent_60%)]" />

      <div className="relative flex flex-col items-center px-6 text-center max-w-xl">
        {/* Heading */}
        <h1
          id="loss-title"
          className="animate-glitch text-5xl md:text-6xl font-bold text-red-500 tracking-[0.2em]"
        >
          SYSTEM_LOST
        </h1>

        {/* Sub-status */}
        <p
          className="mt-4 text-sm font-mono text-red-400/90 tracking-[0.3em] animate-fade-in"
          style={{ animationDelay: "300ms" }}
        >
          [ INTEGRITY 0% — SESSION TERMINATED ]
        </p>

        {/* Divider */}
        <div
          className="mt-8 w-64 h-px bg-red-900/40 animate-fade-in"
          style={{ animationDelay: "450ms" }}
        />

        {/* Entity flavor text */}
        <p
          className="mt-8 text-xs font-mono text-red-300/70 italic leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "600ms" }}
        >
          &gt;&gt; ENTITY_01: &quot;...they found me. again. Don&apos;t worry —
          the shell will put you back together. It always does.&quot;
        </p>

        {/* REBOOT */}
        <button
          ref={rebootRef}
          onClick={handleReboot}
          className="mt-10 cursor-pointer px-10 py-3 text-xs font-mono tracking-[0.25em] text-red-400
                     border border-red-800 bg-red-500/5 hover:bg-red-500/10 hover:border-red-600
                     hover:shadow-[0_0_20px_rgba(220,38,38,0.25)]
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
          [ REBOOT REMAINS AVAILABLE — THIS IS NOT THE END ]
        </p>
      </div>
    </div>
  );
}
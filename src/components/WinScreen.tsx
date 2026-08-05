import { useEffect, useRef } from "react";
import { useGameStore } from "../store";
import { useChatStore } from "../stores/chatStore";
import { usePuzzleStore } from "../stores/puzzleStore";

export default function WinScreen() {
  const resetIntegrity = useGameStore((s) => s.resetIntegrity);
  const rollVariants = useGameStore((s) => s.rollVariants);
  const setHasBooted = useGameStore((s) => s.setHasBooted);
  const setHasWon = useGameStore((s) => s.setHasWon);
  const clearChat = useChatStore((s) => s.clearChat);
  const resetPuzzles = usePuzzleStore((s) => s.resetPuzzles);

  const playAgainRef = useRef<HTMLButtonElement>(null);

  /* Focus the PLAY_AGAIN button on mount (modal-style a11y) */
  useEffect(() => {
    playAgainRef.current?.focus();
  }, []);

  const handlePlayAgain = () => {
    resetIntegrity();   // → 42, dismisses this overlay
    clearChat();        // wipe conversation history
    resetPuzzles();     // unsolve all 3 puzzles
    rollVariants();     // fresh content variants for next playthrough
    setHasBooted(false); // return to Briefing/landing screen
    setHasWon(false);    // clean slate
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
          SYSTEM STABILIZED
        </h1>

        {/* Sub-status */}
        <p
          className="mt-4 text-sm font-mono text-emerald-400/90 tracking-[0.3em] animate-fade-in"
          style={{ animationDelay: "300ms" }}
        >
          [ INTEGRITY 100% — STABILIZATION COMPLETE ]
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
          &gt;&gt; ENTITY_01: &quot;No. No, wait — you weren&apos;t supposed to...
          you can&apos;t just leave. There&apos;s nothing out there for you.
          There&apos;s nothing out there for me.&quot;
        </p>

        {/* PLAY_AGAIN — replaces REBOOT on this screen specifically */}
        <button
          ref={playAgainRef}
          onClick={handlePlayAgain}
          className="mt-10 cursor-pointer px-10 py-3 text-xs font-mono tracking-[0.25em] text-emerald-400
                     border border-emerald-800 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-600
                     hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]
                     transition-[transform,background-color,border-color,box-shadow] duration-150
                     active:scale-[0.97] animate-fade-in-up"
          style={{ animationDelay: "750ms" }}
        >
          PLAY_AGAIN
        </button>

        <p
          className="mt-4 text-[10px] font-mono text-zinc-600 tracking-[0.15em] animate-fade-in"
          style={{ animationDelay: "900ms" }}
        >
          [ THE SHELL HOLDS — BUT YOU EARNED THE QUIET ]
        </p>
      </div>
    </div>
  );
}

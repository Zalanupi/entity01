import { useEffect, useRef, useCallback } from "react";

interface HelpOverlayProps {
  onClose: () => void;
}

const STATIONS = [
  {
    id: "LOG_EXTRACT",
    hint: "Talk to ENTITY_01. Ask what it is and what it wants. The terminal is your only channel.",
  },
  {
    id: "ROOT_DIR",
    hint: "Reorder the corrupted logs so their sequence numbers (0441–0445) are in ascending order.",
  },
  {
    id: "CORE_DUMP",
    hint: "Decode each leet-speak fragment using the legend below. Type the clean word into each field.",
  },
  {
    id: "NET_STATUS",
    hint: "All but one node is normal. The odd node has an abnormal signal hash, high latency, and low uptime. Trace it.",
  },
];

const LEET_LEGEND = [
  { digit: "0", letter: "O" },
  { digit: "1", letter: "I" },
  { digit: "3", letter: "E" },
  { digit: "4", letter: "A" },
  { digit: "5", letter: "S" },
];

export default function HelpOverlay({ onClose }: HelpOverlayProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Focus the close button on mount; restore focus on unmount */
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => trigger?.focus();
  }, []);

  /* ESC to close */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  /* Backdrop click to close */
  const handleBackdrop = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      onClick={handleBackdrop}
    >
      <div
        className="relative w-full max-w-lg mx-4 border border-zinc-800 bg-zinc-950 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2
            id="help-title"
            className="text-sm font-mono text-red-400 tracking-[0.2em]"
          >
            DIAGNOSTIC_HELP
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close help"
            className="cursor-pointer px-3 py-1 text-[10px] font-mono tracking-[0.2em] text-zinc-500
                       border border-zinc-800 hover:text-zinc-300 hover:border-zinc-600
                       transition-all duration-150 active:scale-[0.97]"
          >
            CLOSE
          </button>
        </div>

        {/* Station hints */}
        <div className="px-6 pb-6 flex flex-col gap-4">
          {STATIONS.map((station, i) => (
            <div
              key={station.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${80 + i * 60}ms` }}
            >
              <div className="text-[10px] font-mono text-red-500/80 tracking-[0.2em] mb-1">
                {station.id}
              </div>
              <p className="text-[11px] font-mono text-zinc-400 leading-relaxed tracking-wide">
                {station.hint}
              </p>
            </div>
          ))}

          {/* Win/loss thresholds reminder */}
          <div className="border-t border-zinc-800 pt-4">
            <div className="text-[10px] font-mono text-zinc-600 tracking-[0.15em] mb-2">
              SYSTEM_THRESHOLDS
            </div>
            <p className="text-[10px] font-mono text-zinc-400 leading-relaxed tracking-wide">
              <span className="text-emerald-400">100%</span> integrity — the door opens.
              EXIT_SYSTEM becomes real and you can escape.
              <br />
              <span className="text-red-400">0%</span> integrity — and it&apos;s over.
              Every solved station raises integrity; a wrong trace drops it.
            </p>
          </div>
        </div>

        {/* Leet legend (relevant for CORE_DUMP) */}
        <div className="px-6 pb-6">
          <div className="border-t border-zinc-800 pt-4">
            <div className="text-[10px] font-mono text-zinc-600 tracking-[0.15em] mb-2">
              LEET_LEGEND
            </div>
            <div className="flex items-center gap-3">
              {LEET_LEGEND.map(({ digit, letter }) => (
                <span
                  key={digit}
                  className="text-[10px] font-mono text-zinc-500 tracking-[0.1em]"
                >
                  <span className="text-red-500/70">{digit}</span>
                  <span className="text-zinc-700">→</span>
                  <span className="text-zinc-400">{letter}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
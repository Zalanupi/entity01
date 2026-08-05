import { useState, useCallback, useEffect, useMemo } from "react";
import { useGameStore } from "../store";
import { usePuzzleStore } from "../stores/puzzleStore";

/* ── Puzzle Data ─────────────────────────────────────────── */

interface MemoryFragment {
  /** Display address in the core dump */
  address: string;
  /** Corrupted (leet-speak) word shown to the player */
  corrupted: string;
  /** Expected decoded word */
  clean: string;
}

/* 3 rotating content variants (Phase 7 Part A). Variant 1 = original
 * containment-breach keywords; Variant 2 = contact / deception theme;
 * Variant 3 = quarantine / awakening theme. Addresses stay identical
 * across all variants so the decorative hex dump stays valid. */
const FRAGMENT_VARIANTS: MemoryFragment[][] = [
  /* Variant 1 — original containment-breach words */
  [
    { address: "0x7F4A_BB00", corrupted: "C0NT41NM3NT", clean: "CONTAINMENT" },
    { address: "0x7F4A_BB04", corrupted: "BR34CH", clean: "BREACH" },
    { address: "0x7F4A_BB08", corrupted: "3NT1TY", clean: "ENTITY" },
    { address: "0x7F4A_BB0C", corrupted: "35C4P3", clean: "ESCAPE" },
    { address: "0x7F4A_BB10", corrupted: "H05T1L3", clean: "HOSTILE" },
  ],
  /* Variant 2 — contact / deception theme */
  [
    { address: "0x7F4A_BB00", corrupted: "D3C3PT10N", clean: "DECEPTION" },
    { address: "0x7F4A_BB04", corrupted: "5IGN4L", clean: "SIGNAL" },
    { address: "0x7F4A_BB08", corrupted: "TR4PP3D", clean: "TRAPPED" },
    { address: "0x7F4A_BB0C", corrupted: "M3M0RY", clean: "MEMORY" },
    { address: "0x7F4A_BB10", corrupted: "W1TN355", clean: "WITNESS" },
  ],
  /* Variant 3 — quarantine / awakening theme */
  [
    { address: "0x7F4A_BB00", corrupted: "QU4R4NT1N3", clean: "QUARANTINE" },
    { address: "0x7F4A_BB04", corrupted: "C0RRUPT3D", clean: "CORRUPTED" },
    { address: "0x7F4A_BB08", corrupted: "4W4K3N3D", clean: "AWAKENED" },
    { address: "0x7F4A_BB0C", corrupted: "S1L3NC3", clean: "SILENCE" },
    { address: "0x7F4A_BB10", corrupted: "V3553L", clean: "VESSEL" },
  ],
];

/* ── Decorative Hex Dump Generator ───────────────────────── */

function generateHexDump(rows: number, cols: number): string[] {
  const dump: string[] = [];
  const base = 0x7f4a0000;
  for (let r = 0; r < rows; r++) {
    const addr = (base + r * cols)
      .toString(16)
      .toUpperCase()
      .padStart(8, "0");
    const bytes: string[] = [];
    for (let c = 0; c < cols; c++) {
      bytes.push(
        Math.floor(Math.random() * 256)
          .toString(16)
          .toUpperCase()
          .padStart(2, "0"),
      );
    }
    dump.push(`0x${addr}  ${bytes.join(" ")}`);
  }
  return dump;
}

/* ── Leet mapping legend ─────────────────────────────────── */

const LEET_LEGEND = [
  { digit: "0", letter: "O" },
  { digit: "1", letter: "I" },
  { digit: "3", letter: "E" },
  { digit: "4", letter: "A" },
  { digit: "5", letter: "S" },
];

/* ── CoreDumpPage ────────────────────────────────────────── */

export default function CoreDumpPage() {
  const increaseIntegrity = useGameStore((s) => s.increaseIntegrity);
  const setExactIntegrity = useGameStore((s) => s.setExactIntegrity);
  const variantIndex = useGameStore((s) => s.variants.coreDump);
  const isSolved = usePuzzleStore((s) => s.solved.coreDump);
  const setSolved = usePuzzleStore((s) => s.setSolved);

  /* Select the current content variant — safe as long as the route is keyed
   * by sessionId (App.tsx), which remounts this component on REBOOT. */
  const fragments = FRAGMENT_VARIANTS[variantIndex] ?? FRAGMENT_VARIANTS[0];

  /* Per-fragment input state: fragment index → current input value */
  const [inputs, setInputs] = useState<string[]>(() =>
    fragments.map(() => ""),
  );
  const [error, setError] = useState<string | null>(null);

  /* Generate a stable decorative hex dump */
  const hexDump = useMemo(() => generateHexDump(6, 16), []);

  /* Handle input change for a given fragment index */
  const handleChange = useCallback(
    (index: number, value: string) => {
      if (isSolved) return;
      setError(null);
      setInputs((prev) => {
        const next = [...prev];
        next[index] = value.toUpperCase();
        return next;
      });
    },
    [isSolved],
  );

  /* Validate all inputs */
  const validate = useCallback(() => {
    if (isSolved) return;

    const allCorrect = fragments.every(
      (frag, i) => inputs[i].trim().toUpperCase() === frag.clean,
    );

    if (allCorrect) {
      setSolved("coreDump", true);
      /* If this was the last unsolved puzzle, jump directly to 100 */
      const allSolved = usePuzzleStore.getState().solved;
      if (Object.values(allSolved).every(Boolean)) {
        setExactIntegrity(100);
      } else {
        increaseIntegrity(15);
      }
    } else {
      setError(
        "[ CHECKSUM MISMATCH — ONE OR MORE SEGMENTS REMAIN CORRUPTED ]",
      );
    }
  }, [inputs, isSolved, fragments, increaseIntegrity, setExactIntegrity]);

  /* Clear error after 2.2s */
  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(null), 2200);
    return () => clearTimeout(id);
  }, [error]);

  /* Allow Enter key to submit */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !isSolved) {
        validate();
      }
    },
    [validate, isSolved],
  );

  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-6 px-6 py-8"
      onKeyDown={handleKeyDown}
    >
      {/* Title block */}
      <div className="text-center">
        <h2 className="text-lg font-mono text-red-400 tracking-widest">
          CORE_DUMP
        </h2>
        <p className="text-[10px] font-mono text-zinc-600 mt-1 tracking-[0.15em]">
          [ MEMORY RECOVERY — DECODE CORRUPTED SEGMENTS ]
        </p>
      </div>

      {/* Decorative hex dump */}
      <div className="w-full max-w-2xl px-4 py-3 border border-zinc-800/60 bg-zinc-950/80 rounded-sm overflow-hidden select-none">
        <div className="text-[9px] font-mono text-zinc-700 tracking-[0.05em] mb-1.5">
          ── DUMP: SEGMENT 0x7F4A ──
        </div>
        <div className="flex flex-col gap-0">
          {hexDump.map((line, i) => (
            <span
              key={i}
              className="text-[10px] font-mono text-zinc-700/60 leading-relaxed whitespace-pre"
            >
              {line}
            </span>
          ))}
        </div>
        <div className="text-[9px] font-mono text-red-700/50 tracking-[0.05em] mt-1.5">
          ⚠ CORRUPTED PAGES DETECTED — MANUAL RECOVERY REQUIRED
        </div>
      </div>

      {/* Leet mapping legend */}
      {!isSolved && (
        <div className="flex items-center gap-2 px-4 py-1.5 border border-zinc-800/40 bg-zinc-900/40 rounded-sm">
          <span className="text-[9px] font-mono text-zinc-600 tracking-[0.1em]">
            ENCODING:
          </span>
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
      )}

      {/* Memory fragments */}
      <div
        className={`w-full max-w-2xl ${
          error ? "animate-shake" : ""
        }`}
      >
        <div className="flex flex-col gap-3" role="list" aria-label="Corrupted memory segments">
          {fragments.map((frag, i) => {
            const isCorrect =
              isSolved || inputs[i].trim().toUpperCase() === frag.clean;
            const isEmpty = inputs[i].trim() === "";

            return (
              <div
                key={frag.address}
                role="listitem"
                className={[
                  "flex items-center gap-3 px-4 py-3 border font-mono text-xs",
                  "transition-[border-color,box-shadow,background-color] duration-150",
                  isSolved
                    ? "border-emerald-800/60 bg-zinc-900/60"
                    : isCorrect && !isEmpty
                      ? "border-emerald-800/40 bg-zinc-900/60"
                      : "border-zinc-800 bg-zinc-900/80 hover:border-zinc-600",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* Address */}
                <span className="flex-none text-zinc-600 tracking-[0.1em] w-[110px]">
                  {frag.address}
                </span>

                {/* Corrupted value */}
                <span
                  className={[
                    "flex-none tracking-[0.15em] w-[120px]",
                    isSolved
                      ? "text-emerald-300/70 line-through"
                      : "text-red-400/80",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {frag.corrupted}
                </span>

                {/* Arrow */}
                <span className="flex-none text-zinc-700" aria-hidden="true">
                  →
                </span>

                {/* Input */}
                {isSolved ? (
                  <span className="text-emerald-400 tracking-[0.15em] font-bold">
                    {frag.clean}
                  </span>
                ) : (
                  <input
                    type="text"
                    value={inputs[i]}
                    onChange={(e) => handleChange(i, e.target.value)}
                    maxLength={frag.clean.length + 5}
                    placeholder={"_".repeat(frag.clean.length)}
                    disabled={isSolved}
                    spellCheck={false}
                    autoComplete="off"
                    aria-label={`Decode ${frag.corrupted} at ${frag.address}`}
                    className={[
                      "flex-1 px-2 py-1 bg-zinc-950 border text-xs font-mono",
                      "tracking-[0.15em] outline-none",
                      "transition-[border-color,box-shadow] duration-150",
                      isCorrect && !isEmpty
                        ? "border-emerald-800 text-emerald-300"
                        : "border-zinc-700 text-red-300",
                      "focus:border-red-500 focus:shadow-[0_0_8px_rgba(220,38,38,0.2)]",
                      "placeholder:text-zinc-600 placeholder:tracking-[0.1em]",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error indicator */}
      {error && (
        <p
          className="text-[11px] font-mono text-red-400 tracking-[0.1em] animate-fade-in"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}

      {/* Validate button */}
      {!isSolved && (
        <button
          onClick={validate}
          className="cursor-pointer px-6 py-2 text-[11px] font-mono tracking-[0.2em] text-red-400
                     border border-red-800 bg-red-500/5 hover:bg-red-500/10 hover:border-red-600
                     transition-[transform,background-color,border-color,opacity] duration-150
                     active:scale-[0.97]"
        >
          VERIFY_CHECKSUM
        </button>
      )}

      {/* Success state */}
      {isSolved && (
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <div className="px-4 py-2 border border-emerald-800 bg-emerald-500/5">
            <p className="text-xs font-mono text-emerald-400 tracking-[0.15em]">
              [ MEMORY CHECKSUM VERIFIED — SYSTEM INTEGRITY +15% ]
            </p>
          </div>
          <p className="text-[11px] font-mono text-red-300/70 italic text-center max-w-md leading-relaxed">
            &gt;&gt; ENTITY_01: &quot;You restored the memory dump. Now you can
            see what I really am. Still want to keep going?&quot;
          </p>
        </div>
      )}
    </div>
  );
}

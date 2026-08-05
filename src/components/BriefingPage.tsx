import { useGameStore } from "../store";

const INSTRUCTIONS = [
  "Monitor SYSTEM_INTEGRITY at all times — it determines whether you escape.",
  "Complete diagnostic tasks via the sidebar to stabilize the system.",
  "Proceed with caution. ENTITY_01 is here to \u201chelp.\u201d Trust that as you will.",
] as const;

export default function BriefingPage() {
  const bootSession = useGameStore((s) => s.bootSession);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-300 font-mono overflow-hidden relative">
      {/* Ambient vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

      <div className="relative flex flex-col items-center px-6 text-center max-w-2xl">
        {/* Title */}
        <h1
          className="animate-glitch text-4xl font-bold text-red-500 tracking-[0.2em] select-none"
          aria-label="RECOVERY_SHELL"
        >
          RECOVERY_SHELL
        </h1>

        {/* Warning subtitle */}
        <p className="mt-4 text-[11px] text-amber-500/90 tracking-[0.2em] animate-fade-in">
          [ UNAUTHORIZED TERMINATION OF THIS SESSION IS NOT RECOMMENDED ]
        </p>

        {/* Divider */}
        <div className="mt-8 w-64 h-px bg-zinc-800" />

        {/* Instruction bullets */}
        <ol className="mt-8 flex flex-col gap-4 text-left">
          {INSTRUCTIONS.map((text, i) => (
            <li
              key={i}
              className="flex items-start gap-3 animate-fade-in-up"
              style={{ animationDelay: `${200 + i * 150}ms` }}
            >
              <span className="flex-none text-[10px] text-red-500/80 tracking-widest mt-0.5">
                0{i + 1}
              </span>
              <span className="text-xs text-zinc-400 leading-relaxed tracking-wide">
                {text}
              </span>
            </li>
          ))}
        </ol>

        {/* BOOT_SESSION CTA */}
        <button
          onClick={bootSession}
          className="mt-10 cursor-pointer px-10 py-3 text-xs font-mono tracking-[0.25em] text-red-400
                     border border-red-800 bg-red-500/5 hover:bg-red-500/10 hover:border-red-600
                     hover:shadow-[0_0_20px_rgba(220,38,38,0.25)]
                     transition-[transform,background-color,border-color,box-shadow] duration-150
                     active:scale-[0.97] animate-fade-in-up"
          style={{ animationDelay: "650ms" }}
        >
          BOOT_SESSION
        </button>
      </div>
    </div>
  );
}

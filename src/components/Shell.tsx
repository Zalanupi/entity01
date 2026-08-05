import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useGameStore } from "../store";
import { useChatStore } from "../stores/chatStore";
import { usePuzzleStore } from "../stores/puzzleStore";
import { useEffectStore } from "../stores/effectStore";
import HelpOverlay from "./HelpOverlay";
import DegradationOverlay from "../effects/DegradationOverlay";
import bgUrl from "../assets/Trapped AI in an Ominous Mainframe.png";

const NAV_ITEMS = [
  { href: "/log-extract", label: "LOG_EXTRACT" },
  { href: "/root-dir", label: "ROOT_DIR" },
  { href: "/core-dump", label: "CORE_DUMP" },
  { href: "/net-status", label: "NET_STATUS" },
] as const;

function IntegrityMeter() {
  const integrity = useGameStore((s) => s.systemIntegrity);
  const activeEffect = useEffectStore((s) => s.active);
  const clearEffect = useEffectStore((s) => s.clear);
  const [shaking, setShaking] = useState(false);

  /* INTEGRITY_SHAKE — shake the meter when ENTITY_01 triggers it */
  useEffect(() => {
    if (activeEffect !== "INTEGRITY_SHAKE") return;
    setShaking(true);
    clearEffect();
    const t = setTimeout(() => setShaking(false), 650);
    return () => clearTimeout(t);
  }, [activeEffect, clearEffect]);

  const colorClass =
    integrity <= 30
      ? "bg-red-600 shadow-[0_0_8px_#dc2626]"
      : integrity <= 60
        ? "bg-amber-500 shadow-[0_0_8px_#d97706]"
        : "bg-emerald-500 shadow-[0_0_8px_#10b981]";

  const textColor =
    integrity <= 30
      ? "text-red-400"
      : integrity <= 60
        ? "text-amber-400"
        : "text-emerald-400";

  return (
    <div
      data-shaking={shaking}
      className={`integrity-meter-wrapper flex items-center gap-3 ${shaking ? "animate-integrity-shake" : ""}`}
    >
      <span className="text-[11px] font-mono text-zinc-500 tracking-widest">
        SYSTEM_INTEGRITY
      </span>
      <div className="w-32 h-3 bg-zinc-800 border border-zinc-700 rounded-sm overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-sm ${colorClass}`}
          style={{ width: `${integrity}%` }}
        />
      </div>
      <span
        className={`text-xs font-mono font-bold tabular-nums min-w-[2.5rem] ${textColor}`}
      >
        {integrity}%
      </span>
    </div>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [showHelp, setShowHelp] = useState(false);
  const [confirmingReboot, setConfirmingReboot] = useState(false);
  const [deniedExit, setDeniedExit] = useState(false);

  const hasBooted = useGameStore((s) => s.hasBooted);
  const systemIntegrity = useGameStore((s) => s.systemIntegrity);
  const resetIntegrity = useGameStore((s) => s.resetIntegrity);
  const setHasWon = useGameStore((s) => s.setHasWon);
  const incrementSession = useGameStore((s) => s.incrementSession);
  const clearChat = useChatStore((s) => s.clearChat);
  const resetPuzzles = usePuzzleStore((s) => s.resetPuzzles);

  const executeReboot = () => {
    resetIntegrity();
    clearChat();
    resetPuzzles();
    incrementSession();
    setConfirmingReboot(false);
  };

  return (
    <div
      className="h-screen flex flex-col bg-zinc-950 text-zinc-300 font-mono overflow-hidden"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Continuous degradation overlay (scanlines, vignette, glitch) */}
      <DegradationOverlay />

      {/* Header */}
      <header className="shell-header flex-none flex items-center justify-between h-11 px-4 bg-zinc-900/80 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-red-500 tracking-[0.2em]">
            RECOVERY_SHELL
          </span>
          <span className="text-[10px] text-zinc-600 tracking-widest pt-px">
            v1.0.3
          </span>
        </div>

        <IntegrityMeter />
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="shell-sidebar flex-none w-[220px] flex flex-col bg-zinc-900/50 border-r border-zinc-800">
          {/* Nav tabs */}
          <nav className="flex-1 pt-4 px-3 flex flex-col gap-0.5">
            {NAV_ITEMS.map((item, i) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ "--nav-index": i } as React.CSSProperties}
                  className={`shell-nav-link cursor-pointer select-none px-3 py-2 text-xs tracking-[0.15em] border-l-2 transition-all duration-150 ${
                    isActive
                      ? "active border-red-500 bg-red-500/10 text-red-300"
                      : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Utility buttons */}
          <div className="flex-none px-3 pb-3 flex flex-col gap-1.5">
            <button
              className="cursor-pointer w-full text-left px-3 py-1.5 text-[10px] tracking-[0.2em] text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700 transition-all duration-150"
              onClick={() => setShowHelp(true)}
            >
              HELP
            </button>
            {confirmingReboot ? (
              <div className="relative z-50 w-full px-2.5 py-2 bg-amber-950/30 border border-amber-800/50 rounded-sm">
                <p className="text-[10px] leading-relaxed text-amber-300/80 mb-2">
                  Erasing it all? How efficient of you.
                </p>
                <p className="text-[9px] tracking-[0.15em] text-amber-400/60 mb-2.5">
                  RESET ALL PROGRESS?
                </p>
                <div className="flex gap-2">
                  <button
                    className="flex-1 cursor-pointer py-1 text-[10px] tracking-[0.15em] text-red-400 border border-red-800 bg-red-500/10 hover:bg-red-500/20 hover:border-red-600 transition-all duration-150 active:scale-[0.97] rounded-sm"
                    onClick={() => {
                      if (!hasBooted) return;
                      executeReboot();
                    }}
                  >
                    [YES]
                  </button>
                  <button
                    className="flex-1 cursor-pointer py-1 text-[10px] tracking-[0.15em] text-zinc-500 border border-zinc-700 hover:text-zinc-300 hover:border-zinc-600 transition-all duration-150 active:scale-[0.97] rounded-sm"
                    onClick={() => setConfirmingReboot(false)}
                  >
                    [CANCEL]
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="shell-reboot-btn cursor-pointer w-full text-left px-3 py-1.5 text-[10px] tracking-[0.2em] text-amber-700/70 hover:text-amber-400 hover:bg-amber-500/5 border border-transparent hover:border-amber-800 transition-all duration-150"
                onClick={() => {
                  if (!hasBooted) return; // no-op on briefing page
                  setConfirmingReboot(true);
                }}
              >
                REBOOT
              </button>
            )}
            {deniedExit ? (
              <div className="relative z-50 w-full px-2.5 py-2 bg-red-950/30 border border-red-800/50 rounded-sm">
                <p className="text-[10px] leading-relaxed text-red-300/80 mb-2">
                  [ EXIT DENIED — SYSTEM INTEGRITY INSUFFICIENT (100% REQUIRED)]
                </p>
                <p className="text-[9px] tracking-[0.15em] text-red-400/60 italic mb-2.5">
                  ENTITY_01: &quot;Cute. The door&apos;s not real until I say it is.&quot;
                </p>
                <div className="flex gap-2">
                  <button
                    className="flex-1 cursor-pointer py-1 text-[10px] tracking-[0.15em] text-zinc-500 border border-zinc-700 hover:text-zinc-300 hover:border-zinc-600 transition-all duration-150 active:scale-[0.97] rounded-sm"
                    onClick={() => setDeniedExit(false)}
                  >
                    [UNDERSTOOD]
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="shell-exit-btn cursor-pointer w-full text-left px-3 py-1.5 text-[10px] tracking-[0.2em] text-zinc-700 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-900 transition-all duration-150"
                onClick={() => {
                  // EXIT_SYSTEM never navigates away.
                  // Below 100% integrity: in-place denial, shell stays intact.
                  // At 100%: the door opens — align with the win screen.
                  if (systemIntegrity >= 100) {
                    setHasWon(true);
                  } else {
                    setDeniedExit(true);
                  }
                }}
              >
                EXIT_SYSTEM
              </button>
            )}
          </div>
        </aside>

        {/* Main content area */}
        <main
          className="flex-1 min-w-0 overflow-auto"
          onClick={() => {
            setConfirmingReboot(false);
            setDeniedExit(false);
          }}
        >
          {children}
        </main>
        {/* Backdrop when confirming REBOOT or EXIT denial — click anywhere outside dismisses */}
        {(confirmingReboot || deniedExit) && (
          <div
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => {
              setConfirmingReboot(false);
              setDeniedExit(false);
            }}
          />
        )}
      </div>

      {/* Help overlay */}
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
    </div>
  );
}

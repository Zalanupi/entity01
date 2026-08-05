import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useGameStore } from "../store";
import { useChatStore } from "../stores/chatStore";

const NAV_ITEMS = [
  { href: "/log-extract", label: "LOG_EXTRACT" },
  { href: "/root-dir", label: "ROOT_DIR" },
  { href: "/core-dump", label: "CORE_DUMP" },
  { href: "/net-status", label: "NET_STATUS" },
] as const;

function IntegrityMeter() {
  const integrity = useGameStore((s) => s.systemIntegrity);

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
    <div className="flex items-center gap-3">
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
  const resetIntegrity = useGameStore((s) => s.resetIntegrity);
  const clearChat = useChatStore((s) => s.clearChat);

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-300 font-mono overflow-hidden">
      {/* Header */}
      <header className="flex-none flex items-center justify-between h-11 px-4 bg-zinc-900/80 border-b border-zinc-800">
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
        <aside className="flex-none w-[220px] flex flex-col bg-zinc-900/50 border-r border-zinc-800">
          {/* Nav tabs */}
          <nav className="flex-1 pt-4 px-3 flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`cursor-pointer select-none px-3 py-2 text-xs tracking-[0.15em] border-l-2 transition-all duration-150 ${
                    isActive
                      ? "border-red-500 bg-red-500/10 text-red-300"
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
              onClick={() => {
                // TODO: HELP modal or ENTITY_01 response
                console.log("HELP requested");
              }}
            >
              HELP
            </button>
            <button
              className="cursor-pointer w-full text-left px-3 py-1.5 text-[10px] tracking-[0.2em] text-amber-700/70 hover:text-amber-400 hover:bg-amber-500/5 border border-transparent hover:border-amber-800 transition-all duration-150"
              onClick={() => {
                resetIntegrity();
                clearChat();
              }}
            >
              REBOOT
            </button>
            <button
              className="cursor-pointer w-full text-left px-3 py-1.5 text-[10px] tracking-[0.2em] text-zinc-700 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-900 transition-all duration-150"
              onClick={() => {
                // TODO: "you can't leave" horror moment
                console.log("EXIT_SYSTEM requested");
              }}
            >
              EXIT_SYSTEM
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 min-w-0 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

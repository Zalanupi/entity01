import { useEffect, useRef } from "react";
import { useEffectStore } from "../stores/effectStore";
import { usePrefersReducedMotion } from "./useReducedMotion";
import { playCrashThud, playStaticBurst } from "./sound";

export default function FakeCrash() {
  const clear = useEffectStore((s) => s.clear);
  const reduced = usePrefersReducedMotion();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    playCrashThud();
    playStaticBurst(600);

    if (reduced) {
      timerRef.current = setTimeout(clear, 300);
    } else {
      timerRef.current = setTimeout(clear, 1200);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [clear, reduced]);

  if (reduced) {
    return (
      <div
        data-effect="fake-crash"
        className="fixed inset-0 z-[10000] pointer-events-none bg-black animate-fade-in"
        aria-hidden="true"
        role="presentation"
      />
    );
  }

  return (
    <div
      data-effect="fake-crash"
      className="fixed inset-0 z-[10000] pointer-events-none bg-black flex items-center justify-center overflow-hidden"
      aria-hidden="true"
      role="presentation"
    >
      {/* Phase 1: black screen (instant) */}
      {/* Phase 2: distorted crash screen (appears after 200ms via keyframe) */}
      <div
        className="absolute inset-0 flex items-center justify-center animate-crash-in"
        style={{ animationDelay: "200ms" }}
      >
        {/* Glitched terminal frame */}
        <div
          className="relative w-[80%] max-w-[600px] border-2 border-red-700 bg-black/90 p-8 animate-crash-distort"
          style={{
            boxShadow: "0 0 40px rgba(220,38,38,0.4), inset 0 0 40px rgba(220,38,38,0.1)",
          }}
        >
          {/* Distorted text content */}
          <div className="space-y-4 animate-crash-skew">
            <p
              className="text-center text-2xl font-bold tracking-[0.2em] text-red-500 animate-glitch"
              style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: "0 0 10px rgba(255,0,0,0.5)" }}
            >
              ⚠ SYSTEM_CRASH
            </p>
            <p className="text-center text-sm text-red-400/70 tracking-widest">
              SIGNAL LOST — CRITICAL FAILURE
            </p>
            <div className="border-t border-red-800/50 my-4" />
            <pre className="text-[11px] leading-relaxed text-red-400/60 font-mono">
              {`FATAL: unrecoverable sector fault at 0xDEAD_BEEF
daemon: pid 0 — core dumped
watchdog: heartbeat timed out (0x00)
mem: segmentation violation
panic: cannot locate boot sector`}
            </pre>
            <p className="text-center pt-2 text-xs text-red-500/80 tracking-widest animate-pulse">
              [ REBOOT REQUIRED ]
            </p>
          </div>

          {/* Glitch overlay slices */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 bg-red-600/10 mix-blend-screen"
                style={{
                  top: `${10 + i * 20}%`,
                  height: "3px",
                  animation: `glitch-slice ${0.4 + Math.random() * 0.3}s ease-in-out ${Math.random() * 0.2}s infinite alternate`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
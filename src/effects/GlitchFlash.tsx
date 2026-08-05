import { useEffect, useRef } from "react";
import { useEffectStore } from "../stores/effectStore";
import { usePrefersReducedMotion } from "./useReducedMotion";
import { playStaticBurst } from "./sound";

const DURATION_MS = 550;

export default function GlitchFlash() {
  const clear = useEffectStore((s) => s.clear);
  const reduced = usePrefersReducedMotion();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    playStaticBurst(400);

    if (reduced) {
      // Reduced motion: brief static opacity flash only
      timerRef.current = setTimeout(clear, 150);
    } else {
      timerRef.current = setTimeout(clear, DURATION_MS);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [clear, reduced]);

  if (reduced) {
    return (
      <div
        data-effect="glitch-flash"
        className="fixed inset-0 z-[10000] pointer-events-none bg-red-900/30 animate-fade-in"
        aria-hidden="true"
        role="presentation"
      />
    );
  }

  return (
    <div
      data-effect="glitch-flash"
      className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden"
      aria-hidden="true"
      role="presentation"
    >
      {/* Full-screen RGB noise overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZjQ0IiBmaWxsLW9wYWNpdHk9IjAuMDYiLz48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDBmIiBmaWxsLW9wYWNpdHk9IjAuMDYiLz48L3N2Zz4=')] opacity-50 mix-blend-screen animate-glitch-flash-noise" />

      {/* Animated horizontal glitch slices */}
      <div className="absolute inset-0 animate-glitch-flash-slices">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-[6px] bg-red-500/20 mix-blend-screen"
            style={{
              top: `${(i / 8) * 100}%`,
              animation: `glitch-slice ${0.3 + Math.random() * 0.4}s ease-in-out ${Math.random() * 0.3}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* RGB-split text */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: "glitch-flash-text 0.4s steps(1) 3" }}
      >
        <span
          className="text-3xl font-bold tracking-[0.3em] select-none"
          style={{
            color: "#f44",
            textShadow:
              "3px 0 0 #0ff, -3px 0 0 #f0f, 0 0 12px rgba(255,68,68,0.6)",
            fontFamily: "'JetBrains Mono', monospace",
            animation: "glitch-flash-text-offset 0.2s steps(2) 6",
          }}
        >
          SIGNAL CORRUPTED
        </span>
      </div>
    </div>
  );
}
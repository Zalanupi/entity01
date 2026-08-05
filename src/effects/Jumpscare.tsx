import { useEffect, useRef, useState } from "react";
import { useEffectStore } from "../stores/effectStore";
import { usePrefersReducedMotion } from "./useReducedMotion";
import { playJumpscareSting } from "./sound";

export default function Jumpscare() {
  const clear = useEffectStore((s) => s.clear);
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Delay ~120ms so the player reads the unsettling chat line first,
    // then the jumpscare hits
    const showTimer = setTimeout(() => {
      setVisible(true);
      playJumpscareSting();

      if (reduced) {
        // Reduced motion: short visible flash then fade out
        timerRef.current = setTimeout(() => {
          setFadingOut(true);
          timerRef.current = setTimeout(clear, 150);
        }, 300);
      } else {
        // Normal: hold for the full 0.6s strobe cycle, then fade out over 150ms
        timerRef.current = setTimeout(() => {
          setFadingOut(true);
          timerRef.current = setTimeout(clear, 150);
        }, 600);
      }
    }, 120);

    return () => {
      clearTimeout(showTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [clear, reduced]);

  if (!visible) return null;

  if (reduced) {
    return (
      <div
        data-effect="jumpscare"
        className={`fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center ${
          fadingOut ? "animate-jumpscare-fadeout" : ""
        }`}
        aria-hidden="true"
        role="presentation"
      >
        <div className="absolute inset-0 bg-red-900/60 animate-fade-in" />
      </div>
    );
  }

  return (
    <div
      data-effect="jumpscare"
      className={`fixed inset-0 z-[10000] pointer-events-none overflow-hidden ${
        fadingOut ? "animate-jumpscare-fadeout" : ""
      }`}
      aria-hidden="true"
      role="presentation"
    >
      {/* Strobing red/white flash */}
      <div className="absolute inset-0 animate-jumpscare-strobe" />

      {/* Distorted face SVG */}
      <div className="absolute inset-0 flex items-center justify-center animate-jumpscare-zoom">
        <svg
          viewBox="0 0 200 200"
          className="w-[400px] h-[400px] max-w-[90vw] max-h-[90vh] blur-[1px]"
          style={{ filter: "contrast(1.4)" }}
        >
          {/* Skull-like face */}
          <defs>
            <filter id="glitch">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise">
                <animate attributeName="baseFrequency" values="0.05;0.1;0.03" dur="0.3s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          {/* Background */}
          <rect width="200" height="200" fill="#0a0a0a" />
          {/* Glowing eyes */}
          <circle cx="70" cy="80" r="18" fill="#ff0000" opacity="0.9" filter="url(#glitch)">
            <animate attributeName="r" values="18;14;20;16;18" dur="0.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="130" cy="80" r="18" fill="#ff0000" opacity="0.9" filter="url(#glitch)">
            <animate attributeName="r" values="18;20;14;18" dur="0.25s" repeatCount="indefinite" />
          </circle>
          {/* Pupils */}
          <circle cx="70" cy="80" r="6" fill="#fff" opacity="0.8">
            <animate attributeName="cx" values="70;68;72;68;70" dur="0.15s" repeatCount="indefinite" />
          </circle>
          <circle cx="130" cy="80" r="6" fill="#fff" opacity="0.8">
            <animate attributeName="cx" values="130;132;128;132;130" dur="0.18s" repeatCount="indefinite" />
          </circle>
          {/* Screaming mouth */}
          <ellipse cx="100" cy="135" rx="30" ry="22" fill="#1a0000" stroke="#ff0000" strokeWidth="2" filter="url(#glitch)">
            <animate attributeName="ry" values="22;18;24;20;22" dur="0.2s" repeatCount="indefinite" />
          </ellipse>
          {/* Teeth rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x={67 + i * 8}
              y="120"
              width="5"
              height="8"
              fill="#fff"
              opacity="0.4"
              rx="1"
            >
              <animate attributeName="opacity" values="0.4;0.1;0.5;0.2;0.4" dur={`${0.15 + Math.random() * 0.2}s`} repeatCount="indefinite" />
            </rect>
          ))}
          {/* Cracks */}
          <path d="M20 50 L45 90 L30 130" stroke="#ff000044" strokeWidth="1.5" fill="none" />
          <path d="M180 30 L155 80 L170 140" stroke="#ff000044" strokeWidth="1.5" fill="none" />
          {/* Scanlines */}
          <pattern id="scan" width="2" height="4" patternUnits="userSpaceOnUse">
            <rect width="2" height="2" fill="#fff" opacity="0.04" />
          </pattern>
          <rect width="200" height="200" fill="url(#scan)" />
        </svg>
      </div>
    </div>
  );
}
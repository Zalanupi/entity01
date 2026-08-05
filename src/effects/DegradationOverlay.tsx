import { useEffect, useRef } from "react";
import { useDegradationTier } from "./degradation";

const ATTR = "data-degradation";

/**
 * Mounted inside Shell (after the app has booted). Sets `data-degradation`
 * on <html> so every element in the shell inherits the tier's CSS treatment.
 * Renders optional full-viewport overlay layers (scanlines, vignette, glitch)
 * that change opacity/intensity based on the tier.
 *
 * Unmounts when Shell unmounts (win / loss screen) — clean tier re-set.
 */
export default function DegradationOverlay() {
  const tier = useDegradationTier();
  const prevTier = useRef(tier);

  /* ── Write the tier attribute on <html> ── */
  useEffect(() => {
    if (tier === prevTier.current) return;
    prevTier.current = tier;
    document.documentElement.setAttribute(ATTR, tier);
    return () => {
      /* cleanup only on unmount — we don't remove between transitions */
    };
  }, [tier]);

  /* ── Set initial value on mount ── */
  useEffect(() => {
    document.documentElement.setAttribute(ATTR, tier);
    prevTier.current = tier;
    return () => {
      document.documentElement.removeAttribute(ATTR);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Intensified scanlines — always present, opacity varies with tier */}
      <div
        data-tier={tier}
        className="degradation-scanlines fixed inset-0 pointer-events-none z-[9000]"
        aria-hidden="true"
        role="presentation"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
          opacity: tier === "critical" ? 0.7 : tier === "unstable" ? 0.4 : 0.15,
          transition: "opacity 0.6s ease-out",
        }}
      />

      {/* Red vignette — only visible at critical */}
      <div
        data-tier={tier}
        className="degradation-vignette fixed inset-0 pointer-events-none z-[9001]"
        aria-hidden="true"
        role="presentation"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(220,38,38,0.15) 85%, rgba(127,0,0,0.25) 100%)",
          opacity: tier === "critical" ? 1 : 0,
          transition: "opacity 0.8s ease-out",
        }}
      />

      {/* Glitch slices at critical — subtle, continuous */}
      {tier === "critical" && (
        <div
          className="degradation-glitch fixed inset-0 pointer-events-none z-[9002] overflow-hidden"
          aria-hidden="true"
          role="presentation"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 bg-red-500/8 mix-blend-screen"
              style={{
                height: `${4 + Math.random() * 6}px`,
                top: `${10 + Math.random() * 80}%`,
                animation: `glitch-slice ${0.6 + Math.random() * 0.8}s ease-in-out ${Math.random() * 2}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
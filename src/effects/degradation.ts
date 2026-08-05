import { useGameStore } from "../store";

/** Tier reflects how degraded the shared UI chrome should look. */
export type DegradationTier = "stable" | "unstable" | "critical";

export const STABLE_MIN = 61;    // >60 → stable
export const CRITICAL_MAX = 30;  // ≤30 → critical

export function getDegradationTier(integrity: number): DegradationTier {
  if (integrity <= CRITICAL_MAX) return "critical";
  if (integrity < STABLE_MIN) return "unstable";
  return "stable";
}

/** Subscribe to systemIntegrity and return the live tier (primitive — safe selector). */
export function useDegradationTier(): DegradationTier {
  return useGameStore((s) => getDegradationTier(s.systemIntegrity));
}
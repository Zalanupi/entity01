import { create } from "zustand";
import type { EntityAction } from "./chatStore";

interface EffectState {
  /** The currently playing visual effect (null = idle). Latest wins. */
  active: EntityAction | null;
  /** Trigger a new visual effect (replaces any currently playing one). */
  fire: (action: EntityAction) => void;
  /** Clear the current effect (called by overlay components when they finish). */
  clear: () => void;
}

export const useEffectStore = create<EffectState>((set) => ({
  active: null,
  fire: (action) => set({ active: action }),
  clear: () => set({ active: null }),
}));
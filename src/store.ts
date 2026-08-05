import { create } from "zustand";

interface GameState {
  systemIntegrity: number;
  hasBooted: boolean;
  /** True when the player escapes via EXIT_SYSTEM at 100% integrity —
   *  renders the WinScreen instead of the Shell. */
  hasWon: boolean;
  /** Increments on every hard reset (REBOOT). Used as a React
   *  `key` on puzzle routes so their interactive state remounts fresh. */
  sessionId: number;
  increaseIntegrity: (amount: number) => void;
  setExactIntegrity: (value: number) => void;
  decreaseIntegrity: (amount: number) => void;
  resetIntegrity: () => void;
  bootSession: () => void;
  setHasBooted: (value: boolean) => void;
  setHasWon: (value: boolean) => void;
  incrementSession: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  systemIntegrity: 42,
  hasBooted: false,
  hasWon: false,
  sessionId: 0,

  increaseIntegrity: (amount: number) =>
    set((state) => ({
      systemIntegrity: Math.min(state.systemIntegrity + amount, 100),
    })),

  /** Sets integrity to an exact value (used for the "final puzzle → 100" rule). */
  setExactIntegrity: (value: number) =>
    set({ systemIntegrity: value }),

  decreaseIntegrity: (amount: number) =>
    set((state) => ({
      systemIntegrity: Math.max(state.systemIntegrity - amount, 0),
    })),

  resetIntegrity: () => set({ systemIntegrity: 42 }),

  bootSession: () => set({ hasBooted: true }),

  setHasBooted: (value: boolean) => set({ hasBooted: value }),

  setHasWon: (value: boolean) => set({ hasWon: value }),

  incrementSession: () =>
    set((state) => ({ sessionId: state.sessionId + 1 })),
}));

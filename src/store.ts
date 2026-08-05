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
  /** Content variant (0–2) selected for each rotating puzzle.
   *  Re-rolled on every fresh boot and every REBOOT; persists across
   *  tab navigation within the session. */
  variants: { rootDir: number; coreDump: number };
  increaseIntegrity: (amount: number) => void;
  setExactIntegrity: (value: number) => void;
  decreaseIntegrity: (amount: number) => void;
  resetIntegrity: () => void;
  bootSession: () => void;
  setHasBooted: (value: boolean) => void;
  setHasWon: (value: boolean) => void;
  incrementSession: () => void;
  rollVariants: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  systemIntegrity: 42,
  hasBooted: false,
  hasWon: false,
  sessionId: 0,
  variants: { rootDir: 0, coreDump: 0 },

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

  /** Picks a fresh random content variant (0–2) for each rotating puzzle. */
  rollVariants: () =>
    set({
      variants: {
        rootDir: Math.floor(Math.random() * 3),
        coreDump: Math.floor(Math.random() * 3),
      },
    }),

  bootSession: () => {
    /* Fresh boot: roll content variants for the new session */
    useGameStore.getState().rollVariants();
    set({ hasBooted: true });
  },

  setHasBooted: (value: boolean) => set({ hasBooted: value }),

  setHasWon: (value: boolean) => set({ hasWon: value }),

  incrementSession: () => {
    /* REBOOT (Shell or LossScreen): re-roll content variants — both
     * reboot paths funnel through here, so App's sessionId key remounts
     * the puzzles with the newly selected variants. */
    useGameStore.getState().rollVariants();
    set((state) => ({ sessionId: state.sessionId + 1 }));
  },
}));

import { create } from "zustand";

interface GameState {
  systemIntegrity: number;
  hasBooted: boolean;
  /** Increments on every hard reset (REBOOT/EXIT_SYSTEM). Used as a React
   *  `key` on puzzle routes so their interactive state remounts fresh. */
  sessionId: number;
  increaseIntegrity: (amount: number) => void;
  decreaseIntegrity: (amount: number) => void;
  resetIntegrity: () => void;
  bootSession: () => void;
  setHasBooted: (value: boolean) => void;
  incrementSession: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  systemIntegrity: 42,
  hasBooted: false,
  sessionId: 0,

  increaseIntegrity: (amount: number) =>
    set((state) => ({
      systemIntegrity: Math.min(state.systemIntegrity + amount, 100),
    })),

  decreaseIntegrity: (amount: number) =>
    set((state) => ({
      systemIntegrity: Math.max(state.systemIntegrity - amount, 0),
    })),

  resetIntegrity: () => set({ systemIntegrity: 42 }),

  bootSession: () => set({ hasBooted: true }),

  setHasBooted: (value: boolean) => set({ hasBooted: value }),

  incrementSession: () =>
    set((state) => ({ sessionId: state.sessionId + 1 })),
}));

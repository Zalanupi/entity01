import { create } from "zustand";

interface GameState {
  systemIntegrity: number;
  hasBooted: boolean;
  increaseIntegrity: (amount: number) => void;
  decreaseIntegrity: (amount: number) => void;
  resetIntegrity: () => void;
  bootSession: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  systemIntegrity: 42,
  hasBooted: false,

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
}));

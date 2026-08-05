import { create } from "zustand";

interface GameState {
  systemIntegrity: number;
  increaseIntegrity: (amount: number) => void;
  decreaseIntegrity: (amount: number) => void;
  resetIntegrity: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  systemIntegrity: 42,

  increaseIntegrity: (amount: number) =>
    set((state) => ({
      systemIntegrity: Math.min(state.systemIntegrity + amount, 100),
    })),

  decreaseIntegrity: (amount: number) =>
    set((state) => ({
      systemIntegrity: Math.max(state.systemIntegrity - amount, 0),
    })),

  resetIntegrity: () => set({ systemIntegrity: 42 }),
}));

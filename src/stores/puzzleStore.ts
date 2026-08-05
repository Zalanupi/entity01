import { create } from "zustand";

export type PuzzleId = "rootDir" | "coreDump" | "netStatus";

interface PuzzleState {
  solved: Record<PuzzleId, boolean>;
  setSolved: (puzzle: PuzzleId, value: boolean) => void;
  resetPuzzles: () => void;
}

export const usePuzzleStore = create<PuzzleState>((set) => ({
  solved: {
    rootDir: false,
    coreDump: false,
    netStatus: false,
  },

  setSolved: (puzzle, value) =>
    set((state) => ({
      solved: { ...state.solved, [puzzle]: value },
    })),

  resetPuzzles: () =>
    set({
      solved: { rootDir: false, coreDump: false, netStatus: false },
    }),
}));
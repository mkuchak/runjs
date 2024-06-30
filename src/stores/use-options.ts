import { getStorage } from "@/lib/get-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  autoRun: boolean;
  cursor: {
    column: number;
    lineNumber: number;
  };
  minimap: boolean;
  scroll: {
    scrollLeft: number;
    scrollTop: number;
  };
  timer: boolean;
  wordWrap: boolean;
};

type Action = {
  setCursor: (cursor: State["cursor"]) => void;
  setScroll: (scroll: State["scroll"]) => void;
  toggleAutoRun: () => void;
  toggleMinimap: () => void;
  toggleTimer: () => void;
  toggleWordWrap: () => void;
};

export type OptionsStore = Action & State;

export const useOptions = create(
  persist<OptionsStore>(
    (set) => ({
      autoRun: false,
      cursor: {
        column: 1,
        lineNumber: 1,
      },
      minimap: false,
      scroll: {
        scrollLeft: 0,
        scrollTop: 0,
      },
      setCursor: (cursor) => set((state) => ({ ...state, cursor })),
      setScroll: (scroll) => set((state) => ({ ...state, scroll })),
      timer: false,
      toggleAutoRun: () =>
        set((state) => ({ ...state, autoRun: !state.autoRun })),
      toggleMinimap: () =>
        set((state) => ({ ...state, minimap: !state.minimap })),
      toggleTimer: () => set((state) => ({ ...state, timer: !state.timer })),
      toggleWordWrap: () =>
        set((state) => ({ ...state, wordWrap: !state.wordWrap })),
      wordWrap: false,
    }),
    {
      name: "run-js:options",
      storage: getStorage(),
      version: 1,
    }
  )
);

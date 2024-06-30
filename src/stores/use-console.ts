import { getStorage } from "@/lib/get-storage";
import { type Message } from "console-feed/lib/definitions/Component";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  logs: Message[];
};

type Action = {
  addLog: (log: Message) => void;
  clearLogs: () => void;
};

export type ConsoleStore = Action & State;

export const useConsole = create(
  persist<ConsoleStore>(
    (set) => ({
      addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
      clearLogs: () => set({ logs: [] }),
      logs: [],
    }),
    {
      name: "run-js:console",
      storage: getStorage(),
      version: 1,
    }
  )
);

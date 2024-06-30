import { type Message } from "console-feed/lib/definitions/Component";
import { create } from "zustand";

type State = {
  logs: Message[];
};

type Action = {
  addLog: (log: Message) => void;
  clearLogs: () => void;
};

export type ConsoleStore = Action & State;

export const useConsole = create<ConsoleStore>((set) => ({
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  clearLogs: () => set({ logs: [] }),
  logs: [],
}));

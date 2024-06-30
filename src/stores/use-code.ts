import { safeEval } from "@/lib/safe-eval";
import { useConsole } from "@/stores/use-console";
import { useOptions } from "@/stores/use-options";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  code: string;
};

type Action = {
  runCode: () => Promise<void>;
  setCode: (code: State["code"]) => void;
};

export type CodeStore = Action & State;

export const useCode = create(
  persist<CodeStore>(
    (set) => ({
      code: "",
      runCode: async () => {
        const duration = await safeEval(useCode.getState().code);
        useConsole.getState().clearLogs();
        if (useOptions.getState().timer) {
          console.debug(`Execution time was ${duration}ms`);
        }
      },
      setCode: (code) => set((state) => ({ ...state, code })),
    }),
    {
      name: "code",
      version: 1,
    }
  )
);

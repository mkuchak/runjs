import { consoleTheme } from "@/constants/console-theme";
import { Console as ConsoleFeed, Hook, Unhook } from "console-feed";
import { type Message } from "console-feed/lib/definitions/Component";
import { useEffect, useRef } from "react";

export type ConsoleProps = {
  logs: Message[];
  setLogs: React.Dispatch<React.SetStateAction<Message[]>>;
};

export function Console({ logs, setLogs }: ConsoleProps) {
  const consoleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to bottom
    consoleRef.current!.scroll(0, consoleRef.current!.scrollHeight);
  }, [logs]);

  useEffect(() => {
    const hookedConsole = Hook(
      window.console,
      (log) => setLogs((currLogs) => [...currLogs, log as Message]),
      false
    );

    return () => {
      Unhook(hookedConsole);
    };
  }, [setLogs]);

  return (
    <div className="overflow-y-auto" ref={consoleRef}>
      <ConsoleFeed logs={logs} styles={consoleTheme} variant="dark" />
    </div>
  );
}

import { consoleTheme } from "@/constants/console-theme";
import { useConsole } from "@/stores/use-console";
import { Console as ConsoleFeed, Hook, Unhook } from "console-feed";
import { type Message } from "console-feed/lib/definitions/Component";
import { useEffect } from "react";

export type ConsoleProps = {
  consoleRef: React.MutableRefObject<HTMLDivElement | null>;
};

export function Console({ consoleRef }: ConsoleProps) {
  const console = useConsole();

  // Scroll to bottom when new logs are added
  useEffect(() => {
    consoleRef.current!.scroll(0, consoleRef.current!.scrollHeight);
  }, [console.logs, consoleRef]);

  useEffect(() => {
    const hookedConsole = Hook(
      window.console,
      (log) => console.addLog(log as Message),
      false
    );

    return () => {
      Unhook(hookedConsole);
    };
  }, [console]);

  return (
    <div className="overflow-y-auto" ref={consoleRef}>
      <ConsoleFeed logs={console.logs} styles={consoleTheme} variant="dark" />
    </div>
  );
}

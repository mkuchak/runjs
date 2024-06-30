import { Console } from "@/components/console";
import { Editor } from "@/components/editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useWindowSize } from "@/hooks/use-window-size";
import { cn } from "@/lib/utils";
import { useCode } from "@/stores/use-code";
import { useConsole } from "@/stores/use-console";
import { useOptions } from "@/stores/use-options";
import {
  BanIcon,
  BugIcon,
  CodeIcon,
  MapIcon,
  PlayIcon,
  RefreshCwIcon,
  TerminalIcon,
  Trash2Icon,
  WrapTextIcon,
} from "lucide-react";
import { type editor } from "monaco-editor";
import { useRef } from "react";

export function App() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const consoleRef = useRef<HTMLDivElement | null>(null);
  const { width } = useWindowSize();
  const { runCode } = useCode();
  const { clearLogs } = useConsole();
  const options = useOptions();

  function deleteCode() {
    editorRef.current?.setValue("");
  }

  function formatCode() {
    editorRef.current?.getAction("editor.action.formatDocument")?.run();
  }

  useKeyboardShortcuts([
    {
      action: () => options.toggleMiniMap(),
      key: "m", // Add Alt+M to toggle minimap
      modifiers: { alt: true },
    },
    {
      action: () => {
        deleteCode();
        clearLogs();
      },
      key: "d", // Add Alt+D to delete code
      modifiers: { alt: true },
    },
    {
      action: () => options.toggleAutoRun(),
      key: "Enter", // Add Alt+Enter to toggle auto-run
      modifiers: { alt: true },
    },
    {
      action: () => clearLogs(),
      key: "l", // Add Ctrl+L to clear logs
      modifiers: { ctrl: true },
    },
    {
      action: () => runCode(),
      key: "Enter", // Add Ctrl+Enter to run code
      modifiers: { ctrl: true },
    },
    {
      action: () => options.toggleTimer(),
      key: "t", // Add Alt+T to toggle execution time
      modifiers: { alt: true },
    },
    {
      action: () => options.toggleWordWrap(),
      key: "l", // Add Alt+W to toggle word wrap
      modifiers: { alt: true },
    },
  ]);

  return (
    <main className="h-screen w-screen bg-[#0e141a] text-white">
      <ResizablePanelGroup
        autoSaveId="panel"
        className="overflow-auto"
        direction={width > 640 ? "horizontal" : "vertical"}
      >
        <ResizablePanel
          className="flex h-screen flex-col"
          defaultSize={70}
          minSize={20}
        >
          <div className="flex justify-between border-b border-[#171d23] p-2.5">
            <div className="flex items-center gap-2">
              <img alt="JavaScript" className="size-5" src="/js.svg" />
              <h1>Run.js</h1>
            </div>
            <div className="flex gap-0.5">
              <button
                className="rounded-md p-1 transition-colors hover:bg-[#171d23]"
                onClick={() => deleteCode()}
                title="Delete Code (Alt+D)"
                type="button"
              >
                <Trash2Icon size={16} strokeWidth={1.5} />
              </button>
              <button
                className="rounded-md p-1 transition-colors hover:bg-[#171d23]"
                onClick={() => formatCode()}
                title="Format Code (Shift+Alt+F)"
                type="button"
              >
                <CodeIcon size={16} strokeWidth={1.5} />
              </button>
              <button
                className={cn(
                  "rounded-md p-1 transition-colors hover:bg-[#171d23]",
                  options.minimap && "bg-[#232b33] hover:bg-[#232b33]"
                )}
                onClick={() => options.toggleMiniMap()}
                title={`${options.minimap ? "Disable" : "Enable"} Minimap (Alt+M)`}
                type="button"
              >
                <MapIcon size={16} strokeWidth={1.5} />
              </button>
              <button
                className={cn(
                  "rounded-md p-1 transition-colors hover:bg-[#171d23]",
                  options.wordWrap && "bg-[#232b33] hover:bg-[#232b33]"
                )}
                onClick={() => options.toggleWordWrap()}
                title={`${options.wordWrap ? "Disable" : "Enable"} Word Wrap (Alt+L)`}
                type="button"
              >
                <WrapTextIcon size={16} strokeWidth={1.5} />
              </button>
              <button
                className={cn(
                  "rounded-md p-1 transition-colors hover:bg-[#171d23]",
                  options.autoRun && "bg-[#232b33] hover:bg-[#232b33]"
                )}
                onClick={() => options.toggleAutoRun()}
                title={`${options.autoRun ? "Disable" : "Enable"} Auto-Run (Alt+Enter)`}
                type="button"
              >
                <RefreshCwIcon size={16} strokeWidth={1.5} />
              </button>
              <button
                className="rounded-md p-1 transition-colors hover:bg-[#171d23]"
                onClick={() => runCode()}
                title="Run code (Ctrl+Enter)"
                type="button"
              >
                <PlayIcon size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <Editor editorRef={editorRef} />
        </ResizablePanel>
        <ResizableHandle className="bg-[#171d23]" />
        <ResizablePanel
          className="flex h-screen flex-col"
          defaultSize={30}
          minSize={20}
        >
          <div className="flex justify-between border-b border-[#171d23] p-2.5">
            <div className="flex items-center gap-2">
              <TerminalIcon
                className="rounded-md bg-[#171d23] p-0.5"
                size={22}
              />
              <h2>Console</h2>
            </div>
            <div className="flex gap-0.5">
              <button
                className={cn(
                  "rounded-md p-1 transition-colors hover:bg-[#171d23]",
                  options.timer && "bg-[#232b33] hover:bg-[#232b33]"
                )}
                onClick={() => options.toggleTimer()}
                title={`${options.timer ? "Disable" : "Enable"} Execution Time (Alt+T)`}
                type="button"
              >
                <BugIcon size={16} strokeWidth={1.5} />
              </button>
              <button
                className="rounded-md p-1 transition-colors hover:bg-[#171d23]"
                onClick={() => clearLogs()}
                title="Clear Console (Ctrl+L)"
                type="button"
              >
                <BanIcon size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <Console consoleRef={consoleRef} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}

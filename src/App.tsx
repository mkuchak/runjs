import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { consoleTheme } from "@/constants/console-theme";
import { editorTheme } from "@/constants/editor-theme";
import { cn } from "@/lib/utils";
import Editor, { type Monaco } from "@monaco-editor/react";
import { Console, Hook, Unhook } from "console-feed";
import { type Message } from "console-feed/lib/definitions/Component";
import {
  BanIcon,
  CodeIcon,
  PlayIcon,
  RefreshCwIcon,
  TerminalIcon,
  Trash2Icon,
} from "lucide-react";
import { editor } from "monaco-editor";
import * as prettier from "prettier";
import * as babelParser from "prettier/parser-babel";
import * as babelPlugin from "prettier/plugins/babel";
import * as estreePlugin from "prettier/plugins/estree";
import { useCallback, useEffect, useRef, useState } from "react";

export function App() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const consoleRef = useRef<HTMLDivElement | null>(null);
  const [logs, setLogs] = useState<Message[]>([]);
  const [autoRun, setAutoRun] = useState(false);

  const deleteCode = useCallback(() => {
    editorRef.current?.setValue("");
  }, [editorRef]);

  const clearConsole = useCallback(() => {
    setLogs([]);
  }, []);

  const formatCode = useCallback(() => {
    editorRef.current?.getAction("editor.action.formatDocument")?.run();
  }, [editorRef]);

  const toggleAutoRun = useCallback(() => {
    setAutoRun((currAutoRun) => {
      localStorage.setItem("autorun", String(!currAutoRun));
      return !currAutoRun;
    });
  }, []);

  const runCode = useCallback(
    (code?: string) => {
      clearConsole();
      eval(code || editorRef.current?.getValue() || "");
    },
    [clearConsole, editorRef]
  );

  function handleEditorChange(
    value: string | undefined
    // event: editor.IModelContentChangedEvent
  ) {
    // here is the current value
    //   console.log("here is the current model value:", value);
    localStorage.setItem("code", value || "");
    clearConsole();
    runCode(value);
  }

  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    // console.log("onMount: the editor instance:", editor);
    // console.log("onMount: the monaco instance:", monaco);

    editor.setValue(localStorage.getItem("code") || "");
    editor.focus();
    editor.setPosition(
      JSON.parse(localStorage.getItem("cursor") || "null") || {
        column: 1,
        lineNumber: 1,
      }
    );
    monaco.editor.defineTheme("Sorcerer", editorTheme);
    monaco.editor.setTheme("Sorcerer");

    // change default font size
    editor.updateOptions({
      fontFamily: "Rec Mono Casual, Fira Code, Inter, monospace",
      fontLigatures: true,
    });

    // interface IKeybindingRule {
    //   keybinding: number;
    //   command?: string | null;
    //   commandArgs?: any;
    //   when?: string | null;
    // }
    monaco.editor.addKeybindingRules([
      {
        command: "",
        // remove Ctrl+L (format code)
        keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL,
      },
      {
        command: "",
        // remove Ctrl+Enter (run code)
        keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      },
      {
        command: "",
        // remove Alt+Enter (toggle auto-run)
        keybinding: monaco.KeyMod.Alt | monaco.KeyCode.KeyL,
      },
      {
        command: "",
        // remove Ctrl+Shift+R
        keybinding:
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyR,
      },
      {
        command: "editor.action.deleteLines",
        // add Ctrl+Shift+X (delete current line)
        keybinding:
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyX,
      },
    ]);

    editor.onDidChangeCursorPosition((e) => {
      localStorage.setItem("cursor", JSON.stringify(e.position));
    });

    monaco.languages.registerDocumentFormattingEditProvider("javascript", {
      provideDocumentFormattingEdits: async (model) => {
        const text = model.getValue();
        const formatted = await prettier.format(text, {
          parser: "babel",
          plugins: [babelPlugin, estreePlugin, babelParser],
        });

        return [
          {
            range: model.getFullModelRange(),
            text: formatted,
          },
        ];
      },
    });
  }

  function handleEditorWillMount() {
    // monaco: Monaco
    // console.log("beforeMount: the monaco instance:", monaco);
  }

  function handleEditorValidation(markers: editor.IMarker[]) {
    // model markers
    markers.forEach((marker) => console.error(marker.message));
  }

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
  }, []);

  useEffect(() => {
    setAutoRun(localStorage.getItem("autorun") === "true");
  }, []);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      // add Alt+L (delete code)
      if (e.altKey && e.key === "l") {
        e.preventDefault();
        deleteCode();
        clearConsole();
      }
      // add Alt+Enter (toggle auto-run)
      if (e.altKey && e.key === "Enter") {
        e.preventDefault();
        toggleAutoRun();
      }
      // add Ctrl+L (clear console)
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        clearConsole();
      }
      // add Ctrl+Enter (run code)
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [deleteCode, clearConsole, runCode]);

  return (
    <main className="h-screen w-screen bg-[#0e141a] text-white">
      <ResizablePanelGroup
        className="overflow-auto"
        direction="horizontal"
        // direction="vertical"
        // direction={() => (window.innerWidth > 640 ? "horizontal" : "vertical")}
      >
        <ResizablePanel className="flex h-screen flex-col">
          <div className="flex justify-between border-b border-[#171d23] p-2.5">
            <div className="flex items-center gap-2">
              <img alt="JavaScript" className="size-5" src="/js.svg" />
              <h1>Run.js</h1>
            </div>
            <div className="flex gap-0.5">
              <button
                className="rounded-lg p-1 transition-colors hover:bg-[#171d23]"
                onClick={() => deleteCode()}
                title="Delete code (Alt+L)"
                type="button"
              >
                <Trash2Icon size={16} />
              </button>
              <button
                className="rounded-lg p-1 transition-colors hover:bg-[#171d23]"
                onClick={() => formatCode()}
                title="Format code (Shift+Alt+F)"
                type="button"
              >
                <CodeIcon size={16} />
              </button>
              <button
                // className="rounded-lg p-1 transition-colors hover:bg-[#171d23]"
                className={cn(
                  "rounded-lg p-1 transition-colors hover:bg-[#171d23]",
                  autoRun && "bg-[#171d23]"
                )}
                onClick={() => toggleAutoRun()}
                title="Toggle auto-run (Alt+Enter)"
                type="button"
              >
                <RefreshCwIcon size={16} />
              </button>
              <button
                className="rounded-lg p-1 transition-colors hover:bg-[#171d23]"
                onClick={() => runCode()}
                title="Run code (Ctrl+Enter)"
                type="button"
              >
                <PlayIcon size={16} />
              </button>
            </div>
          </div>
          <Editor
            beforeMount={handleEditorWillMount}
            height="100vh"
            language="javascript"
            loading={<img alt="Loading..." className="size-20" src="/js.svg" />}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            onValidate={handleEditorValidation}
            options={{ wordWrap: "on" }}
            theme="vs-dark"
          />
        </ResizablePanel>
        <ResizableHandle className="bg-[#171d23]" />
        <ResizablePanel className="flex h-screen flex-col">
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
                className="rounded-lg p-1 transition-colors hover:bg-[#171d23]"
                onClick={() => clearConsole()}
                title="Clear console (Ctrl+L)"
                type="button"
              >
                <BanIcon size={16} />
              </button>
            </div>
          </div>
          <div className="overflow-y-auto" ref={consoleRef}>
            <Console logs={logs} styles={consoleTheme} variant="dark" />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}

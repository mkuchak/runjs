import { Console } from "@/components/console";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { editorTheme } from "@/constants/editor-theme";
import { useWindowSize } from "@/hooks/use-window-size";
import { safeEval } from "@/lib/safe-eval";
import { cn } from "@/lib/utils";
import Editor, { type Monaco } from "@monaco-editor/react";
import { type Message } from "console-feed/lib/definitions/Component";
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
import { editor } from "monaco-editor";
import * as prettier from "prettier";
import * as babelParser from "prettier/parser-babel";
import * as babelPlugin from "prettier/plugins/babel";
import * as estreePlugin from "prettier/plugins/estree";
import { useCallback, useEffect, useRef, useState } from "react";

export function App() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const { width } = useWindowSize();
  const [logs, setLogs] = useState<Message[]>([]);
  const [options, setOptions] = useState({
    autoRun: false,
    minimap: false,
    timer: false,
    wordWrap: false,
  });

  const deleteCode = useCallback(() => {
    editorRef.current?.setValue("");
  }, [editorRef]);

  const clearConsole = useCallback(() => {
    setLogs([]);
  }, []);

  const toggleMiniMap = useCallback(() => {
    setOptions((currOptions) => {
      localStorage.setItem("minimap", String(!currOptions.minimap));
      return { ...currOptions, minimap: !currOptions.minimap };
    });
  }, []);

  const toggleWordWrap = useCallback(() => {
    setOptions((currOptions) => {
      localStorage.setItem("wordwrap", String(!currOptions.wordWrap));
      return { ...currOptions, wordWrap: !currOptions.wordWrap };
    });
  }, []);

  const formatCode = useCallback(() => {
    editorRef.current?.getAction("editor.action.formatDocument")?.run();
  }, [editorRef]);

  const toggleAutoRun = useCallback(() => {
    setOptions((currOptions) => {
      localStorage.setItem("autorun", String(!currOptions.autoRun));
      return { ...currOptions, autoRun: !currOptions.autoRun };
    });
  }, []);

  const runCode = useCallback(
    async (code?: string) => {
      clearConsole();
      const duration = await safeEval(
        code || editorRef.current?.getValue() || ""
      );
      if (options.timer) {
        console.debug(`Execution time was ${duration}ms`);
      }
    },
    [clearConsole, options]
  );

  const toggleTimer = useCallback(() => {
    setOptions((currOptions) => {
      localStorage.setItem("timer", String(!currOptions.timer));
      return { ...currOptions, timer: !currOptions.timer };
    });
  }, []);

  function handleEditorChange(
    value: string | undefined
    // event: editor.IModelContentChangedEvent
  ) {
    localStorage.setItem("code", value || "");
    if (options.autoRun) {
      clearConsole();
      runCode(value);
    }
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

  function handleEditorWillMount(/* monaco: Monaco */) {
    // console.log("beforeMount: the monaco instance:", monaco);
  }

  function handleEditorValidation(markers: editor.IMarker[]) {
    markers.forEach((marker) => console.error(marker.message));
  }

  useEffect(() => {
    setOptions({
      autoRun: localStorage.getItem("autorun") === "true",
      minimap: localStorage.getItem("minimap") === "true",
      timer: localStorage.getItem("timer") === "true",
      wordWrap: localStorage.getItem("wordwrap") === "true",
    });
  }, []);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      // add Alt+M (toggle minimap)
      if (e.altKey && e.key === "m") {
        e.preventDefault();
        toggleMiniMap();
      }
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
      // add Alt+E
      if (e.altKey && e.key === "e") {
        e.preventDefault();
        toggleTimer();
      }
      // remove Ctrl+S (save)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [
    deleteCode,
    clearConsole,
    runCode,
    toggleAutoRun,
    toggleTimer,
    toggleMiniMap,
  ]);

  return (
    <main className="h-screen w-screen bg-[#0e141a] text-white">
      <ResizablePanelGroup
        autoSaveId="panel"
        className="overflow-auto"
        direction={width > 640 ? "horizontal" : "vertical"}
      >
        <ResizablePanel className="flex h-screen flex-col" defaultSize={70}>
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
                className={cn(
                  "rounded-lg p-1 transition-colors hover:bg-[#171d23]",
                  options.minimap && "bg-[#232b33] hover:bg-[#232b33]"
                )}
                onClick={() => toggleMiniMap()}
                title={`${options.minimap ? "Disable" : "Enable"} minimap (Alt+M)`}
                type="button"
              >
                <MapIcon size={16} />
              </button>
              <button
                className={cn(
                  "rounded-lg p-1 transition-colors hover:bg-[#171d23]",
                  options.wordWrap && "bg-[#232b33] hover:bg-[#232b33]"
                )}
                onClick={() => toggleWordWrap()}
                title={`${options.wordWrap ? "Disable" : "Enable"} word wrap (Alt+W)`}
                type="button"
              >
                <WrapTextIcon size={16} />
              </button>
              <button
                className={cn(
                  "rounded-lg p-1 transition-colors hover:bg-[#171d23]",
                  options.autoRun && "bg-[#232b33] hover:bg-[#232b33]"
                )}
                onClick={() => toggleAutoRun()}
                title={`${options.autoRun ? "Disable" : "Enable"} auto-run (Alt+Enter)`}
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
            options={{
              minimap: { enabled: options.minimap },
              wordWrap: options.wordWrap ? "on" : "off",
            }}
            theme="vs-dark"
          />
        </ResizablePanel>
        <ResizableHandle className="bg-[#171d23]" />
        <ResizablePanel className="flex h-screen flex-col" defaultSize={30}>
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
                  "rounded-lg p-1 transition-colors hover:bg-[#171d23]",
                  options.timer && "bg-[#232b33] hover:bg-[#232b33]"
                )}
                onClick={() => toggleTimer()}
                title={`${options.timer ? "Disable" : "Enable"} execution time (Alt+E)`}
                type="button"
              >
                <BugIcon size={16} />
              </button>
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
          <Console logs={logs} setLogs={setLogs} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}

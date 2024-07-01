import { editorTheme } from "@/constants/editor-theme";
import { useCode } from "@/stores/use-code";
import { useConsole } from "@/stores/use-console";
import { useOptions } from "@/stores/use-options";
import { type Monaco, Editor as MonacoEditor } from "@monaco-editor/react";
import { type editor } from "monaco-editor";
import * as prettier from "prettier";
import * as babelParser from "prettier/parser-babel";
import * as babelPlugin from "prettier/plugins/babel";
import * as estreePlugin from "prettier/plugins/estree";
import { useRef } from "react";

export type EditorProps = {
  editorRef: React.MutableRefObject<editor.IStandaloneCodeEditor | null>;
};

export function Editor({ editorRef }: EditorProps) {
  const monacoRef = useRef<Monaco | null>(null);
  const options = useOptions();
  const { clearLogs } = useConsole();
  const { code, runCode, setCode } = useCode();

  function handleEditorChange(value: string | undefined) {
    setCode(value || "");
    if (options.autoRun) {
      clearLogs();
      runCode();
    }
  }

  function handleEditorValidation(markers: editor.IMarker[]) {
    if (options.autoRun) {
      markers.forEach((marker) => console.error(marker.message));
    }
  }

  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Restore editor state
    editor.setValue(code);
    editor.focus();
    editor.setPosition(options.cursor);
    editor.setScrollPosition(options.scroll);

    // Register custom theme
    monaco.editor.defineTheme("Sorcerer", editorTheme);
    monaco.editor.setTheme("Sorcerer");

    // Change default font size
    editor.updateOptions({
      fontFamily: "Rec Mono Casual, Fira Code, Inter, monospace",
      fontLigatures: true,
    });

    // Customize keybindings
    monaco.editor.addKeybindingRules([
      {
        command: "", // Remove Ctrl+L to clear logs
        keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL,
      },
      {
        command: "", // Remove Ctrl+Enter to run code
        keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      },
      {
        command: "", // Remove Alt+Enter to toggle auto-run
        keybinding: monaco.KeyMod.Alt | monaco.KeyCode.KeyL,
      },
      {
        command: "", // Remove Ctrl+Shift+R
        keybinding:
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyR,
      },
      {
        command: "", // Remove Alt+Shift+Down
        keybinding:
          monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.DownArrow,
      },
      {
        command: "", // Remove Alt+Shift+Up
        keybinding:
          monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.UpArrow,
      },
      {
        command: "", // Remove Alt+Down
        keybinding: monaco.KeyMod.Alt | monaco.KeyCode.DownArrow,
      },
      {
        command: "", // Remove Alt+Up
        keybinding: monaco.KeyMod.Alt | monaco.KeyCode.UpArrow,
      },
      {
        command: "editor.action.moveLinesUpAction", // Add Ctrl+Shift+Up to move line up
        keybinding:
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.UpArrow,
      },
      {
        command: "editor.action.moveLinesDownAction",
        keybinding:
          monaco.KeyMod.CtrlCmd |
          monaco.KeyMod.Shift |
          monaco.KeyCode.DownArrow,
      },
      {
        command: "editor.action.copyLinesDownAction", // Add Ctrl+D to duplicate current line
        keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD,
      },
      {
        command: "editor.action.deleteLines", // Add Ctrl+Shift+X to delete current line
        keybinding:
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyX,
      },
      {
        command: "cursorWordPartRight", // Add Alt+Right to move cursor between CamelCase words
        keybinding: monaco.KeyMod.Alt | monaco.KeyCode.RightArrow,
      },
      {
        command: "cursorWordPartLeft", // Add Alt+Left to move cursor between CamelCase words
        keybinding: monaco.KeyMod.Alt | monaco.KeyCode.LeftArrow,
      },
      {
        command: "cursorWordPartRightSelect", // Add Alt+Shift+Right to select between CamelCase words
        keybinding:
          monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.RightArrow,
      },
      {
        command: "cursorWordPartLeftSelect", // Add Alt+Shift+Left to select between CamelCase words
        keybinding:
          monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.LeftArrow,
      },
      {
        command: "editor.action.addSelectionToNextFindMatch", // Add Ctrl+Shift+D to select next occurrence
        keybinding:
          monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyD,
      },
    ]);

    // Register editor events
    editor.onDidChangeCursorPosition((e) =>
      options.setCursor({
        column: e.position.column,
        lineNumber: e.position.lineNumber,
      })
    );
    editor.onDidScrollChange((e) =>
      options.setScroll({
        scrollLeft: e.scrollLeft,
        scrollTop: e.scrollTop,
      })
    );

    // Register Prettier as custom formatter
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

  return (
    <MonacoEditor
      height="100vh"
      language="javascript"
      loading={<img alt="Loading..." className="size-20" src="/js.svg" />}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      onValidate={handleEditorValidation}
      options={{
        minimap: { enabled: options.minimap },
        renderWhitespace: "all",
        tabSize: 2,
        wordWrap: options.wordWrap ? "on" : "off",
      }}
      theme="vs-dark"
    />
  );
}

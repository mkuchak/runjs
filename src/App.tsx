import Editor, {
  DiffEditor,
  useMonaco,
  loader,
  Monaco,
} from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { themeData } from "./constants/sorcerer-theme";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export function App() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [terminal, setTerminal] = useState("");

  function handleEditorChange(value, event) {
    // here is the current value
    console.log("here is the current model value:", value);
    // alert(eval(value));
    // const result = eval(value);
    // alert(result);

    const originalConsoleLog = console.log;
    const logs = [];
    console.log = function (...messages) {
      logs.push(...messages);
      originalConsoleLog.apply(console, messages);
    };

    try {
      const result = eval(value);
      if (result !== undefined) {
        logs.push(result);
      }
      // outputElement.textContent = logs.join("\n");
      // alert(logs.join("\n"));
      // setTerminal(JSON.stringify(logs, null, 2));
      setTerminal(JSON.stringify(logs));
    } catch (error) {
      // errorElement.textContent = error;
      // alert(error);
      setTerminal(JSON.stringify(error, null, 2));
    } finally {
      // Restore original console.log
      console.log = originalConsoleLog;
    }
  }

  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    console.log("onMount: the editor instance:", editor);
    console.log("onMount: the monaco instance:", monaco);
    monaco.editor.defineTheme("Sorcerer", themeData);
    monaco.editor.setTheme("Sorcerer");
  }

  function handleEditorWillMount(monaco: Monaco) {
    console.log("beforeMount: the monaco instance:", monaco);
  }

  function handleEditorValidation(markers) {
    // model markers
    markers.forEach((marker) => console.log("onValidate:", marker.message));
  }

  return (
    <main className="bg-[#0e141a] text-white">
      <pre>{terminal}</pre>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>One</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>Two</ResizablePanel>
      </ResizablePanelGroup>

      {/* <Editor
        height="100vh"
        defaultLanguage="javascript"
        defaultValue="// some comment"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
        onValidate={handleEditorValidation}
        options={{
          minimap: { enabled: false },
        }}
        theme="vs-dark"
      /> */}
    </main>
  );
}

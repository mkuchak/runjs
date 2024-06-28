/**
 * Sorcerer Theme Colors:
 * - #0e141a #ff006a #aaed36 #f5af19 #44dfff #f88070
 * - #00000050 #5a6986aa #6e7d9a #65737e #cccccc #dddddd #eeffff #ffffff
 */

export const editorTheme = {
  base: "vs-dark" as const,
  colors: {
    "editor.background": "#0e141a",
    "editor.foreground": "#ffffff",
    "editorCursor.foreground": "#ff006a",
  },
  inherit: false,
  rules: [
    { fontStyle: "italic", foreground: "#5a6986aa", token: "comment" },
    { fontStyle: "bold", foreground: "#ff006a", token: "type" },
    { foreground: "#aaed36", token: "regexp" },
    { foreground: "#aaed36", token: "string" },
    { foreground: "#aaed36", token: "boolean" },
    { foreground: "#ff006a", token: "keyword" },
    { foreground: "#f5af19", token: "delimiter" },
    { foreground: "#ffffff", token: "number" },
    { foreground: "#ffffff", token: "operator" },
  ],
};

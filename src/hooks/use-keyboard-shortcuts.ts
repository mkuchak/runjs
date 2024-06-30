import { useEffect } from "react";

export type KeyboardShortcut = {
  action: (event: KeyboardEvent) => void;
  key: string;
  modifiers: {
    alt?: boolean;
    ctrl?: boolean;
    shift?: boolean;
  };
};

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          event.altKey === !!shortcut.modifiers.alt &&
          event.ctrlKey === !!shortcut.modifiers.ctrl &&
          event.shiftKey === !!shortcut.modifiers.shift
        ) {
          event.preventDefault();
          shortcut.action(event);
        }
      });
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [shortcuts]);
}

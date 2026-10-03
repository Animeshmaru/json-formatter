import { useEffect } from 'react';

interface ShortcutHandlers {
  onFormat: () => void;
  onNewTab: () => void;
  onCloseTab: () => void;
  onClear: () => void;
  onDuplicate: () => void;
  onOpenToolPicker: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.code === 'Space') {
        e.preventDefault();
        handlers.onOpenToolPicker();
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      if (!isMod) return;

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          handlers.onFormat();
          break;
        case 't':
          e.preventDefault();
          handlers.onNewTab();
          break;
        case 'w':
          e.preventDefault();
          handlers.onCloseTab();
          break;
        case 'k':
          e.preventDefault();
          handlers.onClear();
          break;
        case 'd':
          e.preventDefault();
          handlers.onDuplicate();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

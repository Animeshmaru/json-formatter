import { useRef, useCallback, lazy, Suspense } from 'react';
import type { OnMount, OnChange } from '@monaco-editor/react';
import { attachFoldStateTracking } from '@/utils/monacoFoldState';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: 'dark' | 'light';
  isValid: boolean;
  tabId: string;
  language?: string;
  onClear?: () => void;
  onEditorReady?: (actions: { openCommandPalette: () => void; foldAll: () => void; unfoldAll: () => void }) => void;
  onFoldStateChange?: (allFolded: boolean) => void;
}

export function JsonEditor({
  value,
  onChange,
  theme,
  isValid,
  tabId,
  language = 'json',
  onClear,
  onEditorReady,
  onFoldStateChange,
}: JsonEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const onClearRef = useRef(onClear);
  onClearRef.current = onClear;
  const onEditorReadyRef = useRef(onEditorReady);
  const onFoldStateChangeRef = useRef(onFoldStateChange);
  onFoldStateChangeRef.current = onFoldStateChange;

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    editor.focus();

    // Cmd/Ctrl+K — clear editor (override Monaco's chord prefix)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      onClearRef.current?.();
    });

    // Cmd/Ctrl+D — duplicate line down (override Monaco's "add selection to next find match")
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
      editor.trigger('keyboard', 'editor.action.copyLinesDownAction', null);
    });

    // Expose openCommandPalette / foldAll / unfoldAll to parent
    const openCommandPalette = () => {
      editor.focus();
      editor.trigger('', 'editor.action.quickCommand', null);
    };
    const foldAll = () => {
      editor.focus();
      editor.trigger('', 'editor.foldAll', null);
    };
    const unfoldAll = () => {
      editor.focus();
      editor.trigger('', 'editor.unfoldAll', null);
    };
    onEditorReadyRef.current?.({ openCommandPalette, foldAll, unfoldAll });

    // Self-disposes on editor.onDidDispose; no need to hold or clean up the return value.
    attachFoldStateTracking(editor, (allFolded) => onFoldStateChangeRef.current?.(allFolded));
  }, []);

  const handleChange: OnChange = useCallback(
    (value) => {
      onChange(value ?? '');
    },
    [onChange]
  );

  return (
    <div className="h-full w-full relative">
      <Suspense
        fallback={
          <div className="h-full w-full flex items-center justify-center bg-editor">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-muted-foreground text-sm">Loading editor...</span>
            </div>
          </div>
        }
      >
        <MonacoEditor
          height="100%"
          language={language}
          path={`tab-${tabId}.json`}
          value={value}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: true, scale: 1, renderCharacters: true },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            lineNumbers: 'on',
            folding: true,
            foldingStrategy: 'auto',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            cursorSmoothCaretAnimation: 'on',
            contextmenu: true,
            formatOnPaste: false,
            formatOnType: false,
            quickSuggestions: false,
            suggestOnTriggerCharacters: false,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            wordBasedSuggestions: 'allDocuments',
            bracketPairColorization: { enabled: true, independentColorPoolPerBracketType: true },
            fontLigatures: true,
            guides: {
              bracketPairs: true,
              indentation: true,
            },
          }}
        />
      </Suspense>
      {!isValid && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive animate-pulse-subtle" />
      )}
    </div>
  );
}

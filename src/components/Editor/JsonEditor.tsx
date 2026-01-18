import { useRef, useCallback, lazy, Suspense } from 'react';
import type { OnMount, OnChange } from '@monaco-editor/react';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: 'dark' | 'light';
  isValid: boolean;
}

export function JsonEditor({ value, onChange, theme, isValid }: JsonEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
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
          defaultLanguage="json"
          value={value}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
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
            contextmenu: true,
            formatOnPaste: false,
            formatOnType: false,
            quickSuggestions: false,
            suggestOnTriggerCharacters: false,
            acceptSuggestionOnEnter: 'off',
            tabCompletion: 'off',
            wordBasedSuggestions: 'off',
            bracketPairColorization: { enabled: true },
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

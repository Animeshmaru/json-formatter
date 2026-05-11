import { lazy, Suspense, useCallback, useRef, useState } from 'react';
import { JsonEditor } from './JsonEditor';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Columns2, AlignLeft, ChevronUp, ChevronDown } from 'lucide-react';
import type { editor as MonacoEditor } from 'monaco-editor';
import type { ImperativePanelHandle } from 'react-resizable-panels';

const MonacoDiffEditor = lazy(() =>
  import('@monaco-editor/react').then((mod) => ({ default: mod.DiffEditor }))
);

interface DiffModeProps {
  leftContent: string;
  rightContent: string;
  onLeftChange: (value: string) => void;
  onRightChange: (value: string) => void;
  theme: 'dark' | 'light';
  tabId: string;
  activeSide: 'left' | 'right';
  onFocusSide: (side: 'left' | 'right') => void;
  isUnified: boolean;
  onUnifiedChange: (value: boolean) => void;
}

export function DiffMode({
  leftContent,
  rightContent,
  onLeftChange,
  onRightChange,
  theme,
  tabId,
  activeSide,
  onFocusSide,
  isUnified,
  onUnifiedChange,
}: DiffModeProps) {
  const handleLeftChange = useCallback((value: string) => onLeftChange(value), [onLeftChange]);

  const handleRightChange = useCallback((value: string) => onRightChange(value), [onRightChange]);

  const diffEditorRef = useRef<MonacoEditor.IStandaloneDiffEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const [diffCount, setDiffCount] = useState<number>(0);
  const [currentDiffIndex, setCurrentDiffIndex] = useState<number>(-1);

  const handleDiffEditorMount = useCallback((editor: MonacoEditor.IStandaloneDiffEditor) => {
    diffEditorRef.current = editor;
    const updateCount = () => {
      const changes = editor.getLineChanges();
      setDiffCount(changes?.length ?? 0);
      setCurrentDiffIndex(-1);
      // Clear any existing decorations
      decorationsRef.current = editor
        .getModifiedEditor()
        .deltaDecorations(decorationsRef.current, []);
    };
    updateCount();
    editor.onDidUpdateDiff(updateCount);
  }, []);

  const navigateToDiff = useCallback((index: number) => {
    const editor = diffEditorRef.current;
    if (!editor) return;
    const changes = editor.getLineChanges();
    if (!changes || changes.length === 0) return;
    const change = changes[index];
    const startLine =
      change.modifiedStartLineNumber > 0
        ? change.modifiedStartLineNumber
        : change.originalStartLineNumber;
    const endLine = change.modifiedEndLineNumber > 0 ? change.modifiedEndLineNumber : startLine;
    const modifiedEditor = editor.getModifiedEditor();
    modifiedEditor.revealLinesInCenter(startLine, endLine, 0);
    modifiedEditor.setPosition({ lineNumber: startLine, column: 1 });
    // Apply orange highlight decoration over the full changed range
    decorationsRef.current = modifiedEditor.deltaDecorations(decorationsRef.current, [
      {
        range: {
          startLineNumber: startLine,
          startColumn: 1,
          endLineNumber: endLine,
          endColumn: Number.MAX_SAFE_INTEGER,
        },
        options: {
          isWholeLine: true,
          className: 'diff-nav-highlight',
          linesDecorationsClassName: 'diff-nav-highlight-gutter',
          overviewRuler: {
            color: '#f97316',
            position: 4,
          },
        },
      },
    ]);
    setCurrentDiffIndex(index);
  }, []);

  const goToPrev = useCallback(() => {
    const changes = diffEditorRef.current?.getLineChanges();
    if (!changes || changes.length === 0) return;
    const next = currentDiffIndex <= 0 ? changes.length - 1 : currentDiffIndex - 1;
    navigateToDiff(next);
  }, [currentDiffIndex, navigateToDiff]);

  const goToNext = useCallback(() => {
    const changes = diffEditorRef.current?.getLineChanges();
    if (!changes || changes.length === 0) return;
    const next = currentDiffIndex >= changes.length - 1 ? 0 : currentDiffIndex + 1;
    navigateToDiff(next);
  }, [currentDiffIndex, navigateToDiff]);

  const topPanelRef = useRef<ImperativePanelHandle>(null);
  const bottomPanelRef = useRef<ImperativePanelHandle>(null);
  const [isDiffExpanded, setIsDiffExpanded] = useState(false);

  const handleHandleDoubleClick = useCallback(() => {
    if (isDiffExpanded) {
      topPanelRef.current?.resize(40);
      bottomPanelRef.current?.resize(60);
      setIsDiffExpanded(false);
    } else {
      topPanelRef.current?.resize(0);
      bottomPanelRef.current?.resize(100);
      setIsDiffExpanded(true);
    }
  }, [isDiffExpanded]);

  return (
    <>
      <style>{`
        .diff-nav-highlight {
          background: rgba(249, 115, 22, 0.18) !important;
          border-left: 3px solid #f97316 !important;
        }
        .diff-nav-highlight-gutter {
          background: #f97316;
          width: 4px !important;
          left: 0;
        }
      `}</style>
      <ResizablePanelGroup direction="vertical" className="h-full w-full">
        {/* Top: Two side-by-side editors (default 40%) */}
        <ResizablePanel ref={topPanelRef} defaultSize={40} minSize={0}>
          <div className="flex h-full min-h-0">
            <div
              className={`flex-1 flex flex-col min-w-0 border-r border-border ${
                activeSide === 'left' ? 'ring-1 ring-primary/40' : ''
              }`}
              onFocus={() => onFocusSide('left')}
            >
              <div
                className={`px-3 py-1.5 text-xs font-medium bg-card border-b border-border ${
                  activeSide === 'left' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Left JSON
              </div>
              <div className="flex-1 min-h-0">
                <JsonEditor
                  value={leftContent}
                  onChange={handleLeftChange}
                  theme={theme}
                  isValid={true}
                  tabId={`${tabId}-diff-left`}
                />
              </div>
            </div>
            <div
              className={`flex-1 flex flex-col min-w-0 ${
                activeSide === 'right' ? 'ring-1 ring-primary/40' : ''
              }`}
              onFocus={() => onFocusSide('right')}
            >
              <div
                className={`px-3 py-1.5 text-xs font-medium bg-card border-b border-border ${
                  activeSide === 'right' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Right JSON
              </div>
              <div className="flex-1 min-h-0">
                <JsonEditor
                  value={rightContent}
                  onChange={handleRightChange}
                  theme={theme}
                  isValid={true}
                  tabId={`${tabId}-diff-right`}
                />
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle onDoubleClick={handleHandleDoubleClick} />

        {/* Bottom: Diff viewer (default 60%, draggable up) */}
        <ResizablePanel ref={bottomPanelRef} defaultSize={60} minSize={0}>
          <div className="flex flex-col h-full min-h-0">
            <div className="flex items-center justify-between px-3 py-1 bg-card border-b border-border">
              <span className="text-xs font-medium text-muted-foreground">Differences</span>
              <div className="flex items-center gap-2">
                {/* Status pill */}
                {diffCount > 0 ? (
                  <span className="text-xs tabular-nums bg-orange-500/15 text-orange-500 px-2 py-0.5 rounded-full font-medium">
                    {currentDiffIndex >= 0
                      ? `${currentDiffIndex + 1} / ${diffCount}`
                      : `${diffCount} diff${diffCount > 1 ? 's' : ''}`}
                  </span>
                ) : (
                  <span className="text-xs bg-green-500/15 text-green-500 px-2 py-0.5 rounded-full font-medium">
                    ✓ Perfectly matched
                  </span>
                )}
                {/* Prev / Next — only when diffs exist */}
                {diffCount > 0 && (
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={goToPrev}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      title="Previous diff"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                      Prev
                    </button>
                    <button
                      onClick={goToNext}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                      title="Next diff"
                    >
                      Next
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <div className="h-3 w-px bg-border" />
                {/* Split / Unified toggle */}
                <div className="flex items-center rounded-md border border-border bg-muted p-0.5 gap-0.5">
                  <button
                    onClick={() => onUnifiedChange(false)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      !isUnified
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Columns2 className="h-3 w-3" />
                    Split
                  </button>
                  <button
                    onClick={() => onUnifiedChange(true)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      isUnified
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <AlignLeft className="h-3 w-3" />
                    Unified
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <Suspense
                fallback={
                  <div className="h-full w-full flex items-center justify-center bg-editor">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-muted-foreground text-sm">Loading diff viewer...</span>
                    </div>
                  </div>
                }
              >
                <MonacoDiffEditor
                  height="100%"
                  language="json"
                  original={leftContent}
                  modified={rightContent}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  onMount={handleDiffEditorMount}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    renderSideBySide: !isUnified,
                    wordWrap: 'on',
                    padding: { top: 8, bottom: 8 },
                  }}
                />
              </Suspense>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}

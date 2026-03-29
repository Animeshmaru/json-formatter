import { lazy, Suspense, useCallback } from 'react';
import { JsonEditor } from './JsonEditor';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

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
}: DiffModeProps) {
  const handleLeftChange = useCallback((value: string) => onLeftChange(value), [onLeftChange]);

  const handleRightChange = useCallback((value: string) => onRightChange(value), [onRightChange]);

  return (
    <ResizablePanelGroup direction="vertical" className="h-full w-full">
      {/* Top: Two side-by-side editors (default 70%) */}
      <ResizablePanel defaultSize={70} minSize={20}>
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

      <ResizableHandle withHandle />

      {/* Bottom: Diff viewer (default 30%, draggable up) */}
      <ResizablePanel defaultSize={30} minSize={10}>
        <div className="flex flex-col h-full min-h-0">
          <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-card border-b border-border">
            Differences
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
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  renderSideBySide: true,
                  wordWrap: 'on',
                  padding: { top: 8, bottom: 8 },
                }}
              />
            </Suspense>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

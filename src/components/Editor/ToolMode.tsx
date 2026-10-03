import { lazy, Suspense, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { JsonEditor } from './JsonEditor';
import { ErrorDisplay } from './ErrorDisplay';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/utils/shareUrl';
import { getEncoderById } from '@/toolsData/encoders';
import { getConverterById } from '@/toolsData/converters';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

interface ToolModeProps {
  content: string;
  onContentChange: (value: string) => void;
  mode: 'encoder' | 'converter';
  toolId: string | null;
  language: string;
  theme: 'dark' | 'light';
  tabId: string;
}

export function ToolMode({ content, onContentChange, mode, toolId, language, theme, tabId }: ToolModeProps) {
  const [copied, setCopied] = useState(false);

  const tool = mode === 'encoder' ? getEncoderById(toolId ?? '') : getConverterById(toolId ?? '');
  const outputLanguage = mode === 'converter' ? (tool as { outputLanguage?: string })?.outputLanguage ?? 'text' : 'text';

  const result = useMemo(() => {
    if (!tool) return { ok: false as const, error: 'Unknown tool' };
    if (!content.trim()) return { ok: true as const, output: '' };
    try {
      return { ok: true as const, output: tool.transform(content) };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'Failed to transform input' };
    }
  }, [tool, content]);

  const handleCopy = async () => {
    if (!result.ok) return;
    await copyToClipboard(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      <ResizablePanel defaultSize={50} minSize={20}>
        <div className="flex flex-col h-full min-h-0">
          <div className="flex items-center h-8 px-3 text-xs font-medium bg-card border-b border-border text-muted-foreground">
            Source
          </div>
          <div className="flex-1 min-h-0">
            <JsonEditor
              value={content}
              onChange={onContentChange}
              theme={theme}
              isValid={result.ok}
              tabId={`${tabId}-tool-source`}
              language={language}
            />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} minSize={20}>
        <div className="flex flex-col h-full min-h-0">
          <div className="flex items-center justify-between h-8 px-3 bg-card border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">
              {tool?.label ?? 'Output'}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopy}
              disabled={!result.ok || !result.output}
              title="Copy output"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-primary" />
              )}
            </Button>
          </div>
          <div className="flex-1 min-h-0">
            {result.ok ? (
              <Suspense
                fallback={
                  <div className="h-full w-full flex items-center justify-center bg-editor">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                }
              >
                <MonacoEditor
                  height="100%"
                  language={outputLanguage}
                  value={result.output}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on',
                    padding: { top: 16, bottom: 16 },
                  }}
                />
              </Suspense>
            ) : (
              <ErrorDisplay error={result.error} />
            )}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

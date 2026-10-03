import { lazy, Suspense } from 'react';

const ReactMarkdown = lazy(() => import('react-markdown'));

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center h-8 px-3 text-xs font-medium bg-card border-b border-border text-muted-foreground">
        Preview
      </div>
      <div className="flex-1 min-h-0 overflow-auto bg-editor px-6 py-4">
        <Suspense
          fallback={
            <div className="h-full w-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <article className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        </Suspense>
      </div>
    </div>
  );
}

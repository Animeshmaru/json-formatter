import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border-t border-destructive/20 text-sm">
      <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
      <span className="text-destructive font-medium truncate">{error}</span>
    </div>
  );
}

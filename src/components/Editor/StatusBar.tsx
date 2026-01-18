import { CheckCircle2 } from 'lucide-react';

interface StatusBarProps {
  isValid: boolean;
  charCount: number;
  lineCount: number;
}

export function StatusBar({ isValid, charCount, lineCount }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-card border-t border-border text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        {isValid && charCount > 0 && (
          <>
            <CheckCircle2 className="h-3 w-3 text-success" />
            <span className="text-success">Valid JSON</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span>Lines: {lineCount}</span>
        <span>Characters: {charCount}</span>
      </div>
    </div>
  );
}

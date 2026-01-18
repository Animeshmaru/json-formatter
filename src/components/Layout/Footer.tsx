import { Keyboard } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const shortcuts = [
  { keys: ['⌘/Ctrl', 'S'], action: 'Format' },
  { keys: ['⌘/Ctrl', 'T'], action: 'New Tab' },
  { keys: ['⌘/Ctrl', 'W'], action: 'Close Tab' },
  { keys: ['⌘/Ctrl', 'K'], action: 'Clear' },
  { keys: ['⌘/Ctrl', 'D'], action: 'Duplicate' },
];

export function Footer() {
  return (
    <footer className="flex items-center justify-between px-4 py-2 bg-card border-t border-border text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>100% client-side • No data leaves your browser</span>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 h-6 text-xs">
            <Keyboard className="h-3 w-3" />
            Shortcuts
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" align="end" className="w-64">
          <div className="grid gap-1.5 py-1">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.action} className="flex items-center justify-between">
                <span className="text-muted-foreground">{shortcut.action}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, i) => (
                    <span key={i}>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                        {key}
                      </kbd>
                      {i < shortcut.keys.length - 1 && <span className="mx-0.5">+</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </footer>
  );
}

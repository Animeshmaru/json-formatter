import { Link } from 'react-router-dom';
import { FileStack, Lock, Info } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
          <FileStack className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-semibold text-foreground leading-none m-0">
            Multi JSON Formatter
          </h1>
          <span className="text-xs text-muted-foreground">Fast, private, offline</span>
        </div>
      </Link>
      <div className="flex items-center gap-4">
        <Link
          to="/about"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Info className="h-4 w-4 text-primary" />
          About
        </Link>
        <Link
          to="/privacy"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Lock className="h-4 w-4 text-primary" />
          Privacy
        </Link>
      </div>
    </header>
  );
}

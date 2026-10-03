import { Link } from 'react-router-dom';
import { FileStack, Lock, Info, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
          <FileStack className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-semibold text-foreground leading-none m-0">
            Multi JSON Workspace
          </h1>
          <span className="text-xs text-muted-foreground">Fast, private, offline</span>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <Link
          to="/about"
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="About"
        >
          <Info className="h-4 w-4 text-primary" />
        </Link>
        <Link
          to="/privacy"
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Privacy"
        >
          <Lock className="h-4 w-4 text-primary" />
        </Link>
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}

import {
  Copy,
  Download,
  Upload,
  Trash2,
  Share2,
  Minimize2,
  Maximize2,
  Check,
  Settings2,
  Moon,
  Sun,
  Wand2,
  GitCompareArrows,
  Command,
  FoldVertical,
  UnfoldVertical,
  ListTree,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { EditorPreferences } from '@/types';
import { toast } from 'sonner';

interface EditorToolbarProps {
  onFormat: () => void;
  onCopy: () => void;
  onClear: () => void;
  onDownload: () => void;
  onUpload: () => void;
  onShare: () => void;
  onMinify: () => void;
  isMinified: boolean;
  isValid: boolean;
  hasContent: boolean;
  preferences: EditorPreferences;
  onPreferencesChange: (updates: Partial<EditorPreferences>) => void;
  isDiffMode: boolean;
  onToggleDiffMode: () => void;
  onOpenCommandPalette?: () => void;
  onFoldAll?: () => void;
  isAllFolded?: boolean;
  isTreeView?: boolean;
  onToggleTreeView?: () => void;
}

export function EditorToolbar({
  onFormat,
  onCopy,
  onClear,
  onDownload,
  onUpload,
  onShare,
  onMinify,
  isMinified,
  isValid,
  hasContent,
  preferences,
  onPreferencesChange,
  isDiffMode,
  onToggleDiffMode,
  onOpenCommandPalette,
  onFoldAll,
  isAllFolded,
  isTreeView,
  onToggleTreeView,
}: EditorToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 px-3 py-1 bg-card border-b border-border">
      <Button
        variant="ghost"
        size="sm"
        onClick={onFormat}
        disabled={!hasContent}
        className="gap-1.5 text-xs font-medium"
      >
        <Wand2 className="h-4 w-4 text-primary" />
        Format
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onMinify}
        disabled={!hasContent || !isValid}
        className="gap-1.5 text-xs font-medium"
      >
        {isMinified ? (
          <>
            <Maximize2 className="h-4 w-4 text-primary" />
            Expand
          </>
        ) : (
          <>
            <Minimize2 className="h-4 w-4 text-primary" />
            Minify
          </>
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onFoldAll}
        disabled={!hasContent || !isValid || isDiffMode}
        className="gap-1.5 text-xs font-medium"
        title={isAllFolded ? 'Unfold all' : 'Collapse all'}
      >
        {isAllFolded ? (
          <>
            <UnfoldVertical className="h-4 w-4 text-primary" />
            Unfold All
          </>
        ) : (
          <>
            <FoldVertical className="h-4 w-4 text-primary" />
            Collapse All
          </>
        )}
      </Button>

      <div className="h-4 w-[2px] bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        disabled={!hasContent || !isValid}
        className="h-8 w-8"
        title="Copy"
      >
        {copied ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <Copy className="h-4 w-4 text-primary" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onUpload}
        className="h-8 w-8"
        title="Upload"
      >
        <Upload className="h-4 w-4 text-primary" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onDownload}
        disabled={!hasContent || !isValid}
        className="h-8 w-8"
        title="Download"
      >
        <Download className="h-4 w-4 text-primary" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onShare}
        disabled={!hasContent || !isValid}
        className="h-8 w-8"
        title="Share"
      >
        <Share2 className="h-4 w-4 text-primary" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={onClear}
        disabled={!hasContent}
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        title="Clear"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="h-4 w-[2px] bg-border mx-1" />

      <Button
        variant={isDiffMode ? 'secondary' : 'ghost'}
        size="sm"
        onClick={onToggleDiffMode}
        className={`gap-1.5 text-xs font-medium ${
          isDiffMode ? 'bg-primary/15 text-primary border border-primary/30' : ''
        }`}
      >
        <GitCompareArrows className="h-4 w-4 text-primary" />
        Diff
      </Button>

      <Button
        variant={isTreeView ? 'secondary' : 'ghost'}
        size="sm"
        onClick={onToggleTreeView}
        disabled={!hasContent || isDiffMode}
        className={`gap-1.5 text-xs font-medium ${
          isTreeView ? 'bg-primary/15 text-primary border border-primary/30' : ''
        }`}
      >
        <ListTree className="h-4 w-4 text-primary" />
        Tree View
      </Button>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenCommandPalette}
        className="h-8 w-8"
        title="Command Palette (F1)"
      >
        <Command className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          onPreferencesChange({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })
        }
        className="h-8 w-8"
      >
        {preferences.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 bg-card border border-border shadow-md">
          <DropdownMenuLabel className="text-muted-foreground text-xs font-semibold">
            Indent Size
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={`${preferences.indentSize}`}
            onValueChange={(v) => onPreferencesChange({ indentSize: parseInt(v) as 2 | 4 })}
          >
            <DropdownMenuRadioItem
              value="2"
              className="focus:text-primary focus:bg-secondary focus:bg-secondary"
            >
              2 spaces
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="4"
              className="focus:text-primary focus:bg-secondary focus:bg-secondary"
            >
              4 spaces
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Indent Type</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={preferences.indentType}
            onValueChange={(v) => onPreferencesChange({ indentType: v as 'spaces' | 'tabs' })}
          >
            <DropdownMenuRadioItem
              value="spaces"
              className="focus:text-primary focus:bg-secondary focus:bg-secondary"
            >
              Spaces
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="tabs"
              className="focus:text-primary focus:bg-secondary focus:bg-secondary"
            >
              Tabs
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onPreferencesChange({ autoFormat: !preferences.autoFormat })}
            className="focus:text-primary focus:bg-secondary focus:bg-secondary"
          >
            {preferences.autoFormat ? '✓ ' : ''}Auto-format on paste
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

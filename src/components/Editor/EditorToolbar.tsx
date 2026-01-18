import {
  Copy,
  Download,
  Upload,
  Trash2,
  Share2,
  Minimize2,
  Maximize2,
  FileJson,
  Check,
  Settings2,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
}: EditorToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-card border-b border-border">
      <Button
        variant="ghost"
        size="sm"
        onClick={onFormat}
        disabled={!hasContent}
        className="gap-1.5 text-xs font-medium"
      >
        <FileJson className="h-4 w-4" />
        Format
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        disabled={!hasContent || !isValid}
        className="gap-1.5 text-xs font-medium"
      >
        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        Copy
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
            <Maximize2 className="h-4 w-4" />
            Expand
          </>
        ) : (
          <>
            <Minimize2 className="h-4 w-4" />
            Minify
          </>
        )}
      </Button>

      <div className="h-4 w-px bg-border mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onUpload}
        className="gap-1.5 text-xs font-medium"
      >
        <Upload className="h-4 w-4" />
        Upload
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onDownload}
        disabled={!hasContent || !isValid}
        className="gap-1.5 text-xs font-medium"
      >
        <Download className="h-4 w-4" />
        Download
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onShare}
        disabled={!hasContent || !isValid}
        className="gap-1.5 text-xs font-medium"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        disabled={!hasContent}
        className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
        Clear
      </Button>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPreferencesChange({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })}
        className="h-8 w-8"
      >
        {preferences.theme === 'dark' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Indent Size</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={`${preferences.indentSize}`}
            onValueChange={(v) => onPreferencesChange({ indentSize: parseInt(v) as 2 | 4 })}
          >
            <DropdownMenuRadioItem value="2">2 spaces</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="4">4 spaces</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Indent Type</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={preferences.indentType}
            onValueChange={(v) => onPreferencesChange({ indentType: v as 'spaces' | 'tabs' })}
          >
            <DropdownMenuRadioItem value="spaces">Spaces</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="tabs">Tabs</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onPreferencesChange({ autoFormat: !preferences.autoFormat })}>
            {preferences.autoFormat ? '✓ ' : ''}Auto-format on paste
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

import {
  Copy,
  Download,
  Upload,
  Trash2,
  Share2,
  Minimize2,
  Maximize2,
  Check,
  Wand2,
  GitCompareArrows,
  FoldVertical,
  UnfoldVertical,
  ListTree,
  Braces,
  Wrench,
  ChevronDown,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { EditorLanguage, SecondaryMode } from '@/types';
import { LANGUAGES, getLanguageById } from '@/languageSupport';
import { getEncoderById } from '@/toolsData/encoders';
import { getConverterById } from '@/toolsData/converters';
import { toast } from 'sonner';

const TOOLS_HINT_SEEN_KEY = 'json-formatter:tools-hint-seen';

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
  language: EditorLanguage;
  onSetLanguage: (language: EditorLanguage) => void;
  secondaryMode: SecondaryMode;
  onSetSecondaryMode: (mode: SecondaryMode) => void;
  encoderId: string | null;
  converterId: string | null;
  onOpenToolPicker: () => void;
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
  language,
  onSetLanguage,
  secondaryMode,
  onSetSecondaryMode,
  encoderId,
  converterId,
  onOpenToolPicker,
  onFoldAll,
  isAllFolded,
  isTreeView,
  onToggleTreeView,
}: EditorToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [showToolsHint, setShowToolsHint] = useState(() => {
    try {
      return localStorage.getItem(TOOLS_HINT_SEEN_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const dismissToolsHint = () => {
    setShowToolsHint(false);
    try {
      localStorage.setItem(TOOLS_HINT_SEEN_KEY, '1');
    } catch {
      // localStorage unavailable (e.g. private browsing) — hint just won't persist as dismissed
    }
  };

  const handleOpenToolPicker = () => {
    if (showToolsHint) dismissToolsHint();
    onOpenToolPicker();
  };

  // Also dismiss if the user discovers the picker via the Alt+Space shortcut
  // (which bypasses the click handler above) and actually applies a tool.
  useEffect(() => {
    if ((secondaryMode === 'encoder' || secondaryMode === 'converter') && showToolsHint) {
      dismissToolsHint();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondaryMode]);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const isDiffMode = secondaryMode === 'diff';
  const isEncoderMode = secondaryMode === 'encoder';
  const isConverterMode = secondaryMode === 'converter';
  const activeEncoder = encoderId ? getEncoderById(encoderId) : undefined;
  const activeConverter = converterId ? getConverterById(converterId) : undefined;

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
        disabled={!hasContent || !isValid || secondaryMode !== 'none'}
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

      <Button variant="ghost" size="icon" onClick={onUpload} className="h-8 w-8" title="Upload">
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
        onClick={() => onSetSecondaryMode(isDiffMode ? 'none' : 'diff')}
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
        disabled={!hasContent || secondaryMode !== 'none'}
        className={`gap-1.5 text-xs font-medium ${
          isTreeView ? 'bg-primary/15 text-primary border border-primary/30' : ''
        }`}
      >
        <ListTree className="h-4 w-4 text-primary" />
        Tree View
      </Button>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-medium">
            <Braces className="h-4 w-4 text-primary" />
            Formatter: {getLanguageById(language).label}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-card border border-border shadow-md">
          <DropdownMenuLabel className="text-muted-foreground text-xs font-semibold">
            Formatter
          </DropdownMenuLabel>
          {LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.id}
              onClick={() => onSetLanguage(lang.id)}
              className="focus:text-primary focus:bg-secondary"
            >
              {language === lang.id ? '✓ ' : ''}
              {lang.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="relative">
        <Button
          variant={isEncoderMode || isConverterMode ? 'secondary' : 'ghost'}
          size="sm"
          onClick={handleOpenToolPicker}
          className={`gap-1.5 text-xs font-medium ${
            isEncoderMode || isConverterMode ? 'bg-primary/15 text-primary border border-primary/30' : ''
          }`}
          title="Tools (Alt+Space)"
        >
          <Wrench className="h-4 w-4 text-primary" />
          {isEncoderMode && activeEncoder
            ? `Tools: ${activeEncoder.label}`
            : isConverterMode && activeConverter
              ? `Tools: ${activeConverter.label}`
              : 'Tools'}
        </Button>
        {showToolsHint && (
          <span className="pointer-events-none absolute -top-1.5 -right-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold leading-none text-primary-foreground shadow-sm animate-pulse-subtle">
            New
          </span>
        )}
      </div>

      {(isEncoderMode || isConverterMode) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSetSecondaryMode('none')}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Turn off tool"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

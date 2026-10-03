import { useEffect, useState, useCallback, useRef } from 'react';
import { Undo2 } from 'lucide-react';
import { Header } from '@/components/Layout/Header';

import { TabBar } from '@/components/Tabs/TabBar';
import { JsonEditor } from '@/components/Editor/JsonEditor';
import { JsonTreeView, JsonTreeViewHandle } from '@/components/Editor/JsonTreeView';
import { EditorToolbar } from '@/components/Editor/EditorToolbar';
import { ErrorDisplay } from '@/components/Editor/ErrorDisplay';
import { StatusBar } from '@/components/Editor/StatusBar';
import { DiffMode } from '@/components/Editor/DiffMode';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ToolMode } from '@/components/Editor/ToolMode';
import { ToolPicker } from '@/components/Editor/ToolPicker';
import { MarkdownPreview } from '@/components/Editor/MarkdownPreview';
import { useTabs } from '@/hooks/useTabs';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { validateAndFormatJson, minifyJson } from '@/utils/jsonFormatter';
import { getLanguageById } from '@/languageSupport';
import { downloadJson, uploadJsonFile } from '@/utils/fileHandler';
import {
  createShareableUrl,
  getJsonFromUrl,
  copyToClipboard,
  clearUrlParams,
} from '@/utils/shareUrl';
import { toast } from 'sonner';
import type { EditorLanguage, SecondaryMode } from '@/types';

const Index = () => {
  const {
    tabs,
    activeTab,
    activeTabId,
    preferences,
    addTab,
    closeTab,
    restoreTab,
    setActiveTab,
    renameTab,
    updateTabContent,
    formatActiveTab,
    duplicateTab,
    clearActiveTab,
    updatePreferences,
    reorderTabs,
    setSecondaryMode,
    applySecondaryTool,
    setTabLanguage,
    updateDiffContent,
    swapDiffSides,
  } = useTabs();

  const commandPaletteRef = useRef<(() => void) | null>(null);
  const foldAllRef = useRef<(() => void) | null>(null);
  const unfoldAllRef = useRef<(() => void) | null>(null);
  const treeViewRef = useRef<JsonTreeViewHandle>(null);
  const [isAllFolded, setIsAllFolded] = useState(false);
  const [isMinified, setIsMinified] = useState(false);
  const [showTreeView, setShowTreeView] = useState(false);
  const [isToolPickerOpen, setIsToolPickerOpen] = useState(false);
  const [activeDiffSide, setActiveDiffSide] = useState<'left' | 'right'>('left');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadDone = useRef(false);

  // Load JSON from URL on initial load
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const jsonFromUrl = getJsonFromUrl();
    if (jsonFromUrl) {
      const result = validateAndFormatJson(jsonFromUrl);
      if (result.isValid) {
        addTab('Shared JSON', jsonFromUrl);
        clearUrlParams();
        toast.success('JSON loaded from shared link');
      } else {
        toast.error('Invalid JSON in shared link');
      }
    }
  }, [addTab]);

  const handleEditorChange = useCallback(
    (value: string) => {
      updateTabContent(activeTabId, value, false);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        updateTabContent(activeTabId, value, true);
      }, 300);
    },
    [activeTabId, updateTabContent]
  );

  const handleFormat = useCallback(() => {
    if (activeTab.secondaryMode === 'diff') {
      const content = activeDiffSide === 'left' ? activeTab.diffLeft : activeTab.diffRight;
      if (!content.trim()) return;
      const result = validateAndFormatJson(content);
      if (result.formattedJson) {
        updateDiffContent(activeTabId, activeDiffSide, result.formattedJson);
      }
      toast.success(`${activeDiffSide === 'left' ? 'Left' : 'Right'} JSON formatted`);
    } else {
      formatActiveTab();
      setIsMinified(false);
      toast.success(`${getLanguageById(activeTab.language).label} formatted`);
    }
  }, [
    formatActiveTab,
    activeTab.secondaryMode,
    activeTab.language,
    activeDiffSide,
    activeTab.diffLeft,
    activeTab.diffRight,
    updateDiffContent,
    activeTabId,
  ]);

  const handleCopy = useCallback(() => {
    if (activeTab.secondaryMode === 'diff') {
      const content = activeDiffSide === 'left' ? activeTab.diffLeft : activeTab.diffRight;
      copyToClipboard(content);
    } else {
      copyToClipboard(activeTab.content);
    }
  }, [
    activeTab.content,
    activeTab.secondaryMode,
    activeDiffSide,
    activeTab.diffLeft,
    activeTab.diffRight,
  ]);

  const handleDownload = useCallback(() => {
    if (activeTab.secondaryMode === 'diff') {
      const content = activeDiffSide === 'left' ? activeTab.diffLeft : activeTab.diffRight;
      downloadJson(content, `${activeTab.name}-${activeDiffSide}`);
    } else {
      downloadJson(activeTab.content, activeTab.name);
    }
    toast.success('Downloaded');
  }, [
    activeTab.content,
    activeTab.name,
    activeTab.secondaryMode,
    activeDiffSide,
    activeTab.diffLeft,
    activeTab.diffRight,
  ]);

  const handleUpload = useCallback(async () => {
    try {
      const { content, filename } = await uploadJsonFile();
      if (activeTab.secondaryMode === 'diff') {
        const result = validateAndFormatJson(content);
        updateDiffContent(activeTabId, activeDiffSide, result.formattedJson ?? content);
        toast.success(`File uploaded to ${activeDiffSide} editor`);
      } else {
        addTab(filename, content);
        toast.success('File uploaded');
      }
    } catch (e) {
      toast.error('Failed to upload file');
    }
  }, [addTab, activeTab.secondaryMode, activeDiffSide, updateDiffContent, activeTabId]);

  const handleShare = useCallback(() => {
    if (activeTab.secondaryMode === 'diff') {
      const content = activeDiffSide === 'left' ? activeTab.diffLeft : activeTab.diffRight;
      const url = createShareableUrl(content);
      copyToClipboard(url);
    } else {
      const url = createShareableUrl(activeTab.content);
      copyToClipboard(url);
    }
    toast.success('Shareable link copied to clipboard');
  }, [
    activeTab.content,
    activeTab.secondaryMode,
    activeDiffSide,
    activeTab.diffLeft,
    activeTab.diffRight,
  ]);

  const handleMinify = useCallback(() => {
    if (activeTab.secondaryMode === 'diff') {
      const content = activeDiffSide === 'left' ? activeTab.diffLeft : activeTab.diffRight;
      if (isMinified) {
        const result = validateAndFormatJson(content);
        if (result.formattedJson) {
          updateDiffContent(activeTabId, activeDiffSide, result.formattedJson);
        }
        setIsMinified(false);
      } else {
        const minified = minifyJson(content);
        updateDiffContent(activeTabId, activeDiffSide, minified);
        setIsMinified(true);
      }
    } else {
      if (isMinified) {
        formatActiveTab();
        setIsMinified(false);
      } else {
        const minified = minifyJson(activeTab.content);
        updateTabContent(activeTabId, minified, true);
        setIsMinified(true);
      }
    }
  }, [
    isMinified,
    formatActiveTab,
    activeTab.content,
    updateTabContent,
    activeTabId,
    activeTab.secondaryMode,
    activeDiffSide,
    activeTab.diffLeft,
    activeTab.diffRight,
    updateDiffContent,
  ]);

  const handleClear = useCallback(() => {
    if (activeTab.secondaryMode === 'diff') {
      const prev = activeDiffSide === 'left' ? activeTab.diffLeft : activeTab.diffRight;
      updateDiffContent(activeTabId, activeDiffSide, '');
      const side = activeDiffSide === 'left' ? 'Left' : 'Right';
      toast.success(`${side} editor cleared`, {
        action: {
          label: (
            <span className="flex items-center gap-1.5">
              <Undo2 className="h-3 w-3" />
              Undo
            </span>
          ),
          onClick: () => updateDiffContent(activeTabId, activeDiffSide, prev ?? ''),
        },
      });
    } else {
      const prevContent = activeTab.content;
      const prevMinified = isMinified;
      clearActiveTab();
      setIsMinified(false);
      toast.success('Editor cleared', {
        action: {
          label: (
            <span className="flex items-center gap-1.5">
              <Undo2 className="h-3 w-3" />
              Undo
            </span>
          ),
          onClick: () => {
            updateTabContent(activeTabId, prevContent);
            setIsMinified(prevMinified);
          },
        },
      });
    }
  }, [
    clearActiveTab,
    updateTabContent,
    activeTab,
    activeDiffSide,
    updateDiffContent,
    activeTabId,
    isMinified,
  ]);

  const handleCloseTab = useCallback(
    (tabId: string) => {
      const tabIndex = tabs.findIndex((t) => t.id === tabId);
      const tab = tabs[tabIndex];
      const isLastTab = tabs.length === 1;
      closeTab(tabId);
      toast(`Tab ${tab.name} closed`, {
        action: {
          label: (
            <span className="flex items-center gap-1.5">
              <Undo2 className="h-3 w-3" />
              Undo
            </span>
          ),
          onClick: () => {
            if (isLastTab) {
              // Tab was cleared, not removed — just restore the content
              updateTabContent(tabId, tab.content, false);
            } else {
              restoreTab(tab, tabIndex);
            }
          },
        },
      });
    },
    [tabs, closeTab, restoreTab, updateTabContent]
  );

  const handleSetSecondaryMode = useCallback(
    (mode: SecondaryMode) => setSecondaryMode(activeTabId, mode),
    [setSecondaryMode, activeTabId]
  );

  const handleSetLanguage = useCallback(
    (language: EditorLanguage) => setTabLanguage(activeTabId, language),
    [setTabLanguage, activeTabId]
  );

  const handleApplyEncoder = useCallback(
    (id: string) => applySecondaryTool(activeTabId, 'encoder', id),
    [applySecondaryTool, activeTabId]
  );

  const handleApplyConverter = useCallback(
    (id: string) => applySecondaryTool(activeTabId, 'converter', id),
    [applySecondaryTool, activeTabId]
  );

  const handleSwapDiffSides = useCallback(() => {
    swapDiffSides(activeTabId);
  }, [swapDiffSides, activeTabId]);

  const handleToggleFoldAll = useCallback(() => {
    if (isAllFolded) {
      unfoldAllRef.current?.();
      treeViewRef.current?.expandAll();
    } else {
      foldAllRef.current?.();
      treeViewRef.current?.collapseAll();
    }
  }, [isAllFolded]);

  // Avoid showing a stale "Unfold All" state from the previous tab while the
  // new tab's fold state is still being computed asynchronously.
  useEffect(() => {
    setIsAllFolded(false);
  }, [activeTabId]);

  const handleDiffLeftChange = useCallback(
    (value: string) => updateDiffContent(activeTabId, 'left', value),
    [updateDiffContent, activeTabId]
  );

  const handleDiffRightChange = useCallback(
    (value: string) => updateDiffContent(activeTabId, 'right', value),
    [updateDiffContent, activeTabId]
  );

  useKeyboardShortcuts({
    onFormat: handleFormat,
    onNewTab: () => addTab(),
    onCloseTab: () => handleCloseTab(activeTabId),
    onClear: handleClear,
    onDuplicate: () => duplicateTab(activeTabId),
    onOpenToolPicker: () => setIsToolPickerOpen(true),
  });

  const lineCount = activeTab.content.split('\n').length;
  const charCount = activeTab.content.length;

  // Compute toolbar props based on mode
  const toolbarContent = activeTab.secondaryMode === 'diff'
    ? activeDiffSide === 'left'
      ? activeTab.diffLeft
      : activeTab.diffRight
    : activeTab.content;
  const toolbarHasContent = toolbarContent.length > 0;
  const toolbarIsValid = (() => {
    if (activeTab.secondaryMode !== 'diff') return activeTab.isValid;
    if (!toolbarContent.trim()) return true;
    try {
      JSON.parse(toolbarContent);
      return true;
    } catch {
      return false;
    }
  })();

  const jsonEditorElement = (
    <JsonEditor
      value={activeTab.content}
      onChange={handleEditorChange}
      theme={preferences.theme}
      isValid={activeTab.isValid}
      tabId={activeTabId}
      language={getLanguageById(activeTab.language).monacoLanguageId}
      onClear={handleClear}
      onEditorReady={({ openCommandPalette, foldAll, unfoldAll }) => {
        commandPaletteRef.current = openCommandPalette;
        foldAllRef.current = foldAll;
        unfoldAllRef.current = unfoldAll;
      }}
      onFoldStateChange={setIsAllFolded}
    />
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <Header
        theme={preferences.theme}
        onToggleTheme={() =>
          updatePreferences({ theme: preferences.theme === 'dark' ? 'light' : 'dark' })
        }
      />
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTab}
        onCloseTab={handleCloseTab}
        onRenameTab={renameTab}
        onAddTab={() => addTab()}
        onReorderTabs={reorderTabs}
        onOpenCommandPalette={() => commandPaletteRef.current?.()}
      />
      <EditorToolbar
        onFormat={handleFormat}
        onCopy={handleCopy}
        onClear={handleClear}
        onDownload={handleDownload}
        onUpload={handleUpload}
        onShare={handleShare}
        onMinify={handleMinify}
        isMinified={isMinified}
        isValid={toolbarIsValid}
        hasContent={toolbarHasContent}
        language={activeTab.language}
        onSetLanguage={handleSetLanguage}
        secondaryMode={activeTab.secondaryMode}
        onSetSecondaryMode={handleSetSecondaryMode}
        encoderId={activeTab.encoderId}
        converterId={activeTab.converterId}
        onOpenToolPicker={() => setIsToolPickerOpen(true)}
        onFoldAll={handleToggleFoldAll}
        isAllFolded={isAllFolded}
        isTreeView={showTreeView}
        onToggleTreeView={() => setShowTreeView((v) => !v)}
      />
      <ToolPicker
        open={isToolPickerOpen}
        onOpenChange={setIsToolPickerOpen}
        onSelectEncoder={handleApplyEncoder}
        onSelectConverter={handleApplyConverter}
      />
      <main className="flex-1 min-h-0 w-full flex flex-col" aria-label="JSON editor">
        {/* SEO: descriptive text for crawlers, visually hidden */}
        <p className="sr-only">
          Free online JSON formatter and validator. Paste or type your JSON to instantly format,
          validate, minify, and share it. Multi-tab editing, real-time error detection, file upload
          and download. All processing happens in your browser — no data is ever sent to a server.
        </p>
        <div className="flex-1 min-h-0">
          {activeTab.secondaryMode === 'diff' ? (
            <DiffMode
              leftContent={activeTab.diffLeft}
              rightContent={activeTab.diffRight}
              onLeftChange={handleDiffLeftChange}
              onRightChange={handleDiffRightChange}
              theme={preferences.theme}
              tabId={activeTabId}
              activeSide={activeDiffSide}
              onFocusSide={setActiveDiffSide}
              isUnified={preferences.diffUnified}
              onUnifiedChange={(value) => updatePreferences({ diffUnified: value })}
              ignoreKeyOrder={preferences.diffIgnoreKeyOrder}
              onIgnoreKeyOrderChange={(value) => updatePreferences({ diffIgnoreKeyOrder: value })}
              ignoreArrayOrder={preferences.diffIgnoreArrayOrder}
              onIgnoreArrayOrderChange={(value) => updatePreferences({ diffIgnoreArrayOrder: value })}
              keysOnly={preferences.diffKeysOnly}
              onKeysOnlyChange={(value) => updatePreferences({ diffKeysOnly: value })}
              diffOnlyView={preferences.diffOnlyView}
              onDiffOnlyViewChange={(value) => updatePreferences({ diffOnlyView: value })}
              onSwapSides={handleSwapDiffSides}
              indentSize={2}
              language={activeTab.language}
            />
          ) : activeTab.secondaryMode === 'encoder' || activeTab.secondaryMode === 'converter' ? (
            <ToolMode
              content={activeTab.content}
              onContentChange={handleEditorChange}
              mode={activeTab.secondaryMode}
              toolId={activeTab.secondaryMode === 'encoder' ? activeTab.encoderId : activeTab.converterId}
              language={getLanguageById(activeTab.language).monacoLanguageId}
              theme={preferences.theme}
              tabId={activeTabId}
            />
          ) : activeTab.language === 'markdown' ? (
            <ResizablePanelGroup direction="horizontal" className="h-full w-full">
              <ResizablePanel defaultSize={50} minSize={20}>
                <div className="flex flex-col h-full min-h-0">
                  <div className="flex items-center h-8 px-3 text-xs font-medium bg-card border-b border-border text-muted-foreground">
                    Source
                  </div>
                  <div className="flex-1 min-h-0">{jsonEditorElement}</div>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={20}>
                <MarkdownPreview content={activeTab.content} />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : showTreeView ? (
            <ResizablePanelGroup direction="horizontal" className="h-full w-full">
              <ResizablePanel defaultSize={60} minSize={20}>
                {jsonEditorElement}
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40} minSize={20}>
                <JsonTreeView ref={treeViewRef} content={activeTab.content} />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            jsonEditorElement
          )}
        </div>
      </main>
      {activeTab.secondaryMode === 'none' && activeTab.error && (
        <ErrorDisplay error={activeTab.error} />
      )}
      <StatusBar
        isValid={activeTab.secondaryMode === 'none' && activeTab.isValid}
        charCount={activeTab.secondaryMode === 'none' ? charCount : 0}
        lineCount={activeTab.secondaryMode === 'none' ? lineCount : 0}
        languageLabel={getLanguageById(activeTab.language).label}
      />
    </div>
  );
};

export default Index;

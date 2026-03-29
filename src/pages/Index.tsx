import { useEffect, useState, useCallback, useRef } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { TabBar } from '@/components/Tabs/TabBar';
import { JsonEditor } from '@/components/Editor/JsonEditor';
import { EditorToolbar } from '@/components/Editor/EditorToolbar';
import { ErrorDisplay } from '@/components/Editor/ErrorDisplay';
import { StatusBar } from '@/components/Editor/StatusBar';
import { DiffMode } from '@/components/Editor/DiffMode';
import { useTabs } from '@/hooks/useTabs';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { validateAndFormatJson, minifyJson } from '@/utils/jsonFormatter';
import { downloadJson, uploadJsonFile } from '@/utils/fileHandler';
import {
  createShareableUrl,
  getJsonFromUrl,
  copyToClipboard,
  clearUrlParams,
} from '@/utils/shareUrl';
import { toast } from 'sonner';

const Index = () => {
  const {
    tabs,
    activeTab,
    activeTabId,
    preferences,
    addTab,
    closeTab,
    setActiveTab,
    renameTab,
    updateTabContent,
    formatActiveTab,
    duplicateTab,
    clearActiveTab,
    updatePreferences,
    toggleDiffMode,
    updateDiffContent,
  } = useTabs();

  const [isMinified, setIsMinified] = useState(false);
  const [activeDiffSide, setActiveDiffSide] = useState<'left' | 'right'>('left');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadDone = useRef(false);

  // Load JSON from URL on initial load
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const jsonFromUrl = getJsonFromUrl();
    if (jsonFromUrl) {
      const result = validateAndFormatJson(
        jsonFromUrl,
        preferences.indentSize,
        preferences.indentType
      );
      if (result.isValid && result.formattedJson) {
        addTab('Shared JSON', result.formattedJson);
        clearUrlParams();
        toast.success('JSON loaded from shared link');
      } else {
        toast.error('Invalid JSON in shared link');
      }
    }
  }, [addTab, preferences.indentSize, preferences.indentType]);

  const handleEditorChange = useCallback(
    (value: string) => {
      updateTabContent(activeTabId, value, false);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        if (preferences.autoFormat && value.trim()) {
          const result = validateAndFormatJson(
            value,
            preferences.indentSize,
            preferences.indentType
          );
          if (result.isValid && result.formattedJson) {
            updateTabContent(activeTabId, result.formattedJson, true);
            setIsMinified(false);
          } else {
            updateTabContent(activeTabId, value, true);
          }
        } else {
          updateTabContent(activeTabId, value, true);
        }
      }, 300);
    },
    [
      activeTabId,
      preferences.autoFormat,
      preferences.indentSize,
      preferences.indentType,
      updateTabContent,
    ]
  );

  const handleFormat = useCallback(() => {
    if (activeTab.isDiffMode) {
      const content = activeDiffSide === 'left' ? activeTab.diffLeft : activeTab.diffRight;
      if (!content.trim()) return;
      const result = validateAndFormatJson(content, preferences.indentSize, preferences.indentType);
      if (result.formattedJson) {
        updateDiffContent(activeTabId, activeDiffSide, result.formattedJson);
      }
      toast.success(`${activeDiffSide === 'left' ? 'Left' : 'Right'} JSON formatted`);
    } else {
      formatActiveTab();
      setIsMinified(false);
      toast.success('JSON formatted');
    }
  }, [
    formatActiveTab,
    activeTab.isDiffMode,
    activeDiffSide,
    activeTab.diffLeft,
    activeTab.diffRight,
    preferences.indentSize,
    preferences.indentType,
    updateDiffContent,
    activeTabId,
  ]);

  const handleCopy = useCallback(() => {
    if (activeTab.isDiffMode) {
      const content = activeDiffSide === 'left' ? activeTab.diffLeft : activeTab.diffRight;
      copyToClipboard(content);
    } else {
      copyToClipboard(activeTab.content);
    }
  }, [
    activeTab.content,
    activeTab.isDiffMode,
    activeDiffSide,
    activeTab.diffLeft,
    activeTab.diffRight,
  ]);

  const handleDownload = useCallback(() => {
    if (activeTab.isDiffMode) {
      const content = activeDiffSide === 'left' ? activeTab.diffLeft : activeTab.diffRight;
      downloadJson(content, `${activeTab.name}-${activeDiffSide}`);
    } else {
      downloadJson(activeTab.content, activeTab.name);
    }
    toast.success('JSON downloaded');
  }, [
    activeTab.content,
    activeTab.name,
    activeTab.isDiffMode,
    activeDiffSide,
    activeTab.diffLeft,
    activeTab.diffRight,
  ]);

  const handleUpload = useCallback(async () => {
    try {
      const { content, filename } = await uploadJsonFile();
      const result = validateAndFormatJson(content, preferences.indentSize, preferences.indentType);
      addTab(filename, result.formattedJson ?? content);
      toast.success('File uploaded');
    } catch (e) {
      toast.error('Failed to upload file');
    }
  }, [addTab, preferences.indentSize, preferences.indentType]);

  const handleShare = useCallback(() => {
    if (activeTab.isDiffMode) {
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
    activeTab.isDiffMode,
    activeDiffSide,
    activeTab.diffLeft,
    activeTab.diffRight,
  ]);

  const handleMinify = useCallback(() => {
    if (activeTab.isDiffMode) {
      const content = activeDiffSide === 'left' ? activeTab.diffLeft : activeTab.diffRight;
      if (isMinified) {
        const result = validateAndFormatJson(
          content,
          preferences.indentSize,
          preferences.indentType
        );
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
    activeTab.isDiffMode,
    activeDiffSide,
    activeTab.diffLeft,
    activeTab.diffRight,
    preferences.indentSize,
    preferences.indentType,
    updateDiffContent,
  ]);

  const handleClear = useCallback(() => {
    if (activeTab.isDiffMode) {
      updateDiffContent(activeTabId, activeDiffSide, '');
      toast.success(`${activeDiffSide === 'left' ? 'Left' : 'Right'} editor cleared`);
    } else {
      clearActiveTab();
      setIsMinified(false);
      toast.success('Editor cleared');
    }
  }, [clearActiveTab, activeTab.isDiffMode, activeDiffSide, updateDiffContent, activeTabId]);

  const handleToggleDiffMode = useCallback(() => {
    toggleDiffMode(activeTabId);
  }, [toggleDiffMode, activeTabId]);

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
    onCloseTab: () => closeTab(activeTabId),
    onClear: handleClear,
    onDuplicate: () => duplicateTab(activeTabId),
  });

  const lineCount = activeTab.content.split('\n').length;
  const charCount = activeTab.content.length;

  // Compute toolbar props based on mode
  const toolbarContent = activeTab.isDiffMode
    ? activeDiffSide === 'left'
      ? activeTab.diffLeft
      : activeTab.diffRight
    : activeTab.content;
  const toolbarHasContent = toolbarContent.length > 0;
  const toolbarIsValid = (() => {
    if (!activeTab.isDiffMode) return activeTab.isValid;
    if (!toolbarContent.trim()) return true;
    try {
      JSON.parse(toolbarContent);
      return true;
    } catch {
      return false;
    }
  })();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <Header />
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTab}
        onCloseTab={closeTab}
        onRenameTab={renameTab}
        onAddTab={() => addTab()}
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
        preferences={preferences}
        onPreferencesChange={updatePreferences}
        isDiffMode={activeTab.isDiffMode}
        onToggleDiffMode={handleToggleDiffMode}
      />
      <main className="flex-1 min-h-0 w-full flex flex-col" aria-label="JSON editor">
        {/* SEO: descriptive text for crawlers, visually hidden */}
        <p className="sr-only">
          Free online JSON formatter and validator. Paste or type your JSON to instantly format,
          validate, minify, and share it. Multi-tab editing, real-time error detection, file upload
          and download. All processing happens in your browser — no data is ever sent to a server.
        </p>
        <div className="flex-1 min-h-0">
          {activeTab.isDiffMode ? (
            <DiffMode
              leftContent={activeTab.diffLeft}
              rightContent={activeTab.diffRight}
              onLeftChange={handleDiffLeftChange}
              onRightChange={handleDiffRightChange}
              theme={preferences.theme}
              tabId={activeTabId}
              activeSide={activeDiffSide}
              onFocusSide={setActiveDiffSide}
            />
          ) : (
            <JsonEditor
              value={activeTab.content}
              onChange={handleEditorChange}
              theme={preferences.theme}
              isValid={activeTab.isValid}
              tabId={activeTabId}
            />
          )}
        </div>
      </main>
      {!activeTab.isDiffMode && activeTab.error && <ErrorDisplay error={activeTab.error} />}
      {!activeTab.isDiffMode && (
        <StatusBar isValid={activeTab.isValid} charCount={charCount} lineCount={lineCount} />
      )}
      <Footer />
    </div>
  );
};

export default Index;

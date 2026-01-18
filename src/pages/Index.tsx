import { useEffect, useState, useCallback, useRef } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { TabBar } from '@/components/Tabs/TabBar';
import { JsonEditor } from '@/components/Editor/JsonEditor';
import { EditorToolbar } from '@/components/Editor/EditorToolbar';
import { ErrorDisplay } from '@/components/Editor/ErrorDisplay';
import { StatusBar } from '@/components/Editor/StatusBar';
import { useTabs } from '@/hooks/useTabs';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { validateAndFormatJson, minifyJson } from '@/utils/jsonFormatter';
import { downloadJson, uploadJsonFile } from '@/utils/fileHandler';
import { createShareableUrl, getJsonFromUrl, copyToClipboard, clearUrlParams } from '@/utils/shareUrl';
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
  } = useTabs();

  const [isMinified, setIsMinified] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadDone = useRef(false);

  // Load JSON from URL on initial load
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const jsonFromUrl = getJsonFromUrl();
    if (jsonFromUrl) {
      const result = validateAndFormatJson(jsonFromUrl, preferences.indentSize, preferences.indentType);
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
          const result = validateAndFormatJson(value, preferences.indentSize, preferences.indentType);
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
    [activeTabId, preferences.autoFormat, preferences.indentSize, preferences.indentType, updateTabContent]
  );

  const handleFormat = useCallback(() => {
    formatActiveTab();
    setIsMinified(false);
    toast.success('JSON formatted');
  }, [formatActiveTab]);

  const handleCopy = useCallback(() => {
    copyToClipboard(activeTab.content);
  }, [activeTab.content]);

  const handleDownload = useCallback(() => {
    downloadJson(activeTab.content, activeTab.name);
    toast.success('JSON downloaded');
  }, [activeTab.content, activeTab.name]);

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
    const url = createShareableUrl(activeTab.content);
    copyToClipboard(url);
    toast.success('Shareable link copied to clipboard');
  }, [activeTab.content]);

  const handleMinify = useCallback(() => {
    if (isMinified) {
      formatActiveTab();
      setIsMinified(false);
    } else {
      const minified = minifyJson(activeTab.content);
      updateTabContent(activeTabId, minified, true);
      setIsMinified(true);
    }
  }, [isMinified, formatActiveTab, activeTab.content, updateTabContent, activeTabId]);

  const handleClear = useCallback(() => {
    clearActiveTab();
    setIsMinified(false);
    toast.success('Editor cleared');
  }, [clearActiveTab]);

  useKeyboardShortcuts({
    onFormat: handleFormat,
    onNewTab: () => addTab(),
    onCloseTab: () => closeTab(activeTabId),
    onClear: handleClear,
    onDuplicate: () => duplicateTab(activeTabId),
  });

  const lineCount = activeTab.content.split('\n').length;
  const charCount = activeTab.content.length;

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
        isValid={activeTab.isValid}
        hasContent={activeTab.content.length > 0}
        preferences={preferences}
        onPreferencesChange={updatePreferences}
      />
      <div className="flex-1 min-h-0 w-full">
        <JsonEditor
          value={activeTab.content}
          onChange={handleEditorChange}
          theme={preferences.theme}
          isValid={activeTab.isValid}
        />
      </div>
      {activeTab.error && <ErrorDisplay error={activeTab.error} />}
      <StatusBar isValid={activeTab.isValid} charCount={charCount} lineCount={lineCount} />
      <Footer />
    </div>
  );
};

export default Index;

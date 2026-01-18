import { useState, useCallback, useEffect } from 'react';
import { Tab, AppState, EditorPreferences } from '@/types';
import { getStoredState, saveState } from '@/utils/storage';
import { validateAndFormatJson } from '@/utils/jsonFormatter';

const createNewTab = (name: string = 'Untitled', content: string = ''): Tab => ({
  id: crypto.randomUUID(),
  name,
  content,
  isValid: true,
  error: null,
});

export function useTabs() {
  const [state, setState] = useState<AppState>(() => getStoredState());

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.preferences.theme === 'dark');
  }, [state.preferences.theme]);

  const addTab = useCallback((name?: string, content?: string) => {
    const newTab = createNewTab(name, content);
    if (content) {
      const result = validateAndFormatJson(content, state.preferences.indentSize, state.preferences.indentType);
      newTab.isValid = result.isValid;
      newTab.error = result.error;
      if (result.formattedJson !== null) {
        newTab.content = result.formattedJson;
      }
    }
    setState((prev) => ({
      ...prev,
      tabs: [...prev.tabs, newTab],
      activeTabId: newTab.id,
    }));
    return newTab.id;
  }, [state.preferences.indentSize, state.preferences.indentType]);

  const closeTab = useCallback((tabId: string) => {
    setState((prev) => {
      if (prev.tabs.length === 1) {
        // Don't allow closing the last tab, just clear it
        const clearedTab = { ...prev.tabs[0], content: '', isValid: true, error: null };
        return { ...prev, tabs: [clearedTab] };
      }

      const tabIndex = prev.tabs.findIndex((t) => t.id === tabId);
      const newTabs = prev.tabs.filter((t) => t.id !== tabId);
      
      let newActiveId = prev.activeTabId;
      if (prev.activeTabId === tabId) {
        // Select the previous tab, or the first if we closed the first tab
        const newIndex = Math.max(0, tabIndex - 1);
        newActiveId = newTabs[newIndex].id;
      }

      return {
        ...prev,
        tabs: newTabs,
        activeTabId: newActiveId,
      };
    });
  }, []);

  const setActiveTab = useCallback((tabId: string) => {
    setState((prev) => ({ ...prev, activeTabId: tabId }));
  }, []);

  const renameTab = useCallback((tabId: string, newName: string) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === tabId ? { ...t, name: newName || 'Untitled' } : t
      ),
    }));
  }, []);

  const updateTabContent = useCallback((tabId: string, content: string, validate: boolean = true) => {
    setState((prev) => {
      let isValid = true;
      let error: string | null = null;

      if (validate && content.trim()) {
        const result = validateAndFormatJson(content, prev.preferences.indentSize, prev.preferences.indentType);
        isValid = result.isValid;
        error = result.error;
      }

      return {
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === tabId ? { ...t, content, isValid, error } : t
        ),
      };
    });
  }, []);

  const formatActiveTab = useCallback(() => {
    setState((prev) => {
      const activeTab = prev.tabs.find((t) => t.id === prev.activeTabId);
      if (!activeTab || !activeTab.content.trim()) return prev;

      const result = validateAndFormatJson(
        activeTab.content,
        prev.preferences.indentSize,
        prev.preferences.indentType
      );

      return {
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === prev.activeTabId
            ? {
                ...t,
                content: result.formattedJson ?? t.content,
                isValid: result.isValid,
                error: result.error,
              }
            : t
        ),
      };
    });
  }, []);

  const duplicateTab = useCallback((tabId: string) => {
    setState((prev) => {
      const tab = prev.tabs.find((t) => t.id === tabId);
      if (!tab) return prev;

      const newTab = createNewTab(`${tab.name} (copy)`, tab.content);
      newTab.isValid = tab.isValid;
      newTab.error = tab.error;

      return {
        ...prev,
        tabs: [...prev.tabs, newTab],
        activeTabId: newTab.id,
      };
    });
  }, []);

  const clearActiveTab = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === prev.activeTabId ? { ...t, content: '', isValid: true, error: null } : t
      ),
    }));
  }, []);

  const updatePreferences = useCallback((updates: Partial<EditorPreferences>) => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates },
    }));
  }, []);

  const activeTab = state.tabs.find((t) => t.id === state.activeTabId) || state.tabs[0];

  return {
    tabs: state.tabs,
    activeTab,
    activeTabId: state.activeTabId,
    preferences: state.preferences,
    addTab,
    closeTab,
    setActiveTab,
    renameTab,
    updateTabContent,
    formatActiveTab,
    duplicateTab,
    clearActiveTab,
    updatePreferences,
  };
}

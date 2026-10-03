import { useState, useCallback, useEffect } from 'react';
import { Tab, AppState, EditorPreferences, EditorLanguage, SecondaryMode } from '@/types';
import { getStoredState, saveState } from '@/utils/storage';
import { getLanguageById } from '@/languageSupport';

const createNewTab = (name: string = 'Untitled', content: string = ''): Tab => ({
  id: crypto.randomUUID(),
  name,
  content,
  isValid: true,
  error: null,
  language: 'json',
  secondaryMode: 'none',
  diffLeft: '',
  diffRight: '',
  encoderId: null,
  converterId: null,
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
      const language = getLanguageById(newTab.language);
      const result = language.validate(content);
      newTab.isValid = result.isValid;
      newTab.error = result.error;
      if (result.isValid) {
        try {
          newTab.content = language.format(content);
        } catch {
          // Keep raw content if formatting unexpectedly fails despite passing validation.
        }
      }
    }
    setState((prev) => ({
      ...prev,
      tabs: [...prev.tabs, newTab],
      activeTabId: newTab.id,
    }));
    return newTab.id;
  }, []);

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
      tabs: prev.tabs.map((t) => (t.id === tabId ? { ...t, name: newName || 'Untitled' } : t)),
    }));
  }, []);

  const updateTabContent = useCallback(
    (tabId: string, content: string, validate: boolean = true) => {
      setState((prev) => {
        let isValid = true;
        let error: string | null = null;

        if (validate && content.trim()) {
          const tab = prev.tabs.find((t) => t.id === tabId);
          const result = getLanguageById(tab?.language ?? 'json').validate(content);
          isValid = result.isValid;
          error = result.error;
        }

        return {
          ...prev,
          tabs: prev.tabs.map((t) => (t.id === tabId ? { ...t, content, isValid, error } : t)),
        };
      });
    },
    []
  );

  const formatActiveTab = useCallback(() => {
    setState((prev) => {
      const activeTab = prev.tabs.find((t) => t.id === prev.activeTabId);
      if (!activeTab || !activeTab.content.trim()) return prev;

      const language = getLanguageById(activeTab.language);
      const validation = language.validate(activeTab.content);
      let formatted: string | null = null;
      if (validation.isValid) {
        try {
          formatted = language.format(activeTab.content);
        } catch {
          formatted = null;
        }
      }

      return {
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === prev.activeTabId
            ? {
                ...t,
                content: formatted ?? t.content,
                isValid: validation.isValid,
                error: validation.error,
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

  const setSecondaryMode = useCallback((tabId: string, mode: SecondaryMode) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === tabId
          ? {
              ...t,
              secondaryMode: mode,
              diffLeft: mode === 'diff' && !t.diffLeft ? t.content : t.diffLeft,
            }
          : t
      ),
    }));
  }, []);

  const applySecondaryTool = useCallback(
    (tabId: string, mode: 'encoder' | 'converter', toolId: string) => {
      setState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === tabId
            ? {
                ...t,
                secondaryMode: mode,
                encoderId: mode === 'encoder' ? toolId : t.encoderId,
                converterId: mode === 'converter' ? toolId : t.converterId,
              }
            : t
        ),
      }));
    },
    []
  );

  const setTabLanguage = useCallback((tabId: string, language: EditorLanguage) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => {
        if (t.id !== tabId) return t;
        const validation = getLanguageById(language).validate(t.content);
        return { ...t, language, isValid: validation.isValid, error: validation.error };
      }),
    }));
  }, []);

  const updateDiffContent = useCallback(
    (tabId: string, side: 'left' | 'right', content: string) => {
      setState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === tabId ? { ...t, [side === 'left' ? 'diffLeft' : 'diffRight']: content } : t
        ),
      }));
    },
    []
  );

  const swapDiffSides = useCallback((tabId: string) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === tabId ? { ...t, diffLeft: t.diffRight, diffRight: t.diffLeft } : t
      ),
    }));
  }, []);

  const updatePreferences = useCallback((updates: Partial<EditorPreferences>) => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates },
    }));
  }, []);

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const tabs = [...prev.tabs];
      const [moved] = tabs.splice(fromIndex, 1);
      tabs.splice(toIndex, 0, moved);
      return { ...prev, tabs };
    });
  }, []);

  const restoreTab = useCallback((tab: Tab, atIndex: number) => {
    setState((prev) => {
      const tabs = [...prev.tabs];
      const insertAt = Math.min(atIndex, tabs.length);
      tabs.splice(insertAt, 0, tab);
      return { ...prev, tabs, activeTabId: tab.id };
    });
  }, []);

  const activeTab = state.tabs.find((t) => t.id === state.activeTabId) || state.tabs[0];

  return {
    tabs: state.tabs,
    activeTab,
    activeTabId: state.activeTabId,
    preferences: state.preferences,
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
  };
}

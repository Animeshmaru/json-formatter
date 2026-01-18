import { AppState, Tab, EditorPreferences } from '@/types';

const STORAGE_KEY = 'json-formatter-state';

const defaultPreferences: EditorPreferences = {
  indentSize: 2,
  indentType: 'spaces',
  theme: 'dark',
  autoFormat: true,
};

const createDefaultTab = (): Tab => ({
  id: crypto.randomUUID(),
  name: 'Untitled',
  content: '',
  isValid: true,
  error: null,
});

export function getStoredState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as AppState;
      // Ensure at least one tab exists
      if (!state.tabs || state.tabs.length === 0) {
        const defaultTab = createDefaultTab();
        state.tabs = [defaultTab];
        state.activeTabId = defaultTab.id;
      }
      // Merge stored preferences with defaults for new fields
      state.preferences = { ...defaultPreferences, ...state.preferences };
      return state;
    }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
  }
  
  const defaultTab = createDefaultTab();
  return {
    tabs: [defaultTab],
    activeTabId: defaultTab.id,
    preferences: defaultPreferences,
  };
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear state from localStorage:', e);
  }
}

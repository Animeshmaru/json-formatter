export interface Tab {
  id: string;
  name: string;
  content: string;
  isValid: boolean;
  error: string | null;
  isDiffMode: boolean;
  diffLeft: string;
  diffRight: string;
}

export interface EditorPreferences {
  indentSize: 2 | 4;
  indentType: 'spaces' | 'tabs';
  theme: 'dark' | 'light';
  autoFormat: boolean;
}

export interface AppState {
  tabs: Tab[];
  activeTabId: string;
  preferences: EditorPreferences;
}

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
  formattedJson: string | null;
}

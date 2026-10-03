export type EditorLanguage = 'json' | 'yaml' | 'xml' | 'markdown';
export type SecondaryMode = 'none' | 'diff' | 'encoder' | 'converter';

export interface Tab {
  id: string;
  name: string;
  content: string;
  isValid: boolean;
  error: string | null;
  language: EditorLanguage;
  secondaryMode: SecondaryMode;
  diffLeft: string;
  diffRight: string;
  encoderId: string | null;
  converterId: string | null;
}

export interface EditorPreferences {
  theme: 'dark' | 'light';
  diffUnified: boolean;
  diffIgnoreKeyOrder: boolean;
  diffIgnoreArrayOrder: boolean;
  diffKeysOnly: boolean;
  diffOnlyView: boolean;
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

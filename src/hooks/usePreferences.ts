import { useState, useEffect } from 'react';
import { EditorPreferences } from '@/types';
import { savePreferences, loadPreferences } from '@/utils/storage';

const DEFAULT_PREFERENCES: EditorPreferences = {
  indentSize: 2,
  theme: 'dark',
  autoFormat: true,
};

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<EditorPreferences>(DEFAULT_PREFERENCES);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadPreferences();
    if (stored) {
      setPreferences(stored);
      
      // Apply theme to document
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', stored.theme === 'dark');
      }
    }
  }, []);

  // Save to localStorage whenever preferences change
  useEffect(() => {
    savePreferences(preferences);
    
    // Update document theme class
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
    }
  }, [preferences]);

  const updatePreference = <K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const toggleTheme = () => {
    setPreferences(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  return {
    preferences,
    updatePreference,
    toggleTheme,
  };
};
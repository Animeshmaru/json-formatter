import type { LanguageDefinition } from './types';

export const markdownLanguage: LanguageDefinition = {
  id: 'markdown',
  label: 'Markdown',
  monacoLanguageId: 'markdown',
  supportsStructuralDiff: false,
  validate() {
    // Markdown has no syntax that can be "invalid" in the way JSON/YAML/XML do.
    return { isValid: true, error: null };
  },
  format(content) {
    // No single canonical structure to re-derive from, so "format" is a light,
    // safe normalization rather than a full reflow/prettify pass.
    return content
      .split('\n')
      .map((line) => line.replace(/[ \t]+$/, ''))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+$/, '\n');
  },
};

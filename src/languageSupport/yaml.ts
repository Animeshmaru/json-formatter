import * as YAML from 'yaml';
import type { LanguageDefinition } from './types';

export const yamlLanguage: LanguageDefinition = {
  id: 'yaml',
  label: 'YAML',
  monacoLanguageId: 'yaml',
  supportsStructuralDiff: true,
  validate(content) {
    if (!content.trim()) return { isValid: true, error: null };
    try {
      YAML.parse(content);
      return { isValid: true, error: null };
    } catch (e) {
      return { isValid: false, error: e instanceof Error ? e.message : 'Invalid YAML' };
    }
  },
  format(content) {
    if (!content.trim()) return '';
    return YAML.stringify(YAML.parse(content));
  },
  parse(content) {
    return YAML.parse(content);
  },
  stringify(value, indentSize) {
    return YAML.stringify(value, { indent: indentSize });
  },
};

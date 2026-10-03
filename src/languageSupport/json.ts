import { stripJsonComments, validateAndFormatJson } from '@/utils/jsonFormatter';
import type { LanguageDefinition } from './types';

export const jsonLanguage: LanguageDefinition = {
  id: 'json',
  label: 'JSON',
  monacoLanguageId: 'json',
  supportsStructuralDiff: true,
  validate(content) {
    const result = validateAndFormatJson(content);
    return { isValid: result.isValid, error: result.error };
  },
  format(content) {
    const result = validateAndFormatJson(content);
    if (!result.isValid) throw new Error(result.error ?? 'Invalid JSON');
    return result.formattedJson ?? content;
  },
  parse(content) {
    return JSON.parse(stripJsonComments(content));
  },
  stringify(value, indentSize) {
    return JSON.stringify(value, null, indentSize);
  },
};

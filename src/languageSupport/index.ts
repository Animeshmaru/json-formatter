import type { EditorLanguage } from '@/types';
import type { LanguageDefinition } from './types';
import { jsonLanguage } from './json';
import { yamlLanguage } from './yaml';
import { xmlLanguage } from './xml';
import { markdownLanguage } from './markdown';

export type { LanguageDefinition, LanguageValidation } from './types';

export const LANGUAGES: LanguageDefinition[] = [jsonLanguage, yamlLanguage, xmlLanguage, markdownLanguage];

export function getLanguageById(id: EditorLanguage): LanguageDefinition {
  return LANGUAGES.find((lang) => lang.id === id) ?? jsonLanguage;
}

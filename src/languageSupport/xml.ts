import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';
import type { LanguageDefinition } from './types';

const parserOptions = { ignoreAttributes: false, preserveOrder: true };
const builderOptions = { ignoreAttributes: false, preserveOrder: true, format: true, indentBy: '  ' };

export const xmlLanguage: LanguageDefinition = {
  id: 'xml',
  label: 'XML',
  monacoLanguageId: 'xml',
  supportsStructuralDiff: false,
  validate(content) {
    if (!content.trim()) return { isValid: true, error: null };
    const result = XMLValidator.validate(content);
    if (result === true) return { isValid: true, error: null };
    return {
      isValid: false,
      error: `${result.err.msg} at line ${result.err.line}, column ${result.err.col}`,
    };
  },
  format(content) {
    if (!content.trim()) return '';
    const validation = XMLValidator.validate(content);
    if (validation !== true) throw new Error(validation.err.msg);
    const parsed = new XMLParser(parserOptions).parse(content);
    return new XMLBuilder(builderOptions).build(parsed);
  },
};

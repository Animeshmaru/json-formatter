import type { EditorLanguage } from '@/types';

export interface LanguageValidation {
  isValid: boolean;
  error: string | null;
}

export interface LanguageDefinition {
  id: EditorLanguage;
  label: string;
  monacoLanguageId: string;
  /**
   * Whether this language has a parse/stringify pair suitable for the diff
   * mode's "ignore key order" / "ignore array order" / "keys only" structural
   * comparison options, and for cross-language auto-conversion (e.g. pasting
   * YAML while the Formatter is set to JSON). Languages without a clean,
   * lossless mapping to a plain JS value (XML, Markdown) leave this false and
   * omit parse/stringify.
   */
  supportsStructuralDiff: boolean;
  validate(content: string): LanguageValidation;
  /** Pretty-prints content with a fixed 2-space indent. Throws on invalid input. */
  format(content: string): string;
  /** Required when supportsStructuralDiff is true. Throws on invalid input. */
  parse?(content: string): unknown;
  /** Required when supportsStructuralDiff is true. */
  stringify?(value: unknown, indentSize: number): string;
}

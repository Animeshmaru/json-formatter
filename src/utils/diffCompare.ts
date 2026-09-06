import { stripJsonComments } from './jsonFormatter';

export interface NormalizeOptions {
  ignoreKeyOrder: boolean;
  ignoreArrayOrder: boolean;
  keysOnly: boolean;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function canonicalizeValue(
  value: unknown,
  opts: { sortKeys: boolean; sortArrays: boolean }
): unknown {
  if (Array.isArray(value)) {
    const mapped = value.map((v) => canonicalizeValue(v, opts));
    if (opts.sortArrays) {
      return [...mapped].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    }
    return mapped;
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    if (opts.sortKeys) keys.sort();
    const result: Record<string, unknown> = {};
    for (const key of keys) {
      result[key] = canonicalizeValue(value[key], opts);
    }
    return result;
  }
  return value;
}

// Recursively replaces every leaf scalar with a fixed placeholder so a diff over the
// result only reflects added/removed keys or array-length changes, never value edits.
export function stripValuesForKeysOnly(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripValuesForKeysOnly);
  }
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      result[key] = stripValuesForKeysOnly(value[key]);
    }
    return result;
  }
  return null;
}

export function normalizeJsonForDiff(
  content: string,
  opts: NormalizeOptions,
  indentSize: number = 2,
  indentType: 'spaces' | 'tabs' = 'spaces'
): string {
  if (!content.trim()) return content;
  try {
    let parsed = JSON.parse(stripJsonComments(content));
    if (opts.keysOnly) parsed = stripValuesForKeysOnly(parsed);
    const canonical = canonicalizeValue(parsed, {
      sortKeys: opts.ignoreKeyOrder,
      sortArrays: opts.ignoreArrayOrder,
    });
    const indent = indentType === 'tabs' ? '\t' : ' '.repeat(indentSize);
    return JSON.stringify(canonical, null, indent);
  } catch {
    return content;
  }
}


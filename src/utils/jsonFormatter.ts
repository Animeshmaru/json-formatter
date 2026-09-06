import { ValidationResult } from '@/types';

function stripJsonComments(input: string): string {
  let result = '';
  let i = 0;
  const len = input.length;

  while (i < len) {
    if (input[i] === '"') {
      result += '"';
      i++;
      while (i < len) {
        if (input[i] === '\\' && i + 1 < len) {
          result += input[i] + input[i + 1];
          i += 2;
        } else if (input[i] === '"') {
          result += '"';
          i++;
          break;
        } else {
          result += input[i];
          i++;
        }
      }
    } else if (input[i] === '/' && i + 1 < len && input[i + 1] === '/') {
      i += 2;
      while (i < len && input[i] !== '\n') i++;
    } else if (input[i] === '/' && i + 1 < len && input[i + 1] === '*') {
      i += 2;
      while (i < len) {
        if (input[i] === '*' && i + 1 < len && input[i + 1] === '/') {
          i += 2;
          break;
        }
        i++;
      }
    } else {
      result += input[i];
      i++;
    }
  }

  return result;
}

export function validateAndFormatJson(
  input: string,
  indentSize: number = 2,
  indentType: 'spaces' | 'tabs' = 'spaces'
): ValidationResult {
  if (!input.trim()) {
    return {
      isValid: true,
      error: null,
      formattedJson: '',
    };
  }

  try {
    const stripped = stripJsonComments(input);
    const parsed = JSON.parse(stripped);
    const indent = indentType === 'tabs' ? '\t' : ' '.repeat(indentSize);
    const formattedJson = JSON.stringify(parsed, null, indent);

    return {
      isValid: true,
      error: null,
      formattedJson,
    };
  } catch (e) {
    if (e instanceof SyntaxError) {
      const errorMessage = e.message;
      const positionMatch = errorMessage.match(/position (\d+)/i);
      const position = positionMatch ? parseInt(positionMatch[1], 10) : null;

      let lineInfo = '';
      if (position !== null) {
        const lines = stripJsonComments(input).substring(0, position).split('\n');
        const lineNumber = lines.length;
        const columnNumber = lines[lines.length - 1].length + 1;
        lineInfo = ` at line ${lineNumber}, column ${columnNumber}`;
      }

      return {
        isValid: false,
        error: `Invalid JSON${lineInfo}: ${errorMessage}`,
        formattedJson: input,
      };
    }

    return {
      isValid: false,
      error: 'Unknown error while parsing JSON',
      formattedJson: input,
    };
  }
}

export function minifyJson(input: string): string {
  try {
    const parsed = JSON.parse(stripJsonComments(input));
    return JSON.stringify(parsed);
  } catch {
    return input;
  }
}

export function isValidJson(input: string): boolean {
  if (!input.trim()) return true;
  try {
    JSON.parse(stripJsonComments(input));
    return true;
  } catch {
    return false;
  }
}

export function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

export function normalizeJsonForDiff(
  content: string,
  indentSize: number = 2,
  indentType: 'spaces' | 'tabs' = 'spaces'
): string {
  if (!content.trim()) return content;
  try {
    const parsed = JSON.parse(stripJsonComments(content));
    const indent = indentType === 'tabs' ? '\t' : ' '.repeat(indentSize);
    return JSON.stringify(sortKeysDeep(parsed), null, indent);
  } catch {
    return content;
  }
}

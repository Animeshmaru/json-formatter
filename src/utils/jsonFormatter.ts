import { ValidationResult } from '@/types';

/**
 * Format JSON-like structure by indenting based on braces/brackets.
 * Works on invalid JSON to at least improve readability while showing the error.
 */
function formatStructure(
  input: string,
  indentSize: number = 2,
  indentType: 'spaces' | 'tabs' = 'spaces'
): string {
  const indent = indentType === 'tabs' ? '\t' : ' '.repeat(indentSize);
  let depth = 0;
  let result = '';
  let i = 0;
  const len = input.length;

  const skipWhitespace = () => {
    while (i < len && /[\s\n\r\t]/.test(input[i])) {
      result += input[i];
      i++;
    }
  };

  while (i < len) {
    const ch = input[i];
    if (ch === '{' || ch === '[') {
      result += ch;
      i++;
      skipWhitespace();
      if (i < len && input[i] !== '}' && input[i] !== ']') {
        depth++;
        result += '\n' + indent.repeat(depth);
      }
    } else if (ch === '}' || ch === ']') {
      if (depth > 0) {
        depth--;
        result += '\n' + indent.repeat(depth);
      }
      result += ch;
      i++;
      skipWhitespace();
      if (i < len && input[i] === ',') {
        result += input[i];
        i++;
        result += '\n' + indent.repeat(depth);
      }
    } else if (ch === ',') {
      result += ch;
      i++;
      skipWhitespace();
      if (i < len) {
        result += '\n' + indent.repeat(depth);
      }
    } else if (ch === '"') {
      result += ch;
      i++;
      while (i < len) {
        if (input[i] === '\\') {
          result += input[i];
          if (i + 1 < len) result += input[i + 1];
          i += 2;
        } else if (input[i] === '"') {
          result += input[i];
          i++;
          break;
        } else {
          result += input[i];
          i++;
        }
      }
    } else {
      result += ch;
      i++;
    }
  }

  return result.trim();
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
    const parsed = JSON.parse(input);
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
        const lines = input.substring(0, position).split('\n');
        const lineNumber = lines.length;
        const columnNumber = lines[lines.length - 1].length + 1;
        lineInfo = ` at line ${lineNumber}, column ${columnNumber}`;
      }

      return {
        isValid: false,
        error: `Invalid JSON${lineInfo}: ${errorMessage}`,
        formattedJson: formatStructure(input, indentSize, indentType),
      };
    }

    return {
      isValid: false,
      error: 'Unknown error while parsing JSON',
      formattedJson: formatStructure(input, indentSize, indentType),
    };
  }
}

export function minifyJson(input: string): string {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed);
  } catch {
    return input;
  }
}

export function isValidJson(input: string): boolean {
  if (!input.trim()) return true;
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
}

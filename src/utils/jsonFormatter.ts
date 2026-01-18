import { ValidationResult } from '@/types';

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
        formattedJson: null,
      };
    }
    
    return {
      isValid: false,
      error: 'Unknown error while parsing JSON',
      formattedJson: null,
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

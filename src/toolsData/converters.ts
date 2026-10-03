import * as YAML from 'yaml';
import { stripJsonComments } from '@/utils/jsonFormatter';

export interface ConverterDefinition {
  id: string;
  label: string;
  /** Monaco language id used to syntax-highlight the output pane. */
  outputLanguage: string;
  /** Throws on invalid input. */
  transform: (input: string) => string;
}

export const CONVERTERS: ConverterDefinition[] = [
  {
    id: 'json-to-yaml',
    label: 'JSON → YAML',
    outputLanguage: 'yaml',
    transform: (input) => YAML.stringify(JSON.parse(stripJsonComments(input))),
  },
  {
    id: 'yaml-to-json',
    label: 'YAML → JSON',
    outputLanguage: 'json',
    transform: (input) => JSON.stringify(YAML.parse(input), null, 2),
  },
];

export function getConverterById(id: string): ConverterDefinition | undefined {
  return CONVERTERS.find((c) => c.id === id);
}

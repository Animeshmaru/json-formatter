import * as YAML from 'yaml';
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';
import { stripJsonComments } from '@/utils/jsonFormatter';

export interface ConverterDefinition {
  id: string;
  label: string;
  /** Monaco language id used to syntax-highlight the output pane. */
  outputLanguage: string;
  /** Throws on invalid input. */
  transform: (input: string) => string;
}

function parseEpoch(input: string): Date {
  const trimmed = input.trim();
  if (!/^-?\d+$/.test(trimmed)) {
    throw new Error('Expected a Unix timestamp (integer seconds or milliseconds)');
  }
  const num = Number(trimmed);
  const ms = Math.abs(num) >= 1e12 ? num : num * 1000;
  const date = new Date(ms);
  if (isNaN(date.getTime())) throw new Error('Invalid timestamp');
  return date;
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
  {
    id: 'json-to-xml',
    label: 'JSON → XML',
    outputLanguage: 'xml',
    transform: (input) =>
      new XMLBuilder({ ignoreAttributes: false, format: true, indentBy: '  ' }).build(
        JSON.parse(stripJsonComments(input))
      ),
  },
  {
    id: 'xml-to-json',
    label: 'XML → JSON',
    outputLanguage: 'json',
    transform: (input) => {
      const validation = XMLValidator.validate(input);
      if (validation !== true) throw new Error(validation.err.msg);
      return JSON.stringify(new XMLParser({ ignoreAttributes: false }).parse(input), null, 2);
    },
  },
  {
    id: 'epoch-to-date',
    label: 'Epoch → Date',
    outputLanguage: 'text',
    transform: (input) => {
      if (!input.trim()) return '';
      const date = parseEpoch(input);
      return [
        `ISO 8601:    ${date.toISOString()}`,
        `UTC:         ${date.toUTCString()}`,
        `Local:       ${date.toString()}`,
        `Unix (sec):  ${Math.floor(date.getTime() / 1000)}`,
        `Unix (ms):   ${date.getTime()}`,
      ].join('\n');
    },
  },
  {
    id: 'date-to-epoch',
    label: 'Date → Epoch',
    outputLanguage: 'text',
    transform: (input) => {
      const trimmed = input.trim();
      if (!trimmed) return '';
      const date = new Date(trimmed);
      if (isNaN(date.getTime())) {
        throw new Error('Could not parse a date — try an ISO 8601 or RFC 2822 date string');
      }
      return [
        `Unix (seconds):      ${Math.floor(date.getTime() / 1000)}`,
        `Unix (milliseconds): ${date.getTime()}`,
        `ISO 8601:            ${date.toISOString()}`,
      ].join('\n');
    },
  },
];

export function getConverterById(id: string): ConverterDefinition | undefined {
  return CONVERTERS.find((c) => c.id === id);
}

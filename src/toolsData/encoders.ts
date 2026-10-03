export interface EncoderDefinition {
  id: string;
  label: string;
  /** Throws on invalid input. */
  transform: (input: string) => string;
}

function utf8ToBase64(input: string): string {
  return btoa(unescape(encodeURIComponent(input)));
}

function base64ToUtf8(input: string): string {
  return decodeURIComponent(escape(atob(input)));
}

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return base64ToUtf8(padded);
}

export const ENCODERS: EncoderDefinition[] = [
  { id: 'base64-encode', label: 'Base64 Encode', transform: utf8ToBase64 },
  { id: 'base64-decode', label: 'Base64 Decode', transform: base64ToUtf8 },
  { id: 'url-encode', label: 'URL Encode', transform: encodeURIComponent },
  { id: 'url-decode', label: 'URL Decode', transform: decodeURIComponent },
  {
    id: 'jwt-decode',
    label: 'JWT Decode',
    transform: (input) => {
      const parts = input.trim().split('.');
      if (parts.length < 2) {
        throw new Error('Not a valid JWT — expected header.payload.signature');
      }
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      return JSON.stringify({ header, payload, signature: parts[2] ?? null }, null, 2);
    },
  },
];

export function getEncoderById(id: string): EncoderDefinition | undefined {
  return ENCODERS.find((e) => e.id === id);
}

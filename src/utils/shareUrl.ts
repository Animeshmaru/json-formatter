import LZString from 'lz-string';

export function createShareableUrl(json: string): string {
  if (!json.trim()) return window.location.origin;
  
  const compressed = LZString.compressToEncodedURIComponent(json);
  return `${window.location.origin}${window.location.pathname}?json=${compressed}`;
}

export function getJsonFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const encodedJson = params.get('json');
  
  if (!encodedJson) return null;
  
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encodedJson);
    return decompressed || null;
  } catch {
    return null;
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function clearUrlParams(): void {
  const url = new URL(window.location.href);
  url.search = '';
  window.history.replaceState({}, '', url.toString());
}

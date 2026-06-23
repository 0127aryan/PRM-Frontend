/** Client-safe config — only NEXT_PUBLIC_* vars are available in the browser. */

export function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL is missing. Copy .env.example to .env.local',
    );
  }
  return url.replace(/\/$/, '');
}

// Safe media URL builder — works in both SSR (window undefined) and browser.
// Pure helper (no transport); use for any /uploads/* paths rather than touching
// window directly. Lives in lib/ so the UI can import it without going through
// the api/ transport layer.
export function mediaUrl(storagePath: string): string {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${host}:3001${storagePath}`;
}

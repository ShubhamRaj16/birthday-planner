// Tiny client-side CSV helper (SCRUM-48). No backend endpoint needed — data is
// already in Redux. RFC-4180-ish quoting: wrap fields containing comma/quote/newline.

function escapeCell(value: unknown): string {
  const s = value == null ? '' : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Build a CSV string from a header row + array of row objects (column order = headers). */
export function toCsv<T>(headers: { key: keyof T; label: string }[], rows: T[]): string {
  const head = headers.map((h) => escapeCell(h.label)).join(',');
  const body = rows
    .map((row) =>
      headers.map((h) => escapeCell((row as Record<keyof T, unknown>)[h.key])).join(',')
    )
    .join('\n');
  return `${head}\n${body}`;
}

/** Trigger a browser download of `content` as `filename`. No-op during SSR. */
export function downloadCsv(filename: string, content: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Slugify a string for use in a filename (e.g. event theme). */
export function fileSlug(s: string | null | undefined): string {
  return (s || 'export')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

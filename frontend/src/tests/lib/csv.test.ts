import { describe, it, expect } from 'vitest';
import { toCsv, fileSlug } from '../../lib/csv';

interface Row { name: string; note: string; }

describe('toCsv', () => {
  it('builds header + body rows in column order', () => {
    const headers = [
      { key: 'name' as const, label: 'Name' },
      { key: 'note' as const, label: 'Note' },
    ];
    const rows: Row[] = [{ name: 'Alice', note: 'hi' }];
    expect(toCsv(headers, rows)).toBe('Name,Note\nAlice,hi');
  });

  it('quotes fields containing comma, quote, or newline', () => {
    const headers = [{ key: 'note' as const, label: 'Note' }];
    const rows = [{ note: 'a,b' }, { note: 'say "hi"' }, { note: 'line1\nline2' }];
    expect(toCsv(headers, rows)).toBe('Note\n"a,b"\n"say ""hi"""\n"line1\nline2"');
  });

  it('renders null/undefined cells as empty', () => {
    const headers = [{ key: 'note' as const, label: 'Note' }];
    const rows = [{ note: null as unknown as string }];
    expect(toCsv(headers, rows)).toBe('Note\n');
  });
});

describe('fileSlug', () => {
  it('slugifies and trims dashes', () => {
    expect(fileSlug('Jungle  Theme!')).toBe('jungle-theme');
  });
  it('defaults to "export" for empty input', () => {
    expect(fileSlug('')).toBe('export');
    expect(fileSlug(null)).toBe('export');
  });
});

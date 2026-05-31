import { normalisePhone } from '../../lib/waLink';

describe('normalisePhone', () => {
  it('prepends 91 to 10-digit number', () => {
    expect(normalisePhone('9876543210')).toBe('919876543210');
  });

  it('replaces leading 0 with 91', () => {
    expect(normalisePhone('09876543210')).toBe('919876543210');
  });

  it('strips leading + from +91 format', () => {
    expect(normalisePhone('+919876543210')).toBe('919876543210');
  });

  it('passes through already-normalised 12-digit number', () => {
    expect(normalisePhone('919876543210')).toBe('919876543210');
  });

  it('strips spaces, dashes, parens', () => {
    expect(normalisePhone('+91 98765 43210')).toBe('919876543210');
    expect(normalisePhone('(98765)43210')).toBe('919876543210');
  });

  it('returns null for non-numeric string', () => {
    expect(normalisePhone('abcdefghij')).toBeNull();
  });

  it('returns null for null', () => {
    expect(normalisePhone(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(normalisePhone(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(normalisePhone('')).toBeNull();
  });
});

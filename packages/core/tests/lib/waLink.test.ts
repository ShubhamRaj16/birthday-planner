import { normalisePhone, buildWaLink } from '../../src/lib/waLink';

describe('normalisePhone', () => {
  it('prepends 91 to 10-digit number', () => {
    expect(normalisePhone('9876543210')).toBe('919876543210');
  });

  it('replaces leading 0 with 91', () => {
    expect(normalisePhone('09876543210')).toBe('919876543210');
  });

  it('strips leading + from international format', () => {
    expect(normalisePhone('+919876543210')).toBe('919876543210');
  });

  it('passes through already-normalised number', () => {
    expect(normalisePhone('919876543210')).toBe('919876543210');
  });

  it('strips spaces, dashes, parens', () => {
    expect(normalisePhone('+91 98765 43210')).toBe('919876543210');
    expect(normalisePhone('(98765) 43210')).toBe('919876543210');
  });

  it('returns null for non-numeric string', () => {
    expect(normalisePhone('abcdefghij')).toBeNull();
  });

  it('returns null for null input', () => {
    expect(normalisePhone(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(normalisePhone(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(normalisePhone('')).toBeNull();
  });
});

describe('buildWaLink', () => {
  it('builds correct wa.me URL', () => {
    const link = buildWaLink('9876543210', 'Hello');
    expect(link).toBe('https://wa.me/919876543210?text=Hello');
  });

  it('URL-encodes the message', () => {
    const link = buildWaLink('9876543210', 'Hi there!');
    expect(link).toContain('Hi%20there!');
  });

  it('returns null for invalid phone', () => {
    expect(buildWaLink('invalid', 'Hello')).toBeNull();
  });

  it('returns null for null phone', () => {
    expect(buildWaLink(null, 'Hello')).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { mediaUrl } from '../../lib/media';

describe('mediaUrl', () => {
  it('builds a URL against the current hostname on port 3001', () => {
    expect(mediaUrl('/uploads/x.jpg')).toBe('http://localhost:3001/uploads/x.jpg');
  });

  it('passes the storage path through unchanged', () => {
    expect(mediaUrl('/uploads/photos/10/a b.png')).toBe(
      'http://localhost:3001/uploads/photos/10/a b.png'
    );
  });
});

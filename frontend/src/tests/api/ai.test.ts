import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import http from '../../api/http';
import { aiApi } from '../../api/ai.api';
import { ok } from '../../test/mockHttp';

const mockHttp = vi.mocked(http);
beforeEach(() => vi.clearAllMocks());

describe('aiApi.getSuggestions', () => {
  it('posts type and returns suggestions array', async () => {
    mockHttp.post.mockResolvedValue(ok({ suggestions: ['a', 'b'] }));
    await expect(aiApi.getSuggestions(10, 'themes')).resolves.toEqual(['a', 'b']);
    expect(mockHttp.post).toHaveBeenCalledWith('/events/10/ai/suggest', { type: 'themes' });
  });

  it('returns [] when suggestions missing', async () => {
    mockHttp.post.mockResolvedValue(ok({}));
    await expect(aiApi.getSuggestions(10, 'gifts')).resolves.toEqual([]);
  });
});

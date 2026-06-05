import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import http from '../../api/http';
import { giftsApi } from '../../api/gifts.api';
import { ok } from '../../test/mockHttp';
import { aGift } from '../../test/fixtures';

const mockHttp = vi.mocked(http);
beforeEach(() => vi.clearAllMocks());

describe('giftsApi.createGift', () => {
  it('posts name + source and returns the gift', async () => {
    const gift = aGift({ name: 'Lego', source: 'ai' });
    mockHttp.post.mockResolvedValue(ok(gift));
    await expect(giftsApi.createGift(10, { name: 'Lego', source: 'ai' })).resolves.toEqual(gift);
    expect(mockHttp.post).toHaveBeenCalledWith('/events/10/gifts', { name: 'Lego', source: 'ai' });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import http from '../../api/http';
import { whatsappApi } from '../../api/whatsapp.api';
import { ok } from '../../test/mockHttp';

const mockHttp = vi.mocked(http);
beforeEach(() => vi.clearAllMocks());

describe('whatsappApi', () => {
  it('fetchDefaultTemplate returns template string', async () => {
    mockHttp.get.mockResolvedValue(ok({ template: 'Hi {guestName}' }));
    await expect(whatsappApi.fetchDefaultTemplate()).resolves.toBe('Hi {guestName}');
    expect(mockHttp.get).toHaveBeenCalledWith('/whatsapp/default-template');
  });

  it('fetchDefaultTemplate returns null when absent', async () => {
    mockHttp.get.mockResolvedValue(ok({}));
    await expect(whatsappApi.fetchDefaultTemplate()).resolves.toBeNull();
  });

  it('previewMessage posts eventId + template and returns message', async () => {
    mockHttp.post.mockResolvedValue(ok({ message: 'rendered' }));
    await expect(whatsappApi.previewMessage(10, 'T')).resolves.toBe('rendered');
    expect(mockHttp.post).toHaveBeenCalledWith('/whatsapp/preview', { eventId: 10, template: 'T' });
  });

  it('buildLink posts eventId + guestId and returns link', async () => {
    mockHttp.post.mockResolvedValue(ok({ link: 'https://wa.me/91...' }));
    await expect(whatsappApi.buildLink(10, 100)).resolves.toBe('https://wa.me/91...');
    expect(mockHttp.post).toHaveBeenCalledWith('/whatsapp/link', { eventId: 10, guestId: 100 });
  });
});

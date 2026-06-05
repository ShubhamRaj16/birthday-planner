import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import http from '../../api/http';
import { eventsApi } from '../../api/events.api';
import { ok } from '../../test/mockHttp';
import { anEvent } from '../../test/fixtures';

const mockHttp = vi.mocked(http);
beforeEach(() => vi.clearAllMocks());

describe('eventsApi.uploadInviteCard', () => {
  it('posts FormData to the invite-card endpoint and returns the event', async () => {
    const ev = anEvent({ cardPath: '/uploads/invite-cards/x.png' });
    mockHttp.post.mockResolvedValue(ok(ev));
    const file = new File(['x'], 'card.png', { type: 'image/png' });

    const result = await eventsApi.uploadInviteCard(10, file);

    expect(result).toEqual(ev);
    const [url, body, config] = mockHttp.post.mock.calls[0];
    expect(url).toBe('/events/10/invite-card');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('card')).toBe(file);
    expect(config).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
  });
});

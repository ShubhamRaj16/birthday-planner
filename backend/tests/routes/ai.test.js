import request from 'supertest';
import app from '../../src/app';
import { createTestChild, createTestEvent } from '../../src/test/helpers';
import { _setClientForTesting, _resetClient } from '../../src/services/aiService';

const mockCreate = vi.fn();
const mockClient = { messages: { create: mockCreate } };

beforeEach(() => {
  _setClientForTesting(mockClient);
  mockCreate.mockReset();
  mockCreate.mockResolvedValue({
    content: [{ text: '["idea 1","idea 2","idea 3","idea 4","idea 5"]' }],
  });
});

afterAll(() => {
  _resetClient();
});

describe('AI routes', () => {
  let child, event;

  beforeEach(async () => {
    child = await createTestChild();
    event = await createTestEvent(child.id);
  });

  const url = () => `/api/v1/events/${event.id}/ai/suggest`;

  describe('POST /suggest', () => {
    it('returns 200 with suggestions array', async () => {
      const res = await request(app).post(url()).send({ type: 'themes' });
      expect(res.status).toBe(200);
      expect(res.body.data.suggestions).toHaveLength(5);
    });

    it('returns 400 when type missing', async () => {
      const res = await request(app).post(url()).send({});
      expect(res.status).toBe(400);
    });

    it('returns 400 for unknown type', async () => {
      const res = await request(app).post(url()).send({ type: 'unknown' });
      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent event', async () => {
      const res = await request(app).post('/api/v1/events/99999/ai/suggest').send({ type: 'themes' });
      expect(res.status).toBe(404);
    });

    it('returns 500 when SDK throws', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API overloaded'));
      const res = await request(app).post(url()).send({ type: 'gifts' });
      expect(res.status).toBe(500);
    });
  });
});

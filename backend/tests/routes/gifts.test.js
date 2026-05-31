const request = require('supertest');
const app = require('../../src/app');
const { createTestChild, createTestEvent } = require('../../src/test/helpers');
const prisma = require('../../src/lib/prisma');

describe('Gifts routes', () => {
  let child, event;

  beforeEach(async () => {
    child = await createTestChild();
    event = await createTestEvent(child.id);
  });

  const url = () => `/api/v1/events/${event.id}/gifts`;

  describe('GET gifts', () => {
    it('returns empty list initially', async () => {
      const res = await request(app).get(url());
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('POST gift', () => {
    it('creates gift with defaults', async () => {
      const res = await request(app)
        .post(url())
        .send({ name: 'Lego Set' });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('idea');
      expect(res.body.data.source).toBe('manual');
    });
  });

  describe('PUT gift', () => {
    it('updates status', async () => {
      const gift = await prisma.gift.create({
        data: { eventId: event.id, name: 'Puzzle', status: 'idea', source: 'manual' },
      });
      const res = await request(app)
        .put(`${url()}/${gift.id}`)
        .send({ status: 'bought' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('bought');
    });
  });

  describe('DELETE gift', () => {
    it('removes gift', async () => {
      const gift = await prisma.gift.create({
        data: { eventId: event.id, name: 'Book', status: 'idea', source: 'manual' },
      });
      const res = await request(app).delete(`${url()}/${gift.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);
    });
  });
});

const request = require('supertest');
const app = require('../../src/app');
const { createTestChild } = require('../../src/test/helpers');

const FUTURE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

describe('Children routes', () => {
  describe('GET /api/v1/children', () => {
    it('returns empty array when no children', async () => {
      const res = await request(app).get('/api/v1/children');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('returns children list', async () => {
      await createTestChild({ name: 'Alice' });
      const res = await request(app).get('/api/v1/children');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Alice');
    });
  });

  describe('POST /api/v1/children', () => {
    it('creates child and returns 201', async () => {
      const res = await request(app)
        .post('/api/v1/children')
        .send({ name: 'Bob', dob: '2018-03-10' });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Bob');
      expect(res.body.error).toBeNull();
    });

    it('returns 400 when name missing', async () => {
      const res = await request(app)
        .post('/api/v1/children')
        .send({ dob: '2018-03-10' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION');
    });

    it('returns 400 when dob missing', async () => {
      const res = await request(app)
        .post('/api/v1/children')
        .send({ name: 'Charlie' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/children/:id', () => {
    it('returns 404 for non-existent child', async () => {
      const res = await request(app).get('/api/v1/children/99999');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('returns child by id', async () => {
      const child = await createTestChild({ name: 'Dave' });
      const res = await request(app).get(`/api/v1/children/${child.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Dave');
    });
  });

  describe('PUT /api/v1/children/:id', () => {
    it('updates child fields', async () => {
      const child = await createTestChild();
      const res = await request(app)
        .put(`/api/v1/children/${child.id}`)
        .send({ interests: 'Lego, Space' });
      expect(res.status).toBe(200);
      expect(res.body.data.interests).toBe('Lego, Space');
    });
  });

  describe('DELETE /api/v1/children/:id', () => {
    it('deletes child and returns deleted:true', async () => {
      const child = await createTestChild();
      const res = await request(app).delete(`/api/v1/children/${child.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);
    });

    it('cascade-deletes child events (verified via GET events)', async () => {
      const child = await createTestChild();
      // Create an event for the child
      await request(app)
        .post('/api/v1/events')
        .send({ childId: child.id, date: FUTURE });
      // Delete the child
      await request(app).delete(`/api/v1/children/${child.id}`);
      // Events should be gone
      const events = await request(app).get('/api/v1/events');
      expect(events.body.data.every(e => e.childId !== child.id)).toBe(true);
    });
  });
});

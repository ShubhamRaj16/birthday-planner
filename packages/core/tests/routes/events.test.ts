import request from 'supertest';
import app from '../../src/app';
import { createTestChild, createTestEvent } from '../../src/test/helpers';
import prisma from '../../src/lib/prisma';

const TASK_COUNT = 11;

describe('Events routes', () => {
  let child;

  beforeEach(async () => {
    child = await createTestChild();
  });

  const futureDate = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  describe('POST /api/v1/events', () => {
    it('returns 201 with correct envelope', async () => {
      const res = await request(app)
        .post('/api/v1/events')
        .send({ childId: child.id, date: futureDate() });
      expect(res.status).toBe(201);
      expect(res.body.error).toBeNull();
    });

    it(`auto-creates ${TASK_COUNT} default tasks`, async () => {
      const res = await request(app)
        .post('/api/v1/events')
        .send({ childId: child.id, date: futureDate() });
      expect(res.body.data.tasks).toHaveLength(TASK_COUNT);
    });

    it('tasks have correct relative due dates', async () => {
      const eventDate = futureDate();
      const res = await request(app)
        .post('/api/v1/events')
        .send({ childId: child.id, date: eventDate });
      const fixVenue = res.body.data.tasks.find(t => t.title === 'Fix venue & date');
      const diff = Math.round(
        (new Date(fixVenue.dueDate) - new Date(eventDate)) / (24 * 60 * 60 * 1000)
      );
      expect(diff).toBe(-60);
    });

    it('returns 400 when childId missing', async () => {
      const res = await request(app)
        .post('/api/v1/events')
        .send({ date: futureDate() });
      expect(res.status).toBe(400);
    });

    it('returns 400 when date missing', async () => {
      const res = await request(app)
        .post('/api/v1/events')
        .send({ childId: child.id });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/events', () => {
    it('returns list of events', async () => {
      await createTestEvent(child.id);
      const res = await request(app).get('/api/v1/events');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/events/upcoming', () => {
    it('excludes Completed events', async () => {
      const event = await createTestEvent(child.id);
      await prisma.event.update({ where: { id: event.id }, data: { status: 'Completed' } });
      const res = await request(app).get('/api/v1/events/upcoming');
      expect(res.body.data.every(e => e.id !== event.id)).toBe(true);
    });

    it('excludes past-dated Active events', async () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const event = await createTestEvent(child.id, { date: past });
      await prisma.event.update({ where: { id: event.id }, data: { status: 'Active' } });
      const res = await request(app).get('/api/v1/events/upcoming');
      expect(res.body.data.every(e => e.id !== event.id)).toBe(true);
    });
  });

  describe('GET /api/v1/events/:id', () => {
    it('returns 404 for missing event', async () => {
      const res = await request(app).get('/api/v1/events/99999');
      expect(res.status).toBe(404);
    });

    it('returns event by id', async () => {
      const event = await createTestEvent(child.id);
      const res = await request(app).get(`/api/v1/events/${event.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(event.id);
    });
  });

  describe('POST /api/v1/events/:id/activate', () => {
    it('sets status to Active', async () => {
      const event = await createTestEvent(child.id);
      const res = await request(app).post(`/api/v1/events/${event.id}/activate`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Active');
    });
  });

  describe('PUT /api/v1/events/:id', () => {
    it('updates venue field', async () => {
      const event = await createTestEvent(child.id);
      const res = await request(app)
        .put(`/api/v1/events/${event.id}`)
        .send({ venue: 'New Hall' });
      expect(res.status).toBe(200);
      expect(res.body.data.venue).toBe('New Hall');
    });
  });

  describe('DELETE /api/v1/events/:id', () => {
    it('removes event and cascade-deletes tasks', async () => {
      const event = await createTestEvent(child.id);
      const eventId = event.id;
      const res = await request(app).delete(`/api/v1/events/${eventId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);
      const tasks = await prisma.task.findMany({ where: { eventId } });
      expect(tasks).toHaveLength(0);
    });
  });
});

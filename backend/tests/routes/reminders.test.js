const request = require('supertest');
const app = require('../../src/app');
const { createTestChild, createTestEvent, createTestReminder } = require('../../src/test/helpers');
const prisma = require('../../src/lib/prisma');

describe('Reminders routes', () => {
  let child, event;

  beforeEach(async () => {
    child = await createTestChild();
    event = await createTestEvent(child.id);
  });

  describe('POST reminder', () => {
    it('creates reminder and returns 201', async () => {
      const triggerAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .post('/api/v1/reminders')
        .send({ eventId: event.id, triggerAt, label: 'Send invites', type: 'general' });
      expect(res.status).toBe(201);
      expect(res.body.data.label).toBe('Send invites');
    });
  });

  describe('GET /unread-count', () => {
    it('returns count of fired non-read reminders', async () => {
      await createTestReminder(event.id, { triggerAt: new Date(Date.now() - 1000), fired: true });
      const res = await request(app).get('/api/v1/reminders/unread-count');
      expect(res.status).toBe(200);
      expect(res.body.data.count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /mark-read', () => {
    it('marks reminders as read', async () => {
      const r = await createTestReminder(event.id, { fired: true });
      const res = await request(app)
        .post('/api/v1/reminders/mark-read')
        .send({ ids: [r.id] });
      expect(res.status).toBe(200);
      const updated = await prisma.reminder.findUnique({ where: { id: r.id } });
      expect(updated.type).toBe('read');
    });
  });

  describe('DELETE reminder', () => {
    it('removes reminder', async () => {
      const r = await createTestReminder(event.id);
      const res = await request(app).delete(`/api/v1/reminders/${r.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);
    });
  });
});

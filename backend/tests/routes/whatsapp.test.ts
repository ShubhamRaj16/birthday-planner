const request = require('supertest');
const app = require('../../src/app');
const { createTestChild, createTestEvent, createTestGuest } = require('../../src/test/helpers');

describe('WhatsApp routes', () => {
  let child, event, guest;

  beforeEach(async () => {
    child = await createTestChild({ name: 'Arjun' });
    event = await createTestEvent(child.id, { venue: 'Park' });
    guest = await createTestGuest(event.id, { name: 'Priya', phone: '9876543210' });
  });

  describe('POST /api/v1/whatsapp/link', () => {
    it('returns wa.me URL for valid guest', async () => {
      const res = await request(app)
        .post('/api/v1/whatsapp/link')
        .send({ eventId: event.id, guestId: guest.id });
      expect(res.status).toBe(200);
      expect(res.body.data.link).toMatch(/^https:\/\/wa\.me\//);
      expect(res.body.data.link).toContain('919876543210');
    });

    it('marks invite sent on the guest', async () => {
      await request(app)
        .post('/api/v1/whatsapp/link')
        .send({ eventId: event.id, guestId: guest.id });
      const res = await request(app)
        .get(`/api/v1/events/${event.id}/guests`);
      const updated = res.body.data.find(g => g.id === guest.id);
      expect(updated.inviteSent).toBe(true);
    });

    it('returns 400 when eventId missing', async () => {
      const res = await request(app)
        .post('/api/v1/whatsapp/link')
        .send({ guestId: guest.id });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/whatsapp/default-template', () => {
    it('returns default template string', async () => {
      const res = await request(app).get('/api/v1/whatsapp/default-template');
      expect(res.status).toBe(200);
      expect(typeof res.body.data.template).toBe('string');
      expect(res.body.data.template).toContain('{guestName}');
    });
  });

  describe('POST /api/v1/whatsapp/preview', () => {
    it('returns rendered message preview', async () => {
      const res = await request(app)
        .post('/api/v1/whatsapp/preview')
        .send({ eventId: event.id, sampleName: 'Test Guest' });
      expect(res.status).toBe(200);
      expect(res.body.data.message).toContain('Test Guest');
    });

    it('returns 400 when eventId missing', async () => {
      const res = await request(app)
        .post('/api/v1/whatsapp/preview')
        .send({});
      expect(res.status).toBe(400);
    });
  });
});

import request from 'supertest';
import app from '../../src/app';
import { createTestChild, createTestEvent, createTestGuest } from '../../src/test/helpers';

describe('Guests routes', () => {
  let child, event;

  beforeEach(async () => {
    child = await createTestChild();
    event = await createTestEvent(child.id);
  });

  const url = () => `/api/v1/events/${event.id}/guests`;

  describe('GET guests', () => {
    it('returns empty list initially', async () => {
      const res = await request(app).get(url());
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('POST guest', () => {
    it('creates guest and returns 201', async () => {
      const res = await request(app).post(url()).send({ name: 'Eve', phone: '9000000001' });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Eve');
      expect(res.body.data.rsvp).toBe('Pending');
    });

    it('returns 400 when name missing', async () => {
      const res = await request(app).post(url()).send({ phone: '9000000002' });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT guest', () => {
    it('updates RSVP to Confirmed', async () => {
      const guest = await createTestGuest(event.id);
      const res = await request(app)
        .put(`${url()}/${guest.id}`)
        .send({ rsvp: 'Confirmed' });
      expect(res.status).toBe(200);
      expect(res.body.data.rsvp).toBe('Confirmed');
    });
  });

  describe('DELETE guest', () => {
    it('removes guest', async () => {
      const guest = await createTestGuest(event.id);
      const res = await request(app).delete(`${url()}/${guest.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);
    });
  });

  describe('POST /bulk-import', () => {
    it('creates multiple guests', async () => {
      const guests = [
        { name: 'Frank', phone: '9000000003' },
        { name: 'Grace', phone: '9000000004' },
      ];
      const res = await request(app)
        .post(`${url()}/bulk-import`)
        .send({ guests });
      expect(res.status).toBe(201);
      expect(res.body.data.count).toBe(2);
    });

    it('returns 400 for empty guests array', async () => {
      const res = await request(app)
        .post(`${url()}/bulk-import`)
        .send({ guests: [] });
      expect(res.status).toBe(400);
    });
  });
});

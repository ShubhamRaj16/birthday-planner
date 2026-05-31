const request = require('supertest');
const app = require('../../src/app');
const { createTestChild, createTestEvent, createTestExpense } = require('../../src/test/helpers');

describe('Expenses routes', () => {
  let child, event;

  beforeEach(async () => {
    child = await createTestChild();
    event = await createTestEvent(child.id);
  });

  const url = () => `/api/v1/events/${event.id}/expenses`;

  describe('GET expenses', () => {
    it('returns empty list initially', async () => {
      const res = await request(app).get(url());
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('POST expense', () => {
    it('creates expense and returns 201', async () => {
      const res = await request(app)
        .post(url())
        .send({ label: 'Cake', amount: 5000, category: 'cake' });
      expect(res.status).toBe(201);
      expect(res.body.data.amount).toBe(5000);
    });

    it('returns 400 when label missing', async () => {
      const res = await request(app)
        .post(url())
        .send({ amount: 1000, category: 'cake' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /summary', () => {
    it('returns correct totals', async () => {
      await createTestExpense(event.id, { amount: 1000, paid: true });
      await createTestExpense(event.id, { amount: 2000, paid: false });
      const res = await request(app).get(`${url()}/summary`);
      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(3000);
      expect(res.body.data.paid).toBe(1000);
      expect(res.body.data.unpaid).toBe(2000);
    });

    it('returns 9 categories', async () => {
      const res = await request(app).get(`${url()}/summary`);
      expect(res.body.data.byCategory).toHaveLength(9);
    });
  });

  describe('PUT expense', () => {
    it('marks expense as paid', async () => {
      const exp = await createTestExpense(event.id);
      const res = await request(app)
        .put(`${url()}/${exp.id}`)
        .send({ paid: true });
      expect(res.status).toBe(200);
      expect(res.body.data.paid).toBe(true);
    });
  });

  describe('DELETE expense', () => {
    it('removes expense', async () => {
      const exp = await createTestExpense(event.id);
      const res = await request(app).delete(`${url()}/${exp.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.deleted).toBe(true);
    });
  });
});

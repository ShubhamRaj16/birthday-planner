const { createTestChild, createTestEvent, createTestExpense } = require('../../src/test/helpers');
const {
  listExpenses, getSummary, createExpense, updateExpense, deleteExpense,
} = require('../../src/services/expenseService');

const ALL_CATEGORIES = [
  'venue', 'catering', 'cake', 'decorations', 'return gifts',
  'entertainment', 'photography', 'invites/printing', 'miscellaneous',
];

describe('expenseService', () => {
  let child, event;

  beforeEach(async () => {
    child = await createTestChild();
    event = await createTestEvent(child.id);
  });

  describe('createExpense', () => {
    it('parses amount as float', async () => {
      const exp = await createExpense(event.id, { label: 'Cake', amount: '5000.50', category: 'cake' });
      expect(exp.amount).toBe(5000.50);
    });

    it('defaults category to miscellaneous', async () => {
      const exp = await createExpense(event.id, { label: 'Other', amount: 100 });
      expect(exp.category).toBe('miscellaneous');
    });

    it('defaults paid to false', async () => {
      const exp = await createExpense(event.id, { label: 'Venue', amount: 20000, category: 'venue' });
      expect(exp.paid).toBe(false);
    });
  });

  describe('getSummary', () => {
    it('calculates total correctly', async () => {
      await createTestExpense(event.id, { amount: 1000 });
      await createTestExpense(event.id, { amount: 2000 });
      const summary = await getSummary(event.id);
      expect(summary.total).toBe(3000);
    });

    it('splits paid and unpaid correctly', async () => {
      await createTestExpense(event.id, { amount: 1000, paid: true });
      await createTestExpense(event.id, { amount: 2000, paid: false });
      const summary = await getSummary(event.id);
      expect(summary.paid).toBe(1000);
      expect(summary.unpaid).toBe(2000);
    });

    it('returns all 9 categories in byCategory', async () => {
      const summary = await getSummary(event.id);
      const cats = summary.byCategory.map(c => c.category);
      ALL_CATEGORIES.forEach(cat => expect(cats).toContain(cat));
    });

    it('returns zero amounts for empty categories', async () => {
      await createTestExpense(event.id, { amount: 500, category: 'cake' });
      const summary = await getSummary(event.id);
      const venue = summary.byCategory.find(c => c.category === 'venue');
      expect(venue.amount).toBe(0);
      const cake = summary.byCategory.find(c => c.category === 'cake');
      expect(cake.amount).toBe(500);
    });

    it('returns zeros when no expenses', async () => {
      const summary = await getSummary(event.id);
      expect(summary.total).toBe(0);
      expect(summary.paid).toBe(0);
      expect(summary.unpaid).toBe(0);
    });
  });

  describe('updateExpense', () => {
    it('marks expense as paid', async () => {
      const exp = await createTestExpense(event.id, { paid: false });
      const updated = await updateExpense(exp.id, { paid: true });
      expect(updated.paid).toBe(true);
    });
  });
});

import { createTestChild, createTestEvent } from '../../src/test/helpers';
import { createGift, updateGift, deleteGift, listGifts } from '../../src/services/giftService';


import prisma from '../../src/lib/prisma';

describe('giftService', () => {
  let child, event;

  beforeEach(async () => {
    child = await createTestChild();
    event = await createTestEvent(child.id);
  });

  describe('createGift', () => {
    it('defaults source to manual', async () => {
      const gift = await createGift(event.id, { name: 'Toy' });
      expect(gift.source).toBe('manual');
    });

    it('defaults status to idea', async () => {
      const gift = await createGift(event.id, { name: 'Book' });
      expect(gift.status).toBe('idea');
    });

    it('parses price as float', async () => {
      const gift = await createGift(event.id, { name: 'Game', price: '499.99' });
      expect(gift.price).toBe(499.99);
    });

    it('allows null price', async () => {
      const gift = await createGift(event.id, { name: 'TBD' });
      expect(gift.price).toBeNull();
    });

    it('stores ai source correctly', async () => {
      const gift = await createGift(event.id, { name: 'Lego', source: 'ai' });
      expect(gift.source).toBe('ai');
    });
  });

  describe('updateGift — status transitions', () => {
    it('transitions idea → bought', async () => {
      const gift = await createGift(event.id, { name: 'Train Set' });
      const updated = await updateGift(gift.id, { status: 'bought' });
      expect(updated.status).toBe('bought');
    });

    it('transitions bought → received', async () => {
      const gift = await createGift(event.id, { name: 'Train Set', status: 'bought' });
      const updated = await updateGift(gift.id, { status: 'received' });
      expect(updated.status).toBe('received');
    });
  });

  describe('deleteGift', () => {
    it('removes gift from DB', async () => {
      const gift = await createGift(event.id, { name: 'Puzzle' });
      await deleteGift(gift.id);
      const found = await prisma.gift.findUnique({ where: { id: gift.id } });
      expect(found).toBeNull();
    });
  });
});

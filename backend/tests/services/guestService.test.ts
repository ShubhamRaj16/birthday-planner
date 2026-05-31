import { createTestChild, createTestEvent, createTestGuest } from '../../src/test/helpers';
const {
  listGuests, createGuest, updateGuest, deleteGuest, bulkImportGuests,
} = require('../../src/services/guestService');


import prisma from '../../src/lib/prisma';

describe('guestService', () => {
  let child, event;

  beforeEach(async () => {
    child = await createTestChild();
    event = await createTestEvent(child.id);
  });

  describe('createGuest', () => {
    it('defaults rsvp to Pending', async () => {
      const guest = await createGuest(event.id, { name: 'Alice', phone: '9000000001' });
      expect(guest.rsvp).toBe('Pending');
    });

    it('stores phone correctly', async () => {
      const guest = await createGuest(event.id, { name: 'Bob', phone: '9000000002' });
      expect(guest.phone).toBe('9000000002');
    });
  });

  describe('updateGuest — RSVP', () => {
    it('updates rsvp to Confirmed', async () => {
      const guest = await createTestGuest(event.id);
      const updated = await updateGuest(guest.id, { rsvp: 'Confirmed' });
      expect(updated.rsvp).toBe('Confirmed');
    });

    it('updates rsvp to Declined', async () => {
      const guest = await createTestGuest(event.id);
      const updated = await updateGuest(guest.id, { rsvp: 'Declined' });
      expect(updated.rsvp).toBe('Declined');
    });
  });

  describe('updateGuest — inviteSent', () => {
    it('sets inviteSentAt when inviteSent becomes true', async () => {
      const guest = await createTestGuest(event.id);
      const updated = await updateGuest(guest.id, { inviteSent: true });
      expect(updated.inviteSent).toBe(true);
      expect(updated.inviteSentAt).not.toBeNull();
    });

    it('clears inviteSentAt when inviteSent becomes false', async () => {
      const guest = await createTestGuest(event.id, { inviteSent: true, inviteSentAt: new Date() });
      const updated = await updateGuest(guest.id, { inviteSent: false });
      expect(updated.inviteSent).toBe(false);
      expect(updated.inviteSentAt).toBeNull();
    });
  });

  describe('bulkImportGuests', () => {
    it('creates multiple guests with correct eventId', async () => {
      const guests = [
        { name: 'Charlie', phone: '9000000003', rsvp: 'Pending' },
        { name: 'Diana', phone: '9000000004', rsvp: 'Pending' },
        { name: 'Eve', phone: '9000000005', rsvp: 'Pending' },
      ];
      await bulkImportGuests(event.id, guests);
      const all = await listGuests(event.id);
      expect(all).toHaveLength(3);
      expect(all.every(g => g.eventId === event.id)).toBe(true);
    });
  });

  describe('deleteGuest', () => {
    it('removes guest from DB', async () => {
      const guest = await createTestGuest(event.id);
      await deleteGuest(guest.id);
      const found = await prisma.guest.findUnique({ where: { id: guest.id } });
      expect(found).toBeNull();
    });
  });
});

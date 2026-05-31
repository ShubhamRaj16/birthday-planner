import { createTestChild, createTestEvent, createTestReminder } from '../../src/test/helpers';
import {
  fireDueReminders, getUnreadCount, createReminder,
  markRead, completePassedEvents,
} from '../../src/services/reminderService';


import prisma from '../../src/lib/prisma';

describe('reminderService', () => {
  let child, event;

  beforeEach(async () => {
    child = await createTestChild();
    event = await createTestEvent(child.id);
  });

  describe('fireDueReminders', () => {
    it('fires reminders where triggerAt <= now and fired=false', async () => {
      // Past trigger — should fire
      await createTestReminder(event.id, {
        triggerAt: new Date(Date.now() - 1000),
        fired: false,
      });
      const count = await fireDueReminders();
      expect(count).toBe(1);
    });

    it('does not fire already-fired reminders', async () => {
      await createTestReminder(event.id, {
        triggerAt: new Date(Date.now() - 1000),
        fired: true,
      });
      const count = await fireDueReminders();
      expect(count).toBe(0);
    });

    it('does not fire future reminders', async () => {
      await createTestReminder(event.id, {
        triggerAt: new Date(Date.now() + 60 * 60 * 1000),
        fired: false,
      });
      const count = await fireDueReminders();
      expect(count).toBe(0);
    });
  });

  describe('getUnreadCount', () => {
    it('counts fired reminders that are not read', async () => {
      await createTestReminder(event.id, { triggerAt: new Date(Date.now() - 1000), fired: true });
      await createTestReminder(event.id, { triggerAt: new Date(Date.now() - 1000), fired: true });
      const count = await getUnreadCount();
      expect(count).toBe(2);
    });

    it('excludes type=read reminders from count', async () => {
      const r = await createTestReminder(event.id, { triggerAt: new Date(Date.now() - 1000), fired: true });
      await prisma.reminder.update({ where: { id: r.id }, data: { type: 'read' } });
      const count = await getUnreadCount();
      expect(count).toBe(0);
    });

    it('excludes unfired reminders from count', async () => {
      await createTestReminder(event.id, { triggerAt: new Date(Date.now() + 1000), fired: false });
      const count = await getUnreadCount();
      expect(count).toBe(0);
    });
  });

  describe('markRead', () => {
    it('sets type to read for given ids', async () => {
      const r1 = await createTestReminder(event.id, { fired: true });
      const r2 = await createTestReminder(event.id, { fired: true });
      await markRead([r1.id, r2.id]);
      const updated = await prisma.reminder.findMany({ where: { id: { in: [r1.id, r2.id] } } });
      expect(updated.every(r => r.type === 'read')).toBe(true);
    });
  });

  describe('completePassedEvents', () => {
    it('marks past Active events as Completed', async () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      import { createEvent } from '../../src/services/eventService';
      const pastEvent = await createEvent({ childId: child.id, date: past });
      await prisma.event.update({ where: { id: pastEvent.id }, data: { status: 'Active' } });

      const count = await completePassedEvents();
      expect(count).toBeGreaterThanOrEqual(1);

      const updated = await prisma.event.findUnique({ where: { id: pastEvent.id } });
      expect(updated.status).toBe('Completed');
    });

    it('does not affect future Active events', async () => {
      const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      import { createEvent, activateEvent } from '../../src/services/eventService';
      const futureEvent = await createEvent({ childId: child.id, date: future });
      await activateEvent(futureEvent.id);

      await completePassedEvents();

      const updated = await prisma.event.findUnique({ where: { id: futureEvent.id } });
      expect(updated.status).toBe('Active');
    });
  });
});

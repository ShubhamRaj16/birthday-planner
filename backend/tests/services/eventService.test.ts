import { createTestChild } from '../../src/test/helpers';
const {
  createEvent, getEvent, updateEvent, deleteEvent,
  listEvents, getUpcomingEvents, activateEvent,
} = require('../../src/services/eventService');


import prisma from '../../src/lib/prisma';

const TASK_COUNT = 11; // taskDefaults.js defines 11 tasks

async function makeChild() {
  return createTestChild();
}

function futureDate(daysAhead = 30) {
  return new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();
}

describe('eventService', () => {
  describe('createEvent', () => {
    it(`auto-creates ${TASK_COUNT} default tasks`, async () => {
      const child = await makeChild();
      const event = await createEvent({ childId: child.id, date: futureDate() });
      expect(event.tasks).toHaveLength(TASK_COUNT);
    });

    it('assigns correct relative due dates from event date', async () => {
      const child = await makeChild();
      const eventDate = futureDate(60);
      const event = await createEvent({ childId: child.id, date: eventDate });
      const fixVenueTask = event.tasks.find(t => t.title === 'Fix venue & date');
      expect(fixVenueTask).toBeDefined();
      const diff = Math.round(
        (new Date(fixVenueTask.dueDate) - new Date(eventDate)) / (24 * 60 * 60 * 1000)
      );
      expect(diff).toBe(-60);
    });

    it('stores venue and theme', async () => {
      const child = await makeChild();
      const event = await createEvent({ childId: child.id, date: futureDate(), venue: 'Park', theme: 'Space' });
      expect(event.venue).toBe('Park');
      expect(event.theme).toBe('Space');
    });

    it('defaults status to Draft', async () => {
      const child = await makeChild();
      const event = await createEvent({ childId: child.id, date: futureDate() });
      expect(event.status).toBe('Draft');
    });
  });

  describe('activateEvent', () => {
    it('sets status to Active', async () => {
      const child = await makeChild();
      const event = await createEvent({ childId: child.id, date: futureDate() });
      const activated = await activateEvent(event.id);
      expect(activated.status).toBe('Active');
    });
  });

  describe('updateEvent', () => {
    it('updates venue field', async () => {
      const child = await makeChild();
      const event = await createEvent({ childId: child.id, date: futureDate() });
      const updated = await updateEvent(event.id, { venue: 'New Venue' });
      expect(updated.venue).toBe('New Venue');
    });
  });

  describe('getUpcomingEvents', () => {
    it('excludes Completed events', async () => {
      const child = await makeChild();
      const event = await createEvent({ childId: child.id, date: futureDate() });
      await prisma.event.update({ where: { id: event.id }, data: { status: 'Completed' } });
      const upcoming = await getUpcomingEvents();
      expect(upcoming.find(e => e.id === event.id)).toBeUndefined();
    });

    it('excludes past-dated events', async () => {
      const child = await makeChild();
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const event = await createEvent({ childId: child.id, date: past });
      await prisma.event.update({ where: { id: event.id }, data: { status: 'Active' } });
      const upcoming = await getUpcomingEvents();
      expect(upcoming.find(e => e.id === event.id)).toBeUndefined();
    });
  });

  describe('deleteEvent', () => {
    it('cascade-deletes tasks', async () => {
      const child = await makeChild();
      const event = await createEvent({ childId: child.id, date: futureDate() });
      await deleteEvent(event.id);
      const tasks = await prisma.task.findMany({ where: { eventId: event.id } });
      expect(tasks).toHaveLength(0);
    });
  });
});

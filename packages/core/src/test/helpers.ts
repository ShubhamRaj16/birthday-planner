import { createEvent } from '../services/eventService';
import prisma from '../lib/prisma';
import type { Child, Event, Guest, Expense, Reminder } from '@prisma/client';

export async function createTestChild(overrides: Record<string, unknown> = {}): Promise<Child> {
  return prisma.child.create({
    data: { name: 'Test Child', dob: new Date('2018-06-15'), ...overrides },
  });
}

export async function createTestEvent(
  childId: number,
  overrides: Record<string, unknown> = {},
): Promise<Event> {
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return createEvent({
    childId,
    date: futureDate.toISOString(),
    venue: 'Test Venue',
    theme: 'Test Theme',
    budget: 10000,
    ...overrides,
  });
}

export async function createTestGuest(
  eventId: number,
  overrides: Record<string, unknown> = {},
): Promise<Guest> {
  return prisma.guest.create({
    data: { eventId, name: 'Test Guest', phone: '9876543210', rsvp: 'Pending', ...overrides },
  });
}

export async function createTestExpense(
  eventId: number,
  overrides: Record<string, unknown> = {},
): Promise<Expense> {
  return prisma.expense.create({
    data: { eventId, label: 'Test Expense', amount: 1000, category: 'miscellaneous', paid: false, ...overrides },
  });
}

export async function createTestReminder(
  eventId: number,
  overrides: Record<string, unknown> = {},
): Promise<Reminder> {
  return prisma.reminder.create({
    data: {
      eventId,
      triggerAt: new Date(Date.now() + 60 * 60 * 1000),
      label: 'Test Reminder',
      type: 'general',
      ...overrides,
    },
  });
}

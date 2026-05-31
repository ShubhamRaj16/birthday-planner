const { createEvent } = require('../services/eventService');
const prisma = require('../lib/prisma');

async function createTestChild(overrides = {}) {
  return prisma.child.create({
    data: {
      name: 'Test Child',
      dob: new Date('2018-06-15'),
      ...overrides,
    },
  });
}

async function createTestEvent(childId, overrides = {}) {
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

async function createTestGuest(eventId, overrides = {}) {
  return prisma.guest.create({
    data: {
      eventId,
      name: 'Test Guest',
      phone: '9876543210',
      rsvp: 'Pending',
      ...overrides,
    },
  });
}

async function createTestExpense(eventId, overrides = {}) {
  return prisma.expense.create({
    data: {
      eventId,
      label: 'Test Expense',
      amount: 1000,
      category: 'miscellaneous',
      paid: false,
      ...overrides,
    },
  });
}

async function createTestReminder(eventId, overrides = {}) {
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

module.exports = {
  createTestChild,
  createTestEvent,
  createTestGuest,
  createTestExpense,
  createTestReminder,
};

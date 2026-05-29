const prisma = require('../lib/prisma');
const TASK_DEFAULTS = require('../lib/taskDefaults');
const dayjs = require('dayjs');

async function listEvents() {
  return prisma.event.findMany({
    include: { tasks: true, child: true },
    orderBy: { date: 'asc' },
  });
}

async function getEvent(id) {
  return prisma.event.findUnique({
    where: { id },
    include: { tasks: true, child: true, reminders: true },
  });
}

async function createEvent(data) {
  const eventDate = dayjs(data.date);

  return prisma.event.create({
    data: {
      childId: data.childId,
      date: new Date(data.date),
      venue: data.venue,
      address: data.address,
      theme: data.theme,
      budget: data.budget ? parseFloat(data.budget) : null,
      myGateLink: data.myGateLink,
      messageTemplate: data.messageTemplate,
      notes: data.notes,
      tasks: {
        create: TASK_DEFAULTS.map((t) => ({
          title: t.title,
          category: t.category,
          dueDate: eventDate.add(t.daysOffset, 'day').toDate(),
        })),
      },
    },
    include: { tasks: true },
  });
}

async function updateEvent(id, data) {
  return prisma.event.update({
    where: { id },
    data: {
      ...(data.date && { date: new Date(data.date) }),
      ...(data.venue !== undefined && { venue: data.venue }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.theme !== undefined && { theme: data.theme }),
      ...(data.budget !== undefined && { budget: data.budget ? parseFloat(data.budget) : null }),
      ...(data.myGateLink !== undefined && { myGateLink: data.myGateLink }),
      ...(data.cardPath !== undefined && { cardPath: data.cardPath }),
      ...(data.messageTemplate !== undefined && { messageTemplate: data.messageTemplate }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: { tasks: true },
  });
}

async function deleteEvent(id) {
  return prisma.event.delete({ where: { id } });
}

async function getUpcomingEvents() {
  return prisma.event.findMany({
    where: {
      date: { gte: new Date() },
      status: { not: 'Completed' },
    },
    include: { tasks: true, child: true },
    orderBy: { date: 'asc' },
  });
}

async function activateEvent(id) {
  return prisma.event.update({
    where: { id },
    data: { status: 'Active' },
  });
}

module.exports = { listEvents, getEvent, createEvent, updateEvent, deleteEvent, getUpcomingEvents, activateEvent };

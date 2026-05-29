const prisma = require('../lib/prisma');

async function listReminders(eventId) {
  const where = eventId ? { eventId: Number(eventId) } : {};
  return prisma.reminder.findMany({ where, orderBy: { triggerAt: 'asc' } });
}

async function getUnreadCount() {
  return prisma.reminder.count({ where: { fired: true, type: { not: 'read' } } });
}

async function createReminder(data) {
  return prisma.reminder.create({
    data: {
      eventId: data.eventId,
      triggerAt: new Date(data.triggerAt),
      label: data.label,
      type: data.type || 'general',
    },
  });
}

async function updateReminder(id, data) {
  return prisma.reminder.update({
    where: { id },
    data: {
      ...(data.triggerAt && { triggerAt: new Date(data.triggerAt) }),
      ...(data.label !== undefined && { label: data.label }),
      ...(data.fired !== undefined && { fired: data.fired }),
    },
  });
}

async function deleteReminder(id) {
  return prisma.reminder.delete({ where: { id } });
}

async function markRead(ids) {
  return prisma.reminder.updateMany({
    where: { id: { in: ids } },
    data: { type: 'read' },
  });
}

async function fireDueReminders() {
  const result = await prisma.reminder.updateMany({
    where: { triggerAt: { lte: new Date() }, fired: false },
    data: { fired: true },
  });
  return result.count;
}

async function completePassedEvents() {
  const result = await prisma.event.updateMany({
    where: { date: { lt: new Date() }, status: 'Active' },
    data: { status: 'Completed' },
  });
  return result.count;
}

module.exports = {
  listReminders, getUnreadCount, createReminder, updateReminder,
  deleteReminder, markRead, fireDueReminders, completePassedEvents,
};

import prisma from '../lib/prisma';
import type { Reminder } from '@prisma/client';
import type { CreateReminderInput, UpdateReminderInput } from '../types';

export async function listReminders(eventId?: number | null): Promise<Reminder[]> {
  const where = eventId ? { eventId } : {};
  return prisma.reminder.findMany({ where, orderBy: { triggerAt: 'asc' } });
}

export async function getUnreadCount(): Promise<number> {
  return prisma.reminder.count({ where: { fired: true, type: { not: 'read' } } });
}

export async function createReminder(data: CreateReminderInput): Promise<Reminder> {
  return prisma.reminder.create({
    data: {
      eventId: data.eventId ?? null,
      triggerAt: new Date(data.triggerAt),
      label: data.label,
      type: data.type ?? 'general',
    },
  });
}

export async function updateReminder(id: number, data: UpdateReminderInput): Promise<Reminder> {
  return prisma.reminder.update({
    where: { id },
    data: {
      ...(data.triggerAt && { triggerAt: new Date(data.triggerAt) }),
      ...(data.label !== undefined && { label: data.label }),
      ...(data.fired !== undefined && { fired: data.fired }),
    },
  });
}

export async function deleteReminder(id: number): Promise<Reminder> {
  return prisma.reminder.delete({ where: { id } });
}

export async function markRead(ids: number[]): Promise<{ count: number }> {
  return prisma.reminder.updateMany({
    where: { id: { in: ids } },
    data: { type: 'read' },
  });
}

export async function fireDueReminders(): Promise<number> {
  const result = await prisma.reminder.updateMany({
    where: { triggerAt: { lte: new Date() }, fired: false },
    data: { fired: true },
  });
  return result.count;
}

export async function completePassedEvents(): Promise<number> {
  const result = await prisma.event.updateMany({
    where: { date: { lt: new Date() }, status: 'Active' },
    data: { status: 'Completed' },
  });
  return result.count;
}

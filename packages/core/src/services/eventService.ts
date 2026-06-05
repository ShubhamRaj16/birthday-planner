import prisma from '../lib/prisma';
import TASK_DEFAULTS from '../lib/taskDefaults';
import dayjs from 'dayjs';
import type { Event } from '@prisma/client';
import type { CreateEventInput, UpdateEventInput } from '../types';

export async function listEvents(): Promise<Event[]> {
  return prisma.event.findMany({
    include: { tasks: true, child: true },
    orderBy: { date: 'asc' },
  }) as unknown as Event[];
}

export async function getEvent(id: number): Promise<Event | null> {
  return prisma.event.findUnique({
    where: { id },
    include: { tasks: true, child: true, reminders: true },
  }) as unknown as Event | null;
}

export async function createEvent(data: CreateEventInput): Promise<Event> {
  const eventDate = dayjs(data.date);
  return prisma.event.create({
    data: {
      childId: data.childId,
      date: new Date(data.date),
      venue: data.venue,
      address: data.address,
      theme: data.theme,
      budget: data.budget ? parseFloat(String(data.budget)) : null,
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
  }) as unknown as Event;
}

export async function updateEvent(id: number, data: UpdateEventInput): Promise<Event> {
  return prisma.event.update({
    where: { id },
    data: {
      ...(data.date && { date: new Date(data.date) }),
      ...(data.venue !== undefined && { venue: data.venue }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.theme !== undefined && { theme: data.theme }),
      ...(data.budget !== undefined && { budget: data.budget ? parseFloat(String(data.budget)) : null }),
      ...(data.myGateLink !== undefined && { myGateLink: data.myGateLink }),
      ...(data.cardPath !== undefined && { cardPath: data.cardPath }),
      ...(data.messageTemplate !== undefined && { messageTemplate: data.messageTemplate }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.googlePhotosUrl !== undefined && { googlePhotosUrl: data.googlePhotosUrl }),
    },
    include: { tasks: true },
  }) as unknown as Event;
}

export async function deleteEvent(id: number): Promise<Event> {
  return prisma.event.delete({ where: { id } });
}

export async function getUpcomingEvents(): Promise<Event[]> {
  return prisma.event.findMany({
    where: { date: { gte: new Date() }, status: { not: 'Completed' } },
    include: { tasks: true, child: true },
    orderBy: { date: 'asc' },
  }) as unknown as Event[];
}

export async function activateEvent(id: number): Promise<Event> {
  return prisma.event.update({ where: { id }, data: { status: 'Active' } });
}

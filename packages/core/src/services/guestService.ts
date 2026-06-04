import prisma from '../lib/prisma';
import type { Guest } from '@prisma/client';
import type { CreateGuestInput, UpdateGuestInput } from '../types';

export async function listGuests(eventId: number): Promise<Guest[]> {
  return prisma.guest.findMany({ where: { eventId }, orderBy: { name: 'asc' } });
}

export async function createGuest(eventId: number, data: CreateGuestInput): Promise<Guest> {
  return prisma.guest.create({
    data: {
      eventId,
      name: data.name,
      phone: data.phone,
      ageGroup: data.ageGroup,
      dietary: data.dietary,
      rsvp: data.rsvp ?? 'Pending',
      notes: data.notes,
    },
  });
}

export async function updateGuest(id: number, data: UpdateGuestInput): Promise<Guest> {
  return prisma.guest.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.ageGroup !== undefined && { ageGroup: data.ageGroup }),
      ...(data.dietary !== undefined && { dietary: data.dietary }),
      ...(data.rsvp !== undefined && { rsvp: data.rsvp }),
      ...(data.inviteSent !== undefined && {
        inviteSent: Boolean(data.inviteSent),
        inviteSentAt: data.inviteSent ? new Date() : null,
      }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });
}

export async function deleteGuest(id: number): Promise<Guest> {
  return prisma.guest.delete({ where: { id } });
}

export async function bulkImportGuests(
  eventId: number,
  guests: Omit<CreateGuestInput, 'eventId'>[],
): Promise<{ count: number }> {
  return prisma.guest.createMany({
    data: guests.map((g) => ({ ...g, eventId })),
  });
}

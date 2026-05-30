const prisma = require('../lib/prisma');

async function listGuests(eventId) {
  return prisma.guest.findMany({ where: { eventId }, orderBy: { name: 'asc' } });
}

async function createGuest(eventId, data) {
  return prisma.guest.create({
    data: {
      eventId,
      name: data.name,
      phone: data.phone,
      ageGroup: data.ageGroup,
      dietary: data.dietary,
      rsvp: data.rsvp || 'Pending',
      notes: data.notes,
    },
  });
}

async function updateGuest(id, data) {
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

async function deleteGuest(id) {
  return prisma.guest.delete({ where: { id } });
}

async function bulkImportGuests(eventId, guests) {
  // SQLite doesn't support skipDuplicates in createMany
  return prisma.guest.createMany({
    data: guests.map((g) => ({ ...g, eventId })),
  });
}

module.exports = { listGuests, createGuest, updateGuest, deleteGuest, bulkImportGuests };

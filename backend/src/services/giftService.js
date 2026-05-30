const prisma = require('../lib/prisma');

async function listGifts(eventId) {
  return prisma.gift.findMany({ where: { eventId }, orderBy: { createdAt: 'desc' } });
}

async function createGift(eventId, data) {
  return prisma.gift.create({
    data: {
      eventId,
      name: data.name,
      description: data.description,
      price: data.price ? parseFloat(data.price) : null,
      source: data.source || 'manual',
      status: data.status || 'idea',
      givenBy: data.givenBy,
      notes: data.notes,
    },
  });
}

async function updateGift(id, data) {
  return prisma.gift.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price ? parseFloat(data.price) : null }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.givenBy !== undefined && { givenBy: data.givenBy }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });
}

async function deleteGift(id) {
  return prisma.gift.delete({ where: { id } });
}

module.exports = { listGifts, createGift, updateGift, deleteGift };

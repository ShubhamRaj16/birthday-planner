const prisma = require('../lib/prisma');

async function listPhotos(eventId) {
  return prisma.photo.findMany({
    where: { eventId },
    orderBy: { createdAt: 'asc' },
  });
}

async function addPhoto(eventId, storagePath, caption) {
  return prisma.photo.create({
    data: { eventId, storagePath, caption: caption || null },
  });
}

async function updatePhoto(id, data) {
  return prisma.photo.update({
    where: { id },
    data: {
      ...(data.caption !== undefined && { caption: data.caption }),
      ...(data.isCover !== undefined && { isCover: data.isCover }),
    },
  });
}

async function setCover(eventId, photoId) {
  // Atomic: clear all covers then set the new one in a single transaction
  const [, photo] = await prisma.$transaction([
    prisma.photo.updateMany({ where: { eventId }, data: { isCover: false } }),
    prisma.photo.update({ where: { id: photoId }, data: { isCover: true } }),
  ]);
  return photo;
}

async function deletePhoto(id) {
  return prisma.photo.delete({ where: { id } });
}

module.exports = { listPhotos, addPhoto, updatePhoto, setCover, deletePhoto };

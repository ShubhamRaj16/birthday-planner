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
  // Clear existing cover, then set new one
  await prisma.photo.updateMany({ where: { eventId }, data: { isCover: false } });
  return prisma.photo.update({ where: { id: photoId }, data: { isCover: true } });
}

async function deletePhoto(id) {
  return prisma.photo.delete({ where: { id } });
}

module.exports = { listPhotos, addPhoto, updatePhoto, setCover, deletePhoto };

const prisma = require('../lib/prisma');

async function listChildren() {
  return prisma.child.findMany({ orderBy: { name: 'asc' } });
}

async function getChild(id) {
  return prisma.child.findUnique({ where: { id }, include: { events: true } });
}

async function createChild(data) {
  return prisma.child.create({
    data: {
      name: data.name,
      dob: new Date(data.dob),
      interests: data.interests,
      allergies: data.allergies,
      school: data.school,
    },
  });
}

async function updateChild(id, data) {
  return prisma.child.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.dob && { dob: new Date(data.dob) }),
      ...(data.interests !== undefined && { interests: data.interests }),
      ...(data.allergies !== undefined && { allergies: data.allergies }),
      ...(data.school !== undefined && { school: data.school }),
    },
  });
}

async function deleteChild(id) {
  return prisma.child.delete({ where: { id } });
}

async function updateAvatar(id, photoPath) {
  return prisma.child.update({ where: { id }, data: { photo: photoPath } });
}

module.exports = { listChildren, getChild, createChild, updateChild, deleteChild, updateAvatar };

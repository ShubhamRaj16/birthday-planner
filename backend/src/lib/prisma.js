const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

prisma.$connect().then(() => {
  return prisma.$executeRawUnsafe('PRAGMA journal_mode=WAL;');
});

module.exports = prisma;

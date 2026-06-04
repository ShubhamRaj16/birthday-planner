import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

void prisma.$connect().then(() => {
  return prisma.$queryRawUnsafe('PRAGMA journal_mode=WAL;');
});

export default prisma;

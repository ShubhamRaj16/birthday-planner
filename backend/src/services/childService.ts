import prisma from '../lib/prisma';
import type { Child } from '@prisma/client';
import type { CreateChildInput, UpdateChildInput } from '../types';

export async function listChildren(): Promise<Child[]> {
  return prisma.child.findMany({
    orderBy: { name: 'asc' },
    include: {
      events: {
        orderBy: { date: 'asc' },
        select: {
          id: true,
          date: true,
          theme: true,
          status: true,
          googlePhotosUrl: true,
          photos: {
            where: { isCover: true },
            select: { storagePath: true },
            take: 1,
          },
        },
      },
    },
  }) as unknown as Child[];
}

export async function getChild(id: number): Promise<Child | null> {
  return prisma.child.findUnique({ where: { id }, include: { events: true } });
}

export async function createChild(data: CreateChildInput): Promise<Child> {
  return prisma.child.create({
    data: {
      name: data.name,
      dob: new Date(data.dob),
      interests: data.interests,
      allergies: data.allergies,
      school: data.school,
      ...(data.photo && { photo: data.photo }),
    },
  });
}

export async function updateChild(id: number, data: UpdateChildInput): Promise<Child> {
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

export async function deleteChild(id: number): Promise<Child> {
  return prisma.child.delete({ where: { id } });
}

export async function updateAvatar(id: number, photoPath: string): Promise<Child> {
  return prisma.child.update({ where: { id }, data: { photo: photoPath } });
}

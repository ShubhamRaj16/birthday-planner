import prisma from '../lib/prisma';
import type { Photo } from '@prisma/client';

interface UpdatePhotoInput {
  caption?: string | null;
  isCover?: boolean;
}

export async function listPhotos(eventId: number): Promise<Photo[]> {
  return prisma.photo.findMany({ where: { eventId }, orderBy: { createdAt: 'asc' } });
}

export async function addPhoto(
  eventId: number,
  storagePath: string,
  caption?: string,
): Promise<Photo> {
  return prisma.photo.create({
    data: { eventId, storagePath, caption: caption ?? null },
  });
}

export async function updatePhoto(id: number, data: UpdatePhotoInput): Promise<Photo> {
  return prisma.photo.update({
    where: { id },
    data: {
      ...(data.caption !== undefined && { caption: data.caption }),
      ...(data.isCover !== undefined && { isCover: data.isCover }),
    },
  });
}

export async function setCover(eventId: number, photoId: number): Promise<Photo> {
  const [, photo] = await prisma.$transaction([
    prisma.photo.updateMany({ where: { eventId }, data: { isCover: false } }),
    prisma.photo.update({ where: { id: photoId }, data: { isCover: true } }),
  ]);
  return photo;
}

export async function deletePhoto(id: number): Promise<Photo> {
  return prisma.photo.delete({ where: { id } });
}

import prisma from '../lib/prisma';
import type { Gift } from '@prisma/client';
import type { CreateGiftInput, UpdateGiftInput } from '../types';

const VALID_STATUSES = ['idea', 'bought', 'received'] as const;
type GiftStatus = (typeof VALID_STATUSES)[number];

export function isValidGiftStatus(status: unknown): status is GiftStatus {
  return VALID_STATUSES.includes(status as GiftStatus);
}

export async function listGifts(eventId: number): Promise<Gift[]> {
  return prisma.gift.findMany({ where: { eventId }, orderBy: { createdAt: 'desc' } });
}

export async function createGift(eventId: number, data: CreateGiftInput): Promise<Gift> {
  if (data.status && !isValidGiftStatus(data.status)) {
    throw Object.assign(
      new Error(`Invalid status: ${data.status}. Must be idea, bought, or received`),
      { status: 400, code: 'VALIDATION' },
    );
  }
  return prisma.gift.create({
    data: {
      eventId,
      name: data.name,
      description: data.description,
      price: data.price ? parseFloat(String(data.price)) : null,
      source: data.source ?? 'manual',
      status: data.status ?? 'idea',
      givenBy: data.givenBy,
      notes: data.notes,
    },
  });
}

export async function updateGift(id: number, data: UpdateGiftInput): Promise<Gift> {
  if (data.status && !isValidGiftStatus(data.status)) {
    throw Object.assign(
      new Error(`Invalid status: ${data.status}. Must be idea, bought, or received`),
      { status: 400, code: 'VALIDATION' },
    );
  }
  return prisma.gift.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.price !== undefined && { price: data.price ? parseFloat(String(data.price)) : null }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.givenBy !== undefined && { givenBy: data.givenBy }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });
}

export async function deleteGift(id: number): Promise<Gift> {
  return prisma.gift.delete({ where: { id } });
}

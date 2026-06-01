import { buildWaLink } from '../lib/waLink';
import prisma from '../lib/prisma';
import dayjs from 'dayjs';
import type { Child, Event, Guest } from '@prisma/client';
import type { MessageContext, WaLinkResult } from '../types';

const DEFAULT_TEMPLATE = `Hi {guestName}! 🎉

You're invited to {childName}'s birthday party!

📅 Date: {date}
📍 Venue: {venue}{address}
🎨 Theme: {theme}

{myGateLink}
{mapsLink}

Please RSVP and let us know if you can make it. We'd love to see you there! 🎂`;

export function buildMessage(
  template: string,
  { guestName, event, child }: MessageContext,
): string {
  const mapsLink = event.address
    ? `📍 Maps: https://maps.google.com/?q=${encodeURIComponent(event.address)}`
    : '';
  const myGateLink = event.myGateLink
    ? `🏠 MyGate pre-approval: ${event.myGateLink}`
    : '';

  return template
    .replace('{guestName}', guestName ?? 'Friend')
    .replace('{childName}', child?.name ?? 'the birthday child')
    .replace('{date}', event.date ? dayjs(event.date).format('dddd, MMMM D, YYYY') : 'TBD')
    .replace('{venue}', event.venue ?? 'TBD')
    .replace('{address}', event.address ? `, ${event.address}` : '')
    .replace('{theme}', event.theme ?? '')
    .replace('{myGateLink}', myGateLink)
    .replace('{mapsLink}', mapsLink)
    .trim()
    .replace(/\n{3,}/g, '\n\n');
}

type EventWithChild = Event & { child: Child | null };

export async function getWaLink(eventId: number, guestId: number): Promise<WaLinkResult> {
  const [event, guest] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId }, include: { child: true } }) as Promise<EventWithChild | null>,
    prisma.guest.findUnique({ where: { id: guestId } }),
  ]);

  if (!event) throw Object.assign(new Error('Event not found'), { status: 404, code: 'NOT_FOUND' });
  if (!guest) throw Object.assign(new Error('Guest not found'), { status: 404, code: 'NOT_FOUND' });
  if (!guest.phone) throw Object.assign(new Error('Guest has no phone number'), { status: 400, code: 'VALIDATION' });

  const template = event.messageTemplate ?? DEFAULT_TEMPLATE;
  const message = buildMessage(template, { guestName: guest.name, event, child: event.child });
  const link = buildWaLink(guest.phone, message);

  if (!link) throw Object.assign(new Error('Invalid phone number'), { status: 400, code: 'VALIDATION' });

  return { link, message, guest, event };
}

export function getDefaultTemplate(): string {
  return DEFAULT_TEMPLATE;
}

export function previewMessage(
  template: string,
  event: Partial<Event>,
  child: Partial<Child> | null,
  sampleName = 'Guest',
): string {
  return buildMessage(template, { guestName: sampleName, event, child });
}

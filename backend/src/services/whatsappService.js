const { buildWaLink } = require('../lib/waLink');
const prisma = require('../lib/prisma');
const dayjs = require('dayjs');

const DEFAULT_TEMPLATE = `Hi {guestName}! 🎉

You're invited to {childName}'s birthday party!

📅 Date: {date}
📍 Venue: {venue}{address}
🎨 Theme: {theme}

{myGateLink}
{mapsLink}

Please RSVP and let us know if you can make it. We'd love to see you there! 🎂`;

function buildMessage(template, { guestName, event, child }) {
  const mapsLink = event.address
    ? `📍 Maps: https://maps.google.com/?q=${encodeURIComponent(event.address)}`
    : '';
  const myGateLink = event.myGateLink
    ? `🏠 MyGate pre-approval: ${event.myGateLink}`
    : '';

  return template
    .replace('{guestName}', guestName || 'Friend')
    .replace('{childName}', child?.name || 'the birthday child')
    .replace('{date}', event.date ? dayjs(event.date).format('dddd, MMMM D, YYYY') : 'TBD')
    .replace('{venue}', event.venue || 'TBD')
    .replace('{address}', event.address ? `, ${event.address}` : '')
    .replace('{theme}', event.theme || '')
    .replace('{myGateLink}', myGateLink)
    .replace('{mapsLink}', mapsLink)
    .trim()
    .replace(/\n{3,}/g, '\n\n'); // collapse multiple blank lines
}

async function getWaLink(eventId, guestId) {
  const [event, guest] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId }, include: { child: true } }),
    prisma.guest.findUnique({ where: { id: guestId } }),
  ]);

  if (!event) throw Object.assign(new Error('Event not found'), { status: 404, code: 'NOT_FOUND' });
  if (!guest) throw Object.assign(new Error('Guest not found'), { status: 404, code: 'NOT_FOUND' });
  if (!guest.phone) throw Object.assign(new Error('Guest has no phone number'), { status: 400, code: 'VALIDATION' });

  const template = event.messageTemplate || DEFAULT_TEMPLATE;
  const message = buildMessage(template, { guestName: guest.name, event, child: event.child });
  const link = buildWaLink(guest.phone, message);

  if (!link) throw Object.assign(new Error('Invalid phone number'), { status: 400, code: 'VALIDATION' });

  return { link, message, guest, event };
}

function getDefaultTemplate() {
  return DEFAULT_TEMPLATE;
}

function previewMessage(template, event, child, sampleName = 'Guest') {
  return buildMessage(template, { guestName: sampleName, event, child });
}

module.exports = { getWaLink, getDefaultTemplate, previewMessage, buildMessage };

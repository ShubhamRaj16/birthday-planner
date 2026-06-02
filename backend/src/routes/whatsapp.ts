import { Router } from 'express';
import * as svc from '../services/whatsappService';
import prisma from '../lib/prisma';
import { asyncHandler } from '../http/asyncHandler';
import { sendOk, sendErr } from '../http/respond';

// SOLID PLAN (SRP): this route reaches into prisma directly (mark-sent side effect,
// event lookup) instead of delegating to whatsappService. Push that into the
// service in a later phase; Phase 1 only normalizes the envelope/try-catch.
const router = Router();

// POST /api/v1/whatsapp/link — returns wa.me link for a specific guest
router.post('/link', asyncHandler(async (req, res) => {
  const { eventId, guestId } = req.body;
  if (!eventId || !guestId) return sendErr(res, 400, 'VALIDATION', 'eventId and guestId required');
  const result = await svc.getWaLink(Number(eventId), Number(guestId));
  // Mark invite sent
  await prisma.guest.update({
    where: { id: Number(guestId) },
    data: { inviteSent: true, inviteSentAt: new Date() },
  });
  sendOk(res, result);
}));

// POST /api/v1/whatsapp/preview — preview message without marking sent
router.post('/preview', asyncHandler(async (req, res) => {
  const { eventId, template, sampleName } = req.body;
  if (!eventId) return sendErr(res, 400, 'VALIDATION', 'eventId required');
  const event = await prisma.event.findUnique({ where: { id: Number(eventId) }, include: { child: true } });
  if (!event) return sendErr(res, 404, 'NOT_FOUND', 'Event not found');
  const t = template || event.messageTemplate || svc.getDefaultTemplate();
  const message = svc.previewMessage(t, event, event.child, sampleName || 'Guest');
  sendOk(res, { message, template: t });
}));

// GET /api/v1/whatsapp/default-template
router.get('/default-template', asyncHandler(async (_req, res) => {
  sendOk(res, { template: svc.getDefaultTemplate() });
}));

export default router;

const express = require('express');
const router = express.Router();
const svc = require('../services/whatsappService');
const prisma = require('../lib/prisma');

// POST /api/v1/whatsapp/link — returns wa.me link for a specific guest
router.post('/link', async (req, res, next) => {
  try {
    const { eventId, guestId } = req.body;
    if (!eventId || !guestId) {
      return res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'eventId and guestId required' }, meta: {} });
    }
    const result = await svc.getWaLink(Number(eventId), Number(guestId));
    // Mark invite sent
    await prisma.guest.update({
      where: { id: Number(guestId) },
      data: { inviteSent: true, inviteSentAt: new Date() },
    });
    res.json({ data: result, error: null, meta: {} });
  } catch (e) { next(e); }
});

// POST /api/v1/whatsapp/preview — preview message without marking sent
router.post('/preview', async (req, res, next) => {
  try {
    const { eventId, template, sampleName } = req.body;
    if (!eventId) return res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'eventId required' }, meta: {} });
    const event = await prisma.event.findUnique({ where: { id: Number(eventId) }, include: { child: true } });
    if (!event) return res.status(404).json({ data: null, error: { code: 'NOT_FOUND', message: 'Event not found' }, meta: {} });
    const t = template || event.messageTemplate || svc.getDefaultTemplate();
    const message = svc.previewMessage(t, event, event.child, sampleName || 'Guest');
    res.json({ data: { message, template: t }, error: null, meta: {} });
  } catch (e) { next(e); }
});

// GET /api/v1/whatsapp/default-template
router.get('/default-template', (req, res) => {
  res.json({ data: { template: svc.getDefaultTemplate() }, error: null, meta: {} });
});

module.exports = router;

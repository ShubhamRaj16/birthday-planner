import { Router, type Request, type Response, type NextFunction } from 'express';
import * as svc from '../services/whatsappService';
import prisma from '../lib/prisma';

const router = Router();

// POST /api/v1/whatsapp/link — returns wa.me link for a specific guest
router.post('/link', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, guestId } = req.body;
    if (!eventId || !guestId) {
      res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'eventId and guestId required' }, meta: {} });
      return;
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
router.post('/preview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, template, sampleName } = req.body;
    if (!eventId) {
      res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'eventId required' }, meta: {} });
      return;
    }
    const event = await prisma.event.findUnique({ where: { id: Number(eventId) }, include: { child: true } });
    if (!event) {
      res.status(404).json({ data: null, error: { code: 'NOT_FOUND', message: 'Event not found' }, meta: {} });
      return;
    }
    const t = template || event.messageTemplate || svc.getDefaultTemplate();
    const message = svc.previewMessage(t, event, event.child, sampleName || 'Guest');
    res.json({ data: { message, template: t }, error: null, meta: {} });
  } catch (e) { next(e); }
});

// GET /api/v1/whatsapp/default-template
router.get('/default-template', (_req: Request, res: Response) => {
  res.json({ data: { template: svc.getDefaultTemplate() }, error: null, meta: {} });
});

export default router;

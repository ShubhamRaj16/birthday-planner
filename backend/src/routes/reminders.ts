import { Router, type Request, type Response, type NextFunction } from 'express';
import * as svc from '../services/reminderService';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = req.query.eventId ? Number(req.query.eventId) : undefined;
    const data = await svc.listReminders(eventId);
    res.json({ data, error: null, meta: { count: data.length } });
  } catch (e) { next(e); }
});

router.get('/unread-count', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await svc.getUnreadCount();
    res.json({ data: { count }, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // SCRUM-43: eventId optional — standalone reminders allowed
    const { triggerAt, label } = req.body;
    if (!triggerAt || !label) {
      res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'triggerAt and label are required' }, meta: {} });
      return;
    }
    const data = await svc.createReminder(req.body);
    res.status(201).json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.updateReminder(Number(req.params.id), req.body);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await svc.deleteReminder(Number(req.params.id));
    res.json({ data: { deleted: true }, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.post('/mark-read', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body;
    await svc.markRead(ids);
    res.json({ data: { marked: true }, error: null, meta: {} });
  } catch (e) { next(e); }
});

export default router;

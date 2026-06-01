import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import * as svc from '../services/eventService';
import type { MulterRequest } from '../types';

const router = Router();

const inviteCardStorage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads/invite-cards'),
  filename: (req, file, cb) => {
    cb(null, `invite-${req.params.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const inviteUpload = multer({ storage: inviteCardStorage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.listEvents();
    res.json({ data, error: null, meta: { count: data.length } });
  } catch (e) { next(e); }
});

router.get('/upcoming', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.getUpcomingEvents();
    res.json({ data, error: null, meta: { count: data.length } });
  } catch (e) { next(e); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.getEvent(Number(req.params.id));
    if (!data) {
      res.status(404).json({ data: null, error: { code: 'NOT_FOUND', message: 'Event not found' }, meta: {} });
      return;
    }
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { childId, date } = req.body;
    if (!childId || !date) {
      res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'childId and date are required' }, meta: {} });
      return;
    }
    const data = await svc.createEvent(req.body);
    res.status(201).json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.updateEvent(Number(req.params.id), req.body);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await svc.deleteEvent(Number(req.params.id));
    res.json({ data: { deleted: true }, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.post('/:id/activate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.activateEvent(Number(req.params.id));
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.post('/:id/invite-card', inviteUpload.single('card'), async (req: MulterRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'card file required' }, meta: {} });
      return;
    }
    const cardPath = `/uploads/invite-cards/${req.file.filename}`;
    const data = await svc.updateEvent(Number(req.params.id), { cardPath });
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

export default router;

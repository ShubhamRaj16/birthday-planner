import { Router, type Request, type Response, type NextFunction } from 'express';
import * as svc from '../services/guestService';

const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.listGuests(Number(req.params.eventId));
    res.json({ data, error: null, meta: { count: data.length } });
  } catch (e) { next(e); }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'name is required' }, meta: {} });
      return;
    }
    const data = await svc.createGuest(Number(req.params.eventId), req.body);
    res.status(201).json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.updateGuest(Number(req.params.id), req.body);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await svc.deleteGuest(Number(req.params.id));
    res.json({ data: { deleted: true }, error: null, meta: {} });
  } catch (e) { next(e); }
});

// POST /bulk-import — body: { guests: [{ name, phone, ageGroup, dietary }] }
router.post('/bulk-import', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guests } = req.body;
    if (!Array.isArray(guests) || guests.length === 0) {
      res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'guests array required' }, meta: {} });
      return;
    }
    const data = await svc.bulkImportGuests(Number(req.params.eventId), guests);
    res.status(201).json({ data, error: null, meta: { count: data.count } });
  } catch (e) { next(e); }
});

export default router;

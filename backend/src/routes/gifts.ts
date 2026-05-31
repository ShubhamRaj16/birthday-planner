import { Router, type Request, type Response, type NextFunction } from 'express';
import * as svc from '../services/giftService';

const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.listGifts(Number(req.params.eventId));
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
    const data = await svc.createGift(Number(req.params.eventId), req.body);
    res.status(201).json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.updateGift(Number(req.params.id), req.body);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await svc.deleteGift(Number(req.params.id));
    res.json({ data: { deleted: true }, error: null, meta: {} });
  } catch (e) { next(e); }
});

export default router;

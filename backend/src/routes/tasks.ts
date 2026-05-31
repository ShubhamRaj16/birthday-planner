import { Router, type Request, type Response, type NextFunction } from 'express';
import * as svc from '../services/taskService';

const router = Router();

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.updateTask(Number(req.params.id), req.body);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

export default router;

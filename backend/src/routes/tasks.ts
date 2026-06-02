import { Router } from 'express';
import * as svc from '../services/taskService';
import { asyncHandler } from '../http/asyncHandler';
import { sendOk } from '../http/respond';

const router = Router();

router.put('/:id', asyncHandler(async (req, res) => {
  const data = await svc.updateTask(Number(req.params.id), req.body);
  sendOk(res, data);
}));

export default router;

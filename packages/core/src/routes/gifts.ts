import { Router } from 'express';
import * as svc from '../services/giftService';
import { asyncHandler } from '../http/asyncHandler';
import { sendOk, sendErr } from '../http/respond';

const router = Router({ mergeParams: true });

router.get('/', asyncHandler(async (req, res) => {
  const data = await svc.listGifts(Number(req.params.eventId));
  sendOk(res, data, { count: data.length });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) return sendErr(res, 400, 'VALIDATION', 'name is required');
  const data = await svc.createGift(Number(req.params.eventId), req.body);
  sendOk(res, data, {}, 201);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const data = await svc.updateGift(Number(req.params.id), req.body);
  sendOk(res, data);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await svc.deleteGift(Number(req.params.id));
  sendOk(res, { deleted: true });
}));

export default router;

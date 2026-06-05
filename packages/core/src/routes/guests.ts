import { Router } from 'express';
import * as svc from '../services/guestService';
import { asyncHandler } from '../http/asyncHandler';
import { sendOk, sendErr } from '../http/respond';

const router = Router({ mergeParams: true });

router.get('/', asyncHandler(async (req, res) => {
  const data = await svc.listGuests(Number(req.params.eventId));
  sendOk(res, data, { count: data.length });
}));

router.post('/', asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) return sendErr(res, 400, 'VALIDATION', 'name is required');
  const data = await svc.createGuest(Number(req.params.eventId), req.body);
  sendOk(res, data, {}, 201);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const data = await svc.updateGuest(Number(req.params.id), req.body);
  sendOk(res, data);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await svc.deleteGuest(Number(req.params.id));
  sendOk(res, { deleted: true });
}));

// POST /bulk-import — body: { guests: [{ name, phone, ageGroup, dietary }] }
router.post('/bulk-import', asyncHandler(async (req, res) => {
  const { guests } = req.body;
  if (!Array.isArray(guests) || guests.length === 0) {
    return sendErr(res, 400, 'VALIDATION', 'guests array required');
  }
  const data = await svc.bulkImportGuests(Number(req.params.eventId), guests);
  sendOk(res, data, { count: data.count }, 201);
}));

export default router;

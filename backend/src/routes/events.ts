import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as svc from '../services/eventService';
import { asyncHandler } from '../http/asyncHandler';
import { sendOk, sendErr } from '../http/respond';
import type { MulterRequest } from '../types';

const router = Router();

// NOTE: multer config stays inline for Phase 1; moves to uploads/ in Phase 3.
const inviteCardStorage = multer.diskStorage({
  destination: path.join(__dirname, '../../../uploads/invite-cards'),
  filename: (req, file, cb) => {
    cb(null, `invite-${req.params.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const inviteUpload = multer({ storage: inviteCardStorage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', asyncHandler(async (_req, res) => {
  const data = await svc.listEvents();
  sendOk(res, data, { count: data.length });
}));

router.get('/upcoming', asyncHandler(async (_req, res) => {
  const data = await svc.getUpcomingEvents();
  sendOk(res, data, { count: data.length });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const data = await svc.getEvent(Number(req.params.id));
  if (!data) return sendErr(res, 404, 'NOT_FOUND', 'Event not found');
  sendOk(res, data);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { childId, date } = req.body;
  if (!childId || !date) return sendErr(res, 400, 'VALIDATION', 'childId and date are required');
  const data = await svc.createEvent(req.body);
  sendOk(res, data, {}, 201);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const data = await svc.updateEvent(Number(req.params.id), req.body);
  sendOk(res, data);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await svc.deleteEvent(Number(req.params.id));
  sendOk(res, { deleted: true });
}));

router.post('/:id/activate', asyncHandler(async (req, res) => {
  const data = await svc.activateEvent(Number(req.params.id));
  sendOk(res, data);
}));

router.post(
  '/:id/invite-card',
  inviteUpload.single('card'),
  asyncHandler<MulterRequest>(async (req, res) => {
    if (!req.file) return sendErr(res, 400, 'VALIDATION', 'card file required');
    const cardPath = `/uploads/invite-cards/${req.file.filename}`;
    const data = await svc.updateEvent(Number(req.params.id), { cardPath });
    sendOk(res, data);
  }),
);

export default router;

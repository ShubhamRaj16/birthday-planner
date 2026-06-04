import { Router } from 'express';
import * as svc from '../services/reminderService';
import { asyncHandler } from '../http/asyncHandler';
import { sendOk, sendErr } from '../http/respond';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined;
  const data = await svc.listReminders(eventId);
  sendOk(res, data, { count: data.length });
}));

router.get('/unread-count', asyncHandler(async (_req, res) => {
  const count = await svc.getUnreadCount();
  sendOk(res, { count });
}));

router.post('/', asyncHandler(async (req, res) => {
  // SCRUM-43: eventId optional — standalone reminders allowed
  const { triggerAt, label } = req.body;
  if (!triggerAt || !label) return sendErr(res, 400, 'VALIDATION', 'triggerAt and label are required');
  const data = await svc.createReminder(req.body);
  sendOk(res, data, {}, 201);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const data = await svc.updateReminder(Number(req.params.id), req.body);
  sendOk(res, data);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await svc.deleteReminder(Number(req.params.id));
  sendOk(res, { deleted: true });
}));

router.post('/mark-read', asyncHandler(async (req, res) => {
  const { ids } = req.body;
  await svc.markRead(ids);
  sendOk(res, { marked: true });
}));

export default router;

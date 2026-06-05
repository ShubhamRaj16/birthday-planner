import { Router } from 'express';
import dayjs from 'dayjs';
import prisma from '../lib/prisma';
import TASK_DEFAULTS from '../lib/taskDefaults';
import { asyncHandler } from '../http/asyncHandler';
import { sendOk, sendErr } from '../http/respond';

// SOLID PLAN (SRP): this route talks to prisma directly instead of going through a
// service. Move this DB logic into taskService in a later phase; Phase 1 only
// normalizes the envelope/try-catch here.
const router = Router({ mergeParams: true });

// GET all tasks for an event
router.get('/', asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  const data = await prisma.task.findMany({ where: { eventId }, orderBy: { dueDate: 'asc' } });
  sendOk(res, data, { count: data.length });
}));

// POST a custom task
router.post('/', asyncHandler(async (req, res) => {
  const { title, category } = req.body;
  if (!title) return sendErr(res, 400, 'VALIDATION', 'title is required');
  const eventId = Number(req.params.eventId);
  const data = await prisma.task.create({
    data: {
      eventId,
      title,
      category: category || 'miscellaneous',
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
    },
  });
  sendOk(res, data, {}, 201);
}));

// DELETE a task
router.delete('/:taskId', asyncHandler(async (req, res) => {
  await prisma.task.delete({ where: { id: Number(req.params.taskId) } });
  sendOk(res, { deleted: true });
}));

// POST /reset-defaults — regenerate default tasks (path matches frontend contract)
router.post('/reset-defaults', asyncHandler(async (req, res) => {
  const eventId = Number(req.params.eventId);
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return sendErr(res, 404, 'NOT_FOUND', 'Event not found');
  await prisma.task.deleteMany({ where: { eventId } });
  const eventDate = dayjs(event.date);
  const created = await prisma.task.createMany({
    data: TASK_DEFAULTS.map((t) => ({
      eventId,
      title: t.title,
      category: t.category,
      dueDate: eventDate.add(t.daysOffset, 'day').toDate(),
    })),
  });
  sendOk(res, { count: created.count });
}));

export default router;

import { Router, type Request, type Response, type NextFunction } from 'express';
import dayjs from 'dayjs';
import prisma from '../lib/prisma';
import TASK_DEFAULTS from '../lib/taskDefaults';

const router = Router({ mergeParams: true });

// GET all tasks for an event
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = Number(req.params.eventId);
    const data = await prisma.task.findMany({ where: { eventId }, orderBy: { dueDate: 'asc' } });
    res.json({ data, error: null, meta: { count: data.length } });
  } catch (e) { next(e); }
});

// POST a custom task
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, category } = req.body;
    if (!title) {
      res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'title is required' }, meta: {} });
      return;
    }
    const eventId = Number(req.params.eventId);
    const data = await prisma.task.create({
      data: {
        eventId,
        title,
        category: category || 'miscellaneous',
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
      },
    });
    res.status(201).json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

// DELETE a task
router.delete('/:taskId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.task.delete({ where: { id: Number(req.params.taskId) } });
    res.json({ data: { deleted: true }, error: null, meta: {} });
  } catch (e) { next(e); }
});

// POST /reset-defaults — regenerate default tasks (path matches frontend contract)
router.post('/reset-defaults', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = Number(req.params.eventId);
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      res.status(404).json({ data: null, error: { code: 'NOT_FOUND', message: 'Event not found' }, meta: {} });
      return;
    }
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
    res.json({ data: { count: created.count }, error: null, meta: {} });
  } catch (e) { next(e); }
});

export default router;

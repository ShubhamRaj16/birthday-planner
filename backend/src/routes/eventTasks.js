const express = require('express');
const router = express.Router({ mergeParams: true });
const prisma = require('../lib/prisma');
const TASK_DEFAULTS = require('../lib/taskDefaults');
const dayjs = require('dayjs');

// GET all tasks for an event
router.get('/', async (req, res, next) => {
  try {
    const eventId = Number(req.params.eventId);
    const data = await prisma.task.findMany({ where: { eventId }, orderBy: { dueDate: 'asc' } });
    res.json({ data, error: null, meta: { count: data.length } });
  } catch (e) { next(e); }
});

// POST a custom task
router.post('/', async (req, res, next) => {
  try {
    const { title, category } = req.body;
    if (!title) return res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'title is required' }, meta: {} });
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
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.task.delete({ where: { id: Number(req.params.id) } });
    res.json({ data: { deleted: true }, error: null, meta: {} });
  } catch (e) { next(e); }
});

// POST /reset-defaults — deletes all tasks and recreates the 10 defaults
router.post('/reset-defaults', async (req, res, next) => {
  try {
    const eventId = Number(req.params.eventId);
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ data: null, error: { code: 'NOT_FOUND', message: 'Event not found' }, meta: {} });
    await prisma.task.deleteMany({ where: { eventId } });
    const eventDate = dayjs(event.date);
    const tasks = await Promise.all(
      TASK_DEFAULTS.map((t) =>
        prisma.task.create({
          data: {
            eventId,
            title: t.title,
            category: t.category,
            dueDate: eventDate.add(t.daysOffset, 'day').toDate(),
          },
        })
      )
    );
    res.json({ data: tasks, error: null, meta: { count: tasks.length } });
  } catch (e) { next(e); }
});

module.exports = router;

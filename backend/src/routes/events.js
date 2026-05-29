const express = require('express');
const router = express.Router();
const svc = require('../services/eventService');

router.get('/', async (req, res, next) => {
  try {
    const data = await svc.listEvents();
    res.json({ data, error: null, meta: { count: data.length } });
  } catch (e) { next(e); }
});

router.get('/upcoming', async (req, res, next) => {
  try {
    const data = await svc.getUpcomingEvents();
    res.json({ data, error: null, meta: { count: data.length } });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await svc.getEvent(Number(req.params.id));
    if (!data) return res.status(404).json({ data: null, error: { code: 'NOT_FOUND', message: 'Event not found' }, meta: {} });
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { childId, date } = req.body;
    if (!childId || !date) {
      return res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'childId and date are required' }, meta: {} });
    }
    const data = await svc.createEvent(req.body);
    res.status(201).json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const data = await svc.updateEvent(Number(req.params.id), req.body);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await svc.deleteEvent(Number(req.params.id));
    res.json({ data: { deleted: true }, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.post('/:id/activate', async (req, res, next) => {
  try {
    const data = await svc.activateEvent(Number(req.params.id));
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

module.exports = router;

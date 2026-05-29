const express = require('express');
const router = express.Router();
const svc = require('../services/reminderService');

router.get('/', async (req, res, next) => {
  try {
    const data = await svc.listReminders(req.query.eventId);
    res.json({ data, error: null, meta: { count: data.length } });
  } catch (e) { next(e); }
});

router.get('/unread-count', async (req, res, next) => {
  try {
    const count = await svc.getUnreadCount();
    res.json({ data: { count }, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { eventId, triggerAt, label } = req.body;
    if (!eventId || !triggerAt || !label) {
      return res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'eventId, triggerAt, and label are required' }, meta: {} });
    }
    const data = await svc.createReminder(req.body);
    res.status(201).json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const data = await svc.updateReminder(Number(req.params.id), req.body);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await svc.deleteReminder(Number(req.params.id));
    res.json({ data: { deleted: true }, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.post('/mark-read', async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'ids array required' }, meta: {} });
    }
    const data = await svc.markRead(ids);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

module.exports = router;

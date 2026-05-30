const express = require('express');
const router = express.Router({ mergeParams: true });
const svc = require('../services/giftService');

router.get('/', async (req, res, next) => {
  try {
    const data = await svc.listGifts(Number(req.params.eventId));
    res.json({ data, error: null, meta: { count: data.length } });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ data: null, error: { code: 'VALIDATION', message: 'name is required' }, meta: {} });
    const data = await svc.createGift(Number(req.params.eventId), req.body);
    res.status(201).json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const data = await svc.updateGift(Number(req.params.id), req.body);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await svc.deleteGift(Number(req.params.id));
    res.json({ data: { deleted: true }, error: null, meta: {} });
  } catch (e) { next(e); }
});

module.exports = router;

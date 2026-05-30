const express = require('express');
const router = express.Router();
const svc = require('../services/taskService');

router.put('/:id', async (req, res, next) => {
  try {
    const data = await svc.updateTask(Number(req.params.id), req.body);
    res.json({ data, error: null, meta: {} });
  } catch (e) { next(e); }
});

module.exports = router;

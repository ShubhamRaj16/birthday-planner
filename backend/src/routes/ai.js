const express = require('express');
const router = express.Router({ mergeParams: true });
const { getSuggestions } = require('../services/aiService');
const eventService = require('../services/eventService');
const childService = require('../services/childService');

// POST /api/v1/events/:eventId/ai/suggest
// body: { type: 'themes' | 'activities' | 'gifts' | 'venue' | 'catering' | 'message' }
router.post('/suggest', async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({ data: null, error: 'type is required', meta: {} });
    }

    const event = await eventService.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ data: null, error: 'Event not found', meta: {} });
    }

    const child = event.childId ? await childService.getChild(event.childId) : null;

    const result = await getSuggestions(type, event, child);
    res.json({ data: result, error: null, meta: {} });
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({ data: null, error: err.message, meta: {} });
    }
    next(err);
  }
});

module.exports = router;

import { Router } from 'express';
import { getSuggestions } from '../services/aiService';
import * as eventService from '../services/eventService';
import * as childService from '../services/childService';
import { asyncHandler } from '../http/asyncHandler';
import { sendOk, sendErr } from '../http/respond';

const router = Router({ mergeParams: true });

// POST /api/v1/events/:eventId/ai/suggest
// body: { type: 'themes' | 'activities' | 'gifts' | 'venue' | 'catering' | 'message' }
// Unknown types throw a status-400 error from aiService, which errorHandler maps.
router.post('/suggest', asyncHandler(async (req, res) => {
  const eventId = parseInt(req.params.eventId, 10);
  const { type } = req.body;
  if (!type) return sendErr(res, 400, 'VALIDATION', 'type is required');

  const event = await eventService.getEvent(eventId);
  if (!event) return sendErr(res, 404, 'NOT_FOUND', 'Event not found');

  const child = event.childId ? await childService.getChild(event.childId) : null;
  const result = await getSuggestions(type, event, child);
  sendOk(res, result);
}));

export default router;

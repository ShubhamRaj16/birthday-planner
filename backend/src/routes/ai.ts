import { Router, type Request, type Response, type NextFunction } from 'express';
import { getSuggestions } from '../services/aiService';
import * as eventService from '../services/eventService';
import * as childService from '../services/childService';

const router = Router({ mergeParams: true });

interface StatusError extends Error {
  status?: number;
}

// POST /api/v1/events/:eventId/ai/suggest
// body: { type: 'themes' | 'activities' | 'gifts' | 'venue' | 'catering' | 'message' }
router.post('/suggest', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = parseInt(req.params.eventId, 10);
    const { type } = req.body;

    if (!type) {
      res.status(400).json({ data: null, error: 'type is required', meta: {} });
      return;
    }

    const event = await eventService.getEvent(eventId);
    if (!event) {
      res.status(404).json({ data: null, error: 'Event not found', meta: {} });
      return;
    }

    const child = event.childId ? await childService.getChild(event.childId) : null;

    const result = await getSuggestions(type, event, child);
    res.json({ data: result, error: null, meta: {} });
  } catch (err) {
    if ((err as StatusError).status === 400) {
      res.status(400).json({ data: null, error: (err as Error).message, meta: {} });
      return;
    }
    next(err);
  }
});

export default router;

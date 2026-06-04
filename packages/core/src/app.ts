import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import errorHandler from './middleware/errorHandler';
import childrenRouter from './routes/children';
import eventsRouter from './routes/events';
import remindersRouter from './routes/reminders';
import tasksRouter from './routes/tasks';
import guestsRouter from './routes/guests';
import expensesRouter from './routes/expenses';
import giftsRouter from './routes/gifts';
import eventTasksRouter from './routes/eventTasks';
import photosRouter from './routes/photos';
import aiRouter from './routes/ai';
import whatsappRouter from './routes/whatsapp';

const app = express();

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      /^http:\/\/192\.168\.\d+\.\d+:(3000|3002|5173)$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/v1/children',                  childrenRouter);
app.use('/api/v1/events',                    eventsRouter);
app.use('/api/v1/reminders',                 remindersRouter);
app.use('/api/v1/tasks',                     tasksRouter);
app.use('/api/v1/events/:eventId/guests',    guestsRouter);
app.use('/api/v1/events/:eventId/expenses',  expensesRouter);
app.use('/api/v1/events/:eventId/gifts',     giftsRouter);
app.use('/api/v1/events/:eventId/tasks',     eventTasksRouter);
app.use('/api/v1/events/:eventId/photos',    photosRouter);
app.use('/api/v1/events/:eventId/ai',        aiRouter);
app.use('/api/v1/whatsapp',                  whatsappRouter);

app.get('/api/v1/health', (_req, res) => {
  res.json({ data: { status: 'ok' }, error: null, meta: {} });
});

app.use(errorHandler);

export default app;

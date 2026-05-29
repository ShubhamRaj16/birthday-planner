require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  'http://localhost:3000',  // SSR server
  'http://localhost:3002',  // Webpack Dev Server
  'http://localhost:5173',  // Vite (legacy)
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const childrenRouter = require('./src/routes/children');
const eventsRouter = require('./src/routes/events');
const remindersRouter = require('./src/routes/reminders');
const tasksRouter = require('./src/routes/tasks');
app.use('/api/v1/children', childrenRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1/reminders', remindersRouter);
app.use('/api/v1/tasks', tasksRouter);

app.get('/api/v1/health', (req, res) => {
  res.json({ data: { status: 'ok' }, error: null, meta: {} });
});

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
  require('./src/lib/prisma');
  require('./src/lib/cron').startCronJobs();
});

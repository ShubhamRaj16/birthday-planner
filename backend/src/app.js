require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

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

app.use('/api/v1/children',                  require('./routes/children'));
app.use('/api/v1/events',                    require('./routes/events'));
app.use('/api/v1/reminders',                 require('./routes/reminders'));
app.use('/api/v1/tasks',                     require('./routes/tasks'));
app.use('/api/v1/events/:eventId/guests',    require('./routes/guests'));
app.use('/api/v1/events/:eventId/expenses',  require('./routes/expenses'));
app.use('/api/v1/events/:eventId/gifts',     require('./routes/gifts'));
app.use('/api/v1/events/:eventId/tasks',     require('./routes/eventTasks'));
app.use('/api/v1/events/:eventId/photos',    require('./routes/photos'));
app.use('/api/v1/events/:eventId/ai',        require('./routes/ai'));
app.use('/api/v1/whatsapp',                  require('./routes/whatsapp'));

app.get('/api/v1/health', (_req, res) => {
  res.json({ data: { status: 'ok' }, error: null, meta: {} });
});

app.use(errorHandler);

module.exports = app;

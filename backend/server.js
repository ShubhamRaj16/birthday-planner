require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === 'http://localhost:5173' ||
      /^http:\/\/192\.168\.\d+\.\d+:5173$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/v1/health', (req, res) => {
  res.json({ data: { status: 'ok' }, error: null, meta: {} });
});

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
  try {
    require('./src/lib/prisma');
  } catch (e) {
    console.warn('Prisma client not yet generated (no models defined yet)');
  }
});

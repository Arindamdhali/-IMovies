require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');
const { apiLimiter } = require('./middleware/rateLimit');

if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set. Ensure it is configured in environment variables.');
}

const app = express();
app.set('trust proxy', 1);

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        clientUrl === '*' ||
        origin === clientUrl ||
        (typeof clientUrl === 'string' && clientUrl.split(',').map((s) => s.trim()).includes(origin)) ||
        origin.endsWith('.vercel.app') ||
        origin.startsWith('http://localhost:')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Ensure DB is connected before handling API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', name: 'IMovies API', timestamp: new Date() });
});

app.use('/api', apiLimiter, routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

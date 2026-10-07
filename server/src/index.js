import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';
import recommendRoutes from './routes/recommend.js';
import weatherRoutes from './routes/weather.js';
import userRoutes from './routes/user.js';
import audioRoutes from './routes/audio.js';
import activityRoutes from './routes/activities.js';

dotenv.config({ path: '../.env' });

// Initialize Sentry for error monitoring and tracing
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
  console.log('📊 Sentry initialized');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/recommend', recommendRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/user', userRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/activities', activityRoutes);

// Sentry error handler (must be after routes, before generic error handler)
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`🌿 OutdoorPulse API running on http://localhost:${PORT}`);
});

export default app;

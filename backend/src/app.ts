import cors from 'cors';
import express from 'express';
import { config } from './config/env';
import { errorLogger, httpLogger, requestLogger } from './middleware/logging';
import { metricsHandler, metricsMiddleware } from './middleware/metrics';
import v1Routes from './routes/v1';

const app = express();

// CORS middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Logging middleware
app.use(httpLogger);

// Request debugging middleware (for development)
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Metrics middleware
app.use(metricsMiddleware);

// Global middleware
app.use(express.json());

// Disable caching for all API responses
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Prometheus metrics endpoint
app.get('/metrics', metricsHandler);

// API versioning
app.use('/api/v1', v1Routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Error logging middleware (should be after all routes)
app.use(errorLogger);

export default app;

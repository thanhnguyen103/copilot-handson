import express from 'express';
import v1Routes from './routes/v1';
import { httpLogger, errorLogger } from './middleware/logging';
import { metricsMiddleware, metricsHandler } from './middleware/metrics';

const app = express();

// Logging middleware
app.use(httpLogger);

// Metrics middleware
app.use(metricsMiddleware);

// Global middleware
app.use(express.json());

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

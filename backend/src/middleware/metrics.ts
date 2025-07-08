import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

// Create a Registry to register the metrics
const register = new client.Registry();

// Collect default metrics (Node.js process, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom HTTP request duration histogram
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [50, 100, 200, 300, 400, 500, 1000, 2000],
});
register.registerMetric(httpRequestDurationMicroseconds);

// Middleware to measure request durations
function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route ? req.route.path : req.path, res.statusCode.toString())
      .observe(duration);
  });
  next();
}

// Metrics endpoint handler
function metricsHandler(req: Request, res: Response) {
  res.set('Content-Type', register.contentType);
  register.metrics().then(metrics => res.end(metrics));
}

export { metricsMiddleware, metricsHandler };

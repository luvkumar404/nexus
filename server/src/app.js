import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import projectRoutes from './routes/project.routes.js';
import auditRoutes from './routes/audit.routes.js';
import crawlerRoutes from './routes/crawler.routes.js';
import debugRoutes from './routes/debug.routes.js';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

const app = express();
const allowedOrigins = new Set([
  env.clientUrl,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175'
]);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin) || env.nodeEnv === 'development') return callback(null, true);
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', name: 'Nexus SEO Auditor' }));
app.use('/api/projects', projectRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/crawler', crawlerRoutes);
app.use('/api/debug', debugRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;

import app from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

await connectDb();

app.listen(env.port, () => {
  logger.info(`Nexus SEO Auditor API running on port ${env.port}`);
});

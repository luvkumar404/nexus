import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexus_seo_auditor',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  auditCrawlEnabled: process.env.AUDIT_CRAWL_ENABLED !== 'false',
  auditMaxPages: Number(process.env.AUDIT_MAX_PAGES || 25),
  auditConcurrency: Number(process.env.AUDIT_CONCURRENCY || 3),
  lighthouseEnabled: process.env.LIGHTHOUSE_ENABLED !== 'false',
  auditDebug: process.env.AUDIT_DEBUG === 'true',
  nodeEnv: process.env.NODE_ENV || 'development'
};

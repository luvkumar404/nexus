import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'WebsiteProject' },
  url: { type: String, required: true },
  status: { type: String, enum: ['queued', 'running', 'completed', 'failed'], default: 'queued' },
  progress: { type: Number, default: 0 },
  currentStep: { type: String, default: 'Queued' },
  finalUrl: String,
  statusCode: Number,
  fetchMethod: String,
  overallScore: { type: Number, default: 0 },
  grade: String,
  summary: mongoose.Schema.Types.Mixed,
  categories: mongoose.Schema.Types.Mixed,
  headingStructure: mongoose.Schema.Types.Mixed,
  socialPreview: mongoose.Schema.Types.Mixed,
  pageMetrics: mongoose.Schema.Types.Mixed,
  scoreImprovementPlan: mongoose.Schema.Types.Mixed,
  scores: mongoose.Schema.Types.Mixed,
  performance: mongoose.Schema.Types.Mixed,
  crawl: mongoose.Schema.Types.Mixed,
  backlinkAnalysis: mongoose.Schema.Types.Mixed,
  searchConsole: mongoose.Schema.Types.Mixed,
  debug: mongoose.Schema.Types.Mixed,
  error: String,
  completedAt: Date
}, { timestamps: true });

export default mongoose.model('Audit', auditSchema);

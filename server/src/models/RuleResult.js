import mongoose from 'mongoose';

const ruleResultSchema = new mongoose.Schema({
  audit: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true },
  ruleId: { type: String, required: true },
  categoryId: { type: String, required: true },
  ruleName: { type: String, required: true },
  status: { type: String, enum: ['pass', 'warn', 'fail', 'info', 'not_available', 'skipped'], required: true },
  score: { type: Number, default: null },
  scoreEligible: { type: Boolean, default: false },
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low', 'info'], default: 'info' },
  message: String,
  recommendation: String,
  solution: mongoose.Schema.Types.Mixed,
  evidence: mongoose.Schema.Types.Mixed,
  developerDetails: mongoose.Schema.Types.Mixed,
  affectedUrl: String,
  impact: String,
  difficulty: String,
  source: String,
  confidence: { type: String, enum: ['high', 'medium', 'low'], default: 'high' }
}, { timestamps: true });

ruleResultSchema.index({ audit: 1, categoryId: 1 });

export default mongoose.model('RuleResult', ruleResultSchema);

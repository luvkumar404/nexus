import mongoose from 'mongoose';

const categoryResultSchema = new mongoose.Schema({
  audit: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true },
  id: { type: String, required: true },
  name: { type: String, required: true },
  weight: { type: Number, required: true },
  score: { type: Number, default: null },
  status: String,
  totalRules: { type: Number, default: 0 },
  applicableRules: { type: Number, default: 0 },
  passed: { type: Number, default: 0 },
  warnings: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  info: { type: Number, default: 0 },
  notAvailable: { type: Number, default: 0 },
  skipped: { type: Number, default: 0 },
  scoreExplanation: mongoose.Schema.Types.Mixed
}, { timestamps: true });

categoryResultSchema.index({ audit: 1, id: 1 });

export default mongoose.model('CategoryResult', categoryResultSchema);

import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  audit: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true },
  pageAudit: { type: mongoose.Schema.Types.ObjectId, ref: 'PageAudit' },
  title: { type: String, required: true },
  description: String,
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  category: { type: String, required: true },
  affectedUrl: String,
  recommendation: String,
  estimatedImpact: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' }
}, { timestamps: true });

export default mongoose.model('Issue', issueSchema);

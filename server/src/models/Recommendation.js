import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  audit: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  title: String,
  body: String,
  priority: { type: Number, default: 0 },
  category: String
}, { timestamps: true });

export default mongoose.model('Recommendation', recommendationSchema);

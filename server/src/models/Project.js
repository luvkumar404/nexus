import mongoose from 'mongoose';

const backlinkMetricsSchema = new mongoose.Schema({
  domainAuthority: Number,
  referringDomains: Number,
  backlinks: Number,
  toxicLinks: Number,
  anchorTextDistribution: [{ anchor: String, count: Number }]
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  url: { type: String, required: true },
  backlinkMetrics: backlinkMetricsSchema,
  searchConsoleConnected: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('WebsiteProject', projectSchema);

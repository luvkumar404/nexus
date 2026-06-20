import mongoose from 'mongoose';

const pageAuditSchema = new mongoose.Schema({
  audit: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', required: true },
  url: { type: String, required: true },
  statusCode: Number,
  title: String,
  titleLength: Number,
  metaDescription: String,
  metaDescriptionLength: Number,
  canonical: String,
  robotsMeta: String,
  viewport: String,
  h1: [String],
  h2: [String],
  h3: [String],
  wordCount: Number,
  readability: Number,
  internalLinks: [String],
  externalLinks: [String],
  brokenLinks: [{ url: String, status: Number, type: String }],
  images: {
    total: Number,
    missingAlt: Number,
    emptyAlt: Number,
    missingDimensions: Number,
    notLazyLoaded: Number,
    largeImages: [{ url: String, bytes: Number }]
  },
  resources: {
    cssCount: Number,
    jsCount: Number,
    failed: [{ url: String, status: Number }]
  },
  structuredData: mongoose.Schema.Types.Mixed,
  socialTags: mongoose.Schema.Types.Mixed,
  hreflang: [{ lang: String, href: String, valid: Boolean }],
  bodyText: { type: String, select: false },
  contentHash: String
}, { timestamps: true });

export default mongoose.model('PageAudit', pageAuditSchema);

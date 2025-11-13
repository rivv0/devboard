import mongoose from "mongoose";

/**
 * Code Quality Schema
 * Stores AI-powered code quality insights for commits
 */
const codeQualitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  repository: {
    owner: { type: String, required: true },
    name: { type: String, required: true },
    fullName: { type: String, required: true }, // owner/repo
  },
  commit: {
    sha: { type: String, required: true, index: true },
    message: { type: String, required: true },
    author: { type: String },
    date: { type: Date, required: true, index: true },
    url: { type: String },
  },
  stats: {
    additions: { type: Number, default: 0 },
    deletions: { type: Number, default: 0 },
    totalChanges: { type: Number, default: 0 },
    filesChanged: { type: Number, default: 0 },
  },
  analysis: {
    score: { type: Number, required: true, min: 0, max: 100 },
    complexity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    patterns: [String],
    bestPractices: [String],
    improvements: [String],
    testCoverage: {
      type: String,
      enum: ["None", "Partial", "Good"],
      default: "None",
    },
    summary: { type: String },
    aiPowered: { type: Boolean, default: false },
    model: { type: String },
  },
  analyzedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  version: {
    type: String,
    default: "1.0",
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
codeQualitySchema.index({ userId: 1, "commit.date": -1 });
codeQualitySchema.index({ userId: 1, "repository.fullName": 1, "commit.date": -1 });
codeQualitySchema.index({ "commit.sha": 1 }, { unique: true });

// Virtual for quality level
codeQualitySchema.virtual("qualityLevel").get(function () {
  if (this.analysis.score >= 80) return "Excellent";
  if (this.analysis.score >= 60) return "Good";
  if (this.analysis.score >= 40) return "Fair";
  return "Needs Improvement";
});

export default mongoose.model("CodeQuality", codeQualitySchema);

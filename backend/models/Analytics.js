import mongoose from "mongoose";

/**
 * Analytics Schema
 * Stores computed analytics data with historical tracking
 */
const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["github", "leetcode", "combined", "productivity", "skills"],
    index: true,
  },
  timeRange: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  computedAt: {
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

// Compound index for efficient queries
analyticsSchema.index({ userId: 1, type: 1, computedAt: -1 });
analyticsSchema.index({ userId: 1, type: 1, "timeRange.start": 1, "timeRange.end": 1 });

export default mongoose.model("Analytics", analyticsSchema);

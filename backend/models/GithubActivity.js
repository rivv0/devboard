import mongoose from "mongoose";

const githubActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  activityType: { type: String, required: true }, // e.g., "push", "repo_created"
  repoName: { type: String },
  details: { type: Object }, // full event data
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("GitHubActivity", githubActivitySchema);

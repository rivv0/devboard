import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  githubUsername: { type: String },
  githubAccessToken: { type: String }, // (in production, encrypt this!)
  leetcodeUsername: String,
  leetcodeData: {
    totalSolved: Number,
    easySolved: Number,
    mediumSolved: Number,
    hardSolved: Number,
    ranking: Number,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);

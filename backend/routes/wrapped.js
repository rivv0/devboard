import express from "express";
import User from "../models/User.js";
import GithubActivity from "../models/GithubActivity.js";
import Analytics from "../models/Analytics.js";
import { generateGitHubWrapped } from "../services/githubWrapped.js";

const router = express.Router();

/**
 * GET /api/wrapped/:username
 * Generate GitHub Wrapped summary (no AI needed)
 */
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // Fetch user data
    const user = await User.findOne({ githubUsername: username });
    if (!user) {
      return res.status(404).json({ error: "User not found. Please authenticate first." });
    }

    // Fetch GitHub activity
    const githubActivity = await GithubActivity.find({ userId: user._id })
      .sort({ timestamp: -1 })
      .limit(1000);

    if (githubActivity.length === 0) {
      return res.status(404).json({ 
        error: "No GitHub activity found. Please sync your data first by visiting the dashboard." 
      });
    }

    // Fetch analytics
    const analytics = await Analytics.findOne({ userId: user._id }).sort({ createdAt: -1 });

    // Generate wrapped (no AI needed - pure data analysis)
    const wrapped = generateGitHubWrapped(
      user,
      githubActivity,
      user.leetcodeData,
      analytics
    );

    res.json({
      success: true,
      wrapped,
    });
  } catch (error) {
    console.error("Error generating wrapped:", error);
    res.status(500).json({ 
      error: "Failed to generate wrapped", 
      details: error.message 
    });
  }
});

export default router;

import express from "express";
import axios from "axios";
import User from "../models/User.js";

const router = express.Router();

// Get user data by GitHub username
router.get("/:username", async (req, res) => {
  try {
    const user = await User.findOne({ githubUsername: req.params.username });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("User fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Save or update LeetCode username + fetch stats
router.post("/link-leetcode", async (req, res) => {
  try {
    const { githubUsername, leetcodeUsername } = req.body;

    // Fetch LeetCode data using external API
    const { data } = await axios.get(`https://leetcode-stats-api.herokuapp.com/${leetcodeUsername}`);

    if (!data || data.status === "error") {
      return res.status(404).json({ error: "LeetCode user not found" });
    }

    // Update user with both username and LeetCode data
    const user = await User.findOneAndUpdate(
      { githubUsername },
      {
        leetcodeUsername,
        leetcodeData: {
          totalSolved: data.totalSolved,
          easySolved: data.easySolved,
          mediumSolved: data.mediumSolved,
          hardSolved: data.hardSolved,
          ranking: data.ranking,
        },
      },
      { new: true, upsert: true }
    );

    res.json({ message: "LeetCode linked successfully!", user });
  } catch (err) {
    console.error("LeetCode link error:", err.message);
    res.status(500).json({ error: "Failed to link LeetCode account" });
  }
});

export default router;

import express from "express";
import axios from "axios";
import User from "../models/User.js";

const router = express.Router();

// Initialize or update LeetCode username + fetch stats
router.post("/init", async (req, res) => {
  const { githubUsername, leetcodeUsername } = req.body;

  if (!leetcodeUsername)
    return res.status(400).json({ error: "LeetCode username is required" });

  try {
    // Fetch user data from LeetCode API (using heroku proxy or leetcode-api)
    const apiUrl = `https://leetcode-stats-api.herokuapp.com/${leetcodeUsername}`;
    const { data } = await axios.get(apiUrl);

    if (data.status === "error")
      return res.status(400).json({ error: "Invalid LeetCode username" });

    // Save to user
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
      { new: true }
    );

    res.json({ message: "✅ LeetCode linked successfully", user });
  } catch (err) {
    console.error("LeetCode API Error:", err.message);
    res.status(500).json({ error: "Failed to link LeetCode" });
  }
});

// Get stored LeetCode data
router.get("/activity/:githubUsername", async (req, res) => {
  try {
    const user = await User.findOne({ githubUsername: req.params.githubUsername });
    if (!user || !user.leetcodeData)
      return res.status(404).json({ error: "LeetCode data not found" });

    res.json(user.leetcodeData);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch LeetCode data" });
  }
});

export default router;

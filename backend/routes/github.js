import express from "express";
import axios from "axios";
import User from "../models/User.js";
import GitHubActivity from "../models/GithubActivity.js";

const router = express.Router();

// Sync GitHub activity for a user
router.get("/sync/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ githubUsername: username });

    if (!user) return res.status(404).json({ error: "User not found" });

    const headers = {
      Authorization: `Bearer ${user.githubAccessToken}`,
      Accept: "application/vnd.github.v3+json",
    };

    const response = await axios.get(
      `https://api.github.com/users/${username}/events`,
      { headers }
    );

    const events = response.data;

    // Save events to database
    for (const event of events) {
      await GitHubActivity.findOneAndUpdate(
        { userId: user._id, "details.id": event.id },
        {
          userId: user._id,
          activityType: event.type,
          repoName: event.repo?.name || "N/A",
          details: event,
          timestamp: new Date(event.created_at),
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: "GitHub activity synced", count: events.length });
  } catch (err) {
    console.error("GitHub sync error:", err.message);
    res.status(500).json({ error: "Failed to sync GitHub activity" });
  }
});

// Get GitHub activity for a user
router.get("/activity/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { type } = req.query;

    const user = await User.findOne({ githubUsername: username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const query = { userId: user._id };
    if (type) query.activityType = type;

    const activities = await GitHubActivity.find(query)
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(activities);
  } catch (err) {
    console.error("Activity fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

// Get GitHub profile for frontend dashboard
router.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ githubUsername: username });

    let headers = { Accept: "application/vnd.github.v3+json" };
    if (user?.githubAccessToken) {
      headers.Authorization = `Bearer ${user.githubAccessToken}`;
    }

    const apiUrl = `https://api.github.com/users/${username}`;
    const response = await axios.get(apiUrl, { headers });

    return res.json(response.data);
  } catch (err) {
    console.error("Error fetching GitHub user:", err.response?.data || err.message);
    if (err.response?.status === 404) return res.status(404).json({ error: "GitHub user not found" });
    return res.status(500).json({ error: "Failed to fetch GitHub user" });
  }
});

export default router;

import express from "express";
import Analytics from "../models/Analytics.js";
import User from "../models/User.js";
import { getGitHubAnalytics } from "../services/githubAnalytics.js";
import { getLeetCodeAnalytics } from "../services/leetcodeAnalytics.js";

const router = express.Router();

/**
 * GET /api/analytics/debug/:username
 * Debug endpoint to check raw GitHub activity data
 */
router.get("/debug/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ githubUsername: username });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const GitHubActivity = (await import("../models/GithubActivity.js")).default;
    
    const totalActivities = await GitHubActivity.countDocuments({ userId: user._id });
    const pushEvents = await GitHubActivity.countDocuments({ userId: user._id, activityType: "PushEvent" });
    const recentActivities = await GitHubActivity.find({ userId: user._id }).sort({ timestamp: -1 }).limit(5);
    
    res.json({
      userId: user._id,
      username: user.githubUsername,
      totalActivities,
      pushEvents,
      recentActivities: recentActivities.map(a => ({
        type: a.activityType,
        repo: a.repoName,
        timestamp: a.timestamp,
        hasCommits: !!a.details?.payload?.commits,
        commitCount: a.details?.payload?.commits?.length || 0
      }))
    });
  } catch (err) {
    console.error("Debug error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/analytics/github/:username
 * Get GitHub analytics for a user
 */
router.get("/github/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { refresh } = req.query;

    const user = await User.findOne({ githubUsername: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check for cached analytics (less than 6 hours old)
    if (!refresh) {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      const cachedAnalytics = await Analytics.findOne({
        userId: user._id,
        type: "github",
        computedAt: { $gte: sixHoursAgo },
      }).sort({ computedAt: -1 });

      if (cachedAnalytics) {
        return res.json({
          ...cachedAnalytics.data,
          cached: true,
          computedAt: cachedAnalytics.computedAt,
        });
      }
    }

    // Compute fresh analytics
    const analytics = await getGitHubAnalytics(user._id);

    // Store in database
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    await Analytics.create({
      userId: user._id,
      type: "github",
      timeRange: {
        start: thirtyDaysAgo,
        end: now,
      },
      data: analytics,
      computedAt: now,
    });

    res.json({
      ...analytics,
      cached: false,
    });
  } catch (err) {
    console.error("GitHub analytics error:", err.message);
    res.status(500).json({ error: "Failed to compute GitHub analytics" });
  }
});

/**
 * GET /api/analytics/leetcode/:username
 * Get LeetCode analytics for a user
 */
router.get("/leetcode/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { refresh } = req.query;

    const user = await User.findOne({ githubUsername: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check for cached analytics (less than 6 hours old)
    if (!refresh) {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      const cachedAnalytics = await Analytics.findOne({
        userId: user._id,
        type: "leetcode",
        computedAt: { $gte: sixHoursAgo },
      }).sort({ computedAt: -1 });

      if (cachedAnalytics) {
        return res.json({
          ...cachedAnalytics.data,
          cached: true,
          computedAt: cachedAnalytics.computedAt,
        });
      }
    }

    // Get previous data for trend analysis
    const previousAnalytics = await Analytics.findOne({
      userId: user._id,
      type: "leetcode",
    }).sort({ computedAt: -1 });

    const previousData = previousAnalytics?.data?.difficultyDistribution
      ? {
          totalSolved: previousAnalytics.data.difficultyDistribution.total,
          easySolved: previousAnalytics.data.difficultyDistribution.easy.solved,
          mediumSolved: previousAnalytics.data.difficultyDistribution.medium.solved,
          hardSolved: previousAnalytics.data.difficultyDistribution.hard.solved,
        }
      : null;

    // Compute fresh analytics
    const analytics = await getLeetCodeAnalytics(user._id, previousData);

    if (!analytics.hasData) {
      return res.status(404).json({ error: "No LeetCode data found for user" });
    }

    // Store in database
    const now = new Date();
    await Analytics.create({
      userId: user._id,
      type: "leetcode",
      timeRange: {
        start: now,
        end: now,
      },
      data: analytics,
      computedAt: now,
    });

    res.json({
      ...analytics,
      cached: false,
    });
  } catch (err) {
    console.error("LeetCode analytics error:", err.message);
    res.status(500).json({ error: "Failed to compute LeetCode analytics" });
  }
});

/**
 * GET /api/analytics/combined/:username
 * Get combined analytics for both GitHub and LeetCode
 */
router.get("/combined/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { refresh } = req.query;

    const user = await User.findOne({ githubUsername: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check for cached combined analytics
    if (!refresh) {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      const cachedAnalytics = await Analytics.findOne({
        userId: user._id,
        type: "combined",
        computedAt: { $gte: sixHoursAgo },
      }).sort({ computedAt: -1 });

      if (cachedAnalytics) {
        return res.json({
          ...cachedAnalytics.data,
          cached: true,
          computedAt: cachedAnalytics.computedAt,
        });
      }
    }

    // Fetch both analytics
    const [githubAnalytics, leetcodeAnalytics] = await Promise.all([
      getGitHubAnalytics(user._id),
      getLeetCodeAnalytics(user._id),
    ]);

    const combinedAnalytics = {
      github: githubAnalytics,
      leetcode: leetcodeAnalytics,
      summary: {
        totalCommits: githubAnalytics.timeBasedStats?.monthly?.commits || 0,
        totalRepositories: githubAnalytics.repositoryMetrics?.totalRepositories || 0,
        totalProblemsSolved: leetcodeAnalytics.difficultyDistribution?.total || 0,
        topLanguage: githubAnalytics.languageDistribution?.topLanguage || "N/A",
        leetcodeRanking: leetcodeAnalytics.ranking || "N/A",
        skillLevel: leetcodeAnalytics.problemSolvingPatterns?.skillLevel || "Beginner",
      },
      generatedAt: new Date(),
    };

    // Store in database
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    await Analytics.create({
      userId: user._id,
      type: "combined",
      timeRange: {
        start: thirtyDaysAgo,
        end: now,
      },
      data: combinedAnalytics,
      computedAt: now,
    });

    res.json({
      ...combinedAnalytics,
      cached: false,
    });
  } catch (err) {
    console.error("Combined analytics error:", err.message);
    res.status(500).json({ error: "Failed to compute combined analytics" });
  }
});

/**
 * GET /api/analytics/history/:username
 * Get historical analytics for a user
 */
router.get("/history/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { type = "combined", limit = 30 } = req.query;

    const user = await User.findOne({ githubUsername: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const history = await Analytics.find({
      userId: user._id,
      type,
    })
      .sort({ computedAt: -1 })
      .limit(parseInt(limit));

    res.json({
      type,
      count: history.length,
      history: history.map((record) => ({
        computedAt: record.computedAt,
        timeRange: record.timeRange,
        summary: extractSummary(record.data, type),
      })),
    });
  } catch (err) {
    console.error("Analytics history error:", err.message);
    res.status(500).json({ error: "Failed to fetch analytics history" });
  }
});

/**
 * DELETE /api/analytics/cache/:username
 * Clear cached analytics for a user (force refresh)
 */
router.delete("/cache/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ githubUsername: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete recent analytics (last 24 hours) to force refresh
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await Analytics.deleteMany({
      userId: user._id,
      computedAt: { $gte: oneDayAgo },
    });

    res.json({
      message: "Analytics cache cleared",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Cache clear error:", err.message);
    res.status(500).json({ error: "Failed to clear analytics cache" });
  }
});

/**
 * Helper function to extract summary from analytics data
 */
function extractSummary(data, type) {
  if (type === "github") {
    return {
      commits: data.timeBasedStats?.monthly?.commits || 0,
      repositories: data.repositoryMetrics?.totalRepositories || 0,
      topLanguage: data.languageDistribution?.topLanguage || "N/A",
    };
  } else if (type === "leetcode") {
    return {
      totalSolved: data.difficultyDistribution?.total || 0,
      ranking: data.ranking || "N/A",
      skillLevel: data.problemSolvingPatterns?.skillLevel || "Beginner",
    };
  } else if (type === "combined") {
    return data.summary || {};
  }
  return {};
}

export default router;

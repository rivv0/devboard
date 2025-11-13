import express from "express";
import CodeQuality from "../models/CodeQuality.js";
import User from "../models/User.js";
import GitHubActivity from "../models/GithubActivity.js";
import {
  fetchCommitDiff,
  fetchRecentCommits,
  analyzeCodeQuality,
  batchAnalyzeCommits,
  generateQualityTimeline,
  analyzeCommitWithInsights,
} from "../services/codeAnalysis.js";
import {
  detectDesignPatterns,
  identifyBestPractices,
  generateRefactoringOpportunities,
} from "../services/patternDetection.js";

const router = express.Router();

/**
 * POST /api/code-quality/analyze/:username
 * Analyze code quality for a user's recent commits
 */
router.post("/analyze/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { repository, limit = 5, forceRefresh = false } = req.body;

    const user = await User.findOne({ githubUsername: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get GitHub token from user
    const githubToken = user.githubAccessToken;

    let repositories = [];
    
    if (repository) {
      // Analyze specific repository
      repositories = [repository];
    } else {
      // Get user's most active repositories from GitHub activities (only PushEvents = actual commits)
      const activities = await GitHubActivity.find({
        userId: user._id,
        activityType: "PushEvent",
      })
        .sort({ timestamp: -1 })
        .limit(100);

      // Count commits per repository to find most active ones
      const repoCommitCount = {};
      activities.forEach((activity) => {
        const commits = activity.details?.payload?.commits || [];
        // Only count commits where the user is the author
        const userCommits = commits.filter(
          (commit) => 
            commit.author?.name === user.name || 
            commit.author?.email === user.email ||
            commit.author?.username === username
        );
        
        if (userCommits.length > 0) {
          repoCommitCount[activity.repoName] = 
            (repoCommitCount[activity.repoName] || 0) + userCommits.length;
        }
      });

      // Sort repositories by commit count and take top 3
      repositories = Object.entries(repoCommitCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([repo]) => repo);
    }

    if (repositories.length === 0) {
      return res.status(404).json({
        error: "No repositories found for analysis",
      });
    }

    const results = [];

    for (const repoFullName of repositories) {
      const [owner, repo] = repoFullName.split("/");

      if (!owner || !repo) {
        console.error(`Invalid repository format: ${repoFullName}`);
        continue;
      }

      try {
        // Check if we have recent analysis (less than 24 hours old)
        if (!forceRefresh) {
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const existingAnalysis = await CodeQuality.find({
            userId: user._id,
            "repository.fullName": repoFullName,
            analyzedAt: { $gte: oneDayAgo },
          })
            .sort({ "commit.date": -1 })
            .limit(limit);

          if (existingAnalysis.length >= limit) {
            results.push({
              repository: repoFullName,
              commits: existingAnalysis,
              cached: true,
            });
            continue;
          }
        }

        // Perform fresh analysis (only analyze commits by this user)
        const analyzedCommits = await batchAnalyzeCommits(
          owner,
          repo,
          githubToken,
          limit,
          username  // Filter by author username
        );

        // Store results in database
        const savedCommits = [];
        for (const commit of analyzedCommits) {
          try {
            // Check if commit already analyzed
            const existing = await CodeQuality.findOne({
              "commit.sha": commit.sha,
            });

            if (existing && !forceRefresh) {
              savedCommits.push(existing);
              continue;
            }

            const codeQualityDoc = {
              userId: user._id,
              repository: {
                owner,
                name: repo,
                fullName: repoFullName,
              },
              commit: {
                sha: commit.sha,
                message: commit.message,
                author: commit.author,
                date: new Date(commit.date),
                url: commit.url,
              },
              stats: {
                additions: commit.stats?.additions || 0,
                deletions: commit.stats?.deletions || 0,
                totalChanges:
                  (commit.stats?.additions || 0) + (commit.stats?.deletions || 0),
                filesChanged: commit.filesChanged || 0,
              },
              analysis: commit.analysis,
              analyzedAt: new Date(),
            };

            if (existing) {
              // Update existing
              Object.assign(existing, codeQualityDoc);
              await existing.save();
              savedCommits.push(existing);
            } else {
              // Create new
              const newDoc = await CodeQuality.create(codeQualityDoc);
              savedCommits.push(newDoc);
            }
          } catch (saveError) {
            console.error(`Error saving commit ${commit.sha}:`, saveError.message);
          }
        }

        results.push({
          repository: repoFullName,
          commits: savedCommits,
          cached: false,
        });
      } catch (repoError) {
        console.error(`Error analyzing repository ${repoFullName}:`, repoError.message);
        results.push({
          repository: repoFullName,
          error: repoError.message,
        });
      }
    }

    res.json({
      username,
      repositoriesAnalyzed: results.length,
      results,
      analyzedAt: new Date(),
    });
  } catch (error) {
    console.error("Code quality analysis error:", error.message);
    res.status(500).json({
      error: "Failed to analyze code quality",
      details: error.message,
    });
  }
});

/**
 * GET /api/code-quality/insights/:username
 * Get code quality insights for a user
 */
router.get("/insights/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { repository, limit = 30 } = req.query;

    const user = await User.findOne({ githubUsername: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const query = { userId: user._id };
    if (repository) {
      query["repository.fullName"] = repository;
    }

    const insights = await CodeQuality.find(query)
      .sort({ "commit.date": -1 })
      .limit(parseInt(limit));

    if (insights.length === 0) {
      return res.status(404).json({
        error: "No code quality data found. Run analysis first.",
      });
    }

    // Generate timeline
    const timeline = generateQualityTimeline(
      insights.map((i) => ({
        date: i.commit.date,
        sha: i.commit.sha,
        message: i.commit.message,
        analysis: i.analysis,
      }))
    );

    // Calculate overall statistics
    const scores = insights.map((i) => i.analysis.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    const complexityDistribution = {
      Low: insights.filter((i) => i.analysis.complexity === "Low").length,
      Medium: insights.filter((i) => i.analysis.complexity === "Medium").length,
      High: insights.filter((i) => i.analysis.complexity === "High").length,
    };

    const testCoverageDistribution = {
      None: insights.filter((i) => i.analysis.testCoverage === "None").length,
      Partial: insights.filter((i) => i.analysis.testCoverage === "Partial").length,
      Good: insights.filter((i) => i.analysis.testCoverage === "Good").length,
    };

    // Collect all patterns and best practices
    const allPatterns = new Set();
    const allBestPractices = new Set();
    const allImprovements = new Set();

    insights.forEach((insight) => {
      insight.analysis.patterns?.forEach((p) => allPatterns.add(p));
      insight.analysis.bestPractices?.forEach((bp) => allBestPractices.add(bp));
      insight.analysis.improvements?.forEach((imp) => allImprovements.add(imp));
    });

    res.json({
      username,
      repository: repository || "all",
      summary: {
        totalCommitsAnalyzed: insights.length,
        averageScore: Math.round(avgScore),
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores),
        trend: timeline.summary.trend,
      },
      distributions: {
        complexity: complexityDistribution,
        testCoverage: testCoverageDistribution,
      },
      patterns: {
        designPatterns: Array.from(allPatterns),
        bestPractices: Array.from(allBestPractices),
        commonImprovements: Array.from(allImprovements),
      },
      timeline: timeline.timeline,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error("Code quality insights error:", error.message);
    res.status(500).json({
      error: "Failed to fetch code quality insights",
      details: error.message,
    });
  }
});

/**
 * GET /api/code-quality/timeline/:username
 * Get code quality timeline for visualization
 */
router.get("/timeline/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { repository, days = 90 } = req.query;

    const user = await User.findOne({ githubUsername: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const query = {
      userId: user._id,
      "commit.date": { $gte: startDate },
    };

    if (repository) {
      query["repository.fullName"] = repository;
    }

    const commits = await CodeQuality.find(query).sort({ "commit.date": 1 });

    if (commits.length === 0) {
      return res.status(404).json({
        error: "No code quality data found for the specified time range",
      });
    }

    const timeline = commits.map((commit) => ({
      date: commit.commit.date,
      sha: commit.commit.sha.substring(0, 7),
      message: commit.commit.message.split("\n")[0].substring(0, 60),
      repository: commit.repository.name,
      score: commit.analysis.score,
      complexity: commit.analysis.complexity,
      testCoverage: commit.analysis.testCoverage,
      patterns: commit.analysis.patterns || [],
      bestPractices: commit.analysis.bestPractices || [],
      improvements: commit.analysis.improvements || [],
      filesChanged: commit.stats.filesChanged,
      totalChanges: commit.stats.totalChanges,
    }));

    // Group by date for trend visualization
    const dailyScores = {};
    commits.forEach((commit) => {
      const dateKey = commit.commit.date.toISOString().split("T")[0];
      if (!dailyScores[dateKey]) {
        dailyScores[dateKey] = [];
      }
      dailyScores[dateKey].push(commit.analysis.score);
    });

    const trendData = Object.entries(dailyScores).map(([date, scores]) => ({
      date,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      commitCount: scores.length,
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
    }));

    res.json({
      username,
      repository: repository || "all",
      timeRange: {
        start: startDate,
        end: new Date(),
        days: parseInt(days),
      },
      timeline,
      trendData,
      summary: {
        totalCommits: commits.length,
        averageScore: Math.round(
          commits.reduce((sum, c) => sum + c.analysis.score, 0) / commits.length
        ),
      },
    });
  } catch (error) {
    console.error("Code quality timeline error:", error.message);
    res.status(500).json({
      error: "Failed to fetch code quality timeline",
      details: error.message,
    });
  }
});

/**
 * GET /api/code-quality/commit/:sha
 * Get detailed analysis for a specific commit
 */
router.get("/commit/:sha", async (req, res) => {
  try {
    const { sha } = req.params;

    const commit = await CodeQuality.findOne({ "commit.sha": sha });

    if (!commit) {
      return res.status(404).json({
        error: "Commit analysis not found",
      });
    }

    res.json(commit);
  } catch (error) {
    console.error("Commit detail error:", error.message);
    res.status(500).json({
      error: "Failed to fetch commit details",
      details: error.message,
    });
  }
});

/**
 * POST /api/code-quality/patterns/:username
 * Analyze design patterns and best practices for a specific commit
 */
router.post("/patterns/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { repository, sha } = req.body;

    if (!repository || !sha) {
      return res.status(400).json({
        error: "Repository and commit SHA are required",
      });
    }

    const user = await User.findOne({ githubUsername: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const githubToken = user.githubAccessToken;
    const [owner, repo] = repository.split("/");

    if (!owner || !repo) {
      return res.status(400).json({ error: "Invalid repository format" });
    }

    // Fetch commit data
    const commitData = await fetchCommitDiff(owner, repo, sha, githubToken);

    // Analyze patterns and best practices
    const [patterns, bestPractices, refactoring] = await Promise.all([
      detectDesignPatterns(commitData),
      identifyBestPractices(commitData),
      generateRefactoringOpportunities(commitData),
    ]);

    res.json({
      commit: {
        sha: commitData.sha,
        message: commitData.message,
        author: commitData.author,
        date: commitData.date,
      },
      patterns: patterns.patterns || [],
      bestPractices: bestPractices.bestPractices || [],
      refactoringOpportunities: refactoring.opportunities || [],
      aiPowered:
        patterns.aiPowered || bestPractices.aiPowered || refactoring.aiPowered,
      analyzedAt: new Date(),
    });
  } catch (error) {
    console.error("Pattern analysis error:", error.message);
    res.status(500).json({
      error: "Failed to analyze patterns",
      details: error.message,
    });
  }
});

/**
 * GET /api/code-quality/patterns-summary/:username
 * Get aggregated patterns and best practices across all analyzed commits
 */
router.get("/patterns-summary/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { repository, limit = 50 } = req.query;

    const user = await User.findOne({ githubUsername: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const query = { userId: user._id };
    if (repository) {
      query["repository.fullName"] = repository;
    }

    const commits = await CodeQuality.find(query)
      .sort({ "commit.date": -1 })
      .limit(parseInt(limit));

    if (commits.length === 0) {
      return res.status(404).json({
        error: "No code quality data found",
      });
    }

    // Aggregate patterns and best practices
    const patternFrequency = {};
    const bestPracticeFrequency = {};
    const improvementFrequency = {};

    commits.forEach((commit) => {
      // Count patterns
      commit.analysis.patterns?.forEach((pattern) => {
        patternFrequency[pattern] = (patternFrequency[pattern] || 0) + 1;
      });

      // Count best practices
      commit.analysis.bestPractices?.forEach((practice) => {
        bestPracticeFrequency[practice] =
          (bestPracticeFrequency[practice] || 0) + 1;
      });

      // Count improvements
      commit.analysis.improvements?.forEach((improvement) => {
        improvementFrequency[improvement] =
          (improvementFrequency[improvement] || 0) + 1;
      });
    });

    // Sort by frequency
    const topPatterns = Object.entries(patternFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pattern, count]) => ({
        pattern,
        count,
        percentage: ((count / commits.length) * 100).toFixed(1),
      }));

    const topBestPractices = Object.entries(bestPracticeFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([practice, count]) => ({
        practice,
        count,
        percentage: ((count / commits.length) * 100).toFixed(1),
      }));

    const commonImprovements = Object.entries(improvementFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([improvement, count]) => ({
        improvement,
        count,
        percentage: ((count / commits.length) * 100).toFixed(1),
      }));

    res.json({
      username,
      repository: repository || "all",
      commitsAnalyzed: commits.length,
      summary: {
        uniquePatterns: Object.keys(patternFrequency).length,
        uniqueBestPractices: Object.keys(bestPracticeFrequency).length,
        uniqueImprovements: Object.keys(improvementFrequency).length,
      },
      topPatterns,
      topBestPractices,
      commonImprovements,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error("Pattern summary error:", error.message);
    res.status(500).json({
      error: "Failed to generate pattern summary",
      details: error.message,
    });
  }
});

/**
 * DELETE /api/code-quality/cache/:username
 * Clear code quality cache for a user
 */
router.delete("/cache/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const { repository } = req.query;

    const user = await User.findOne({ githubUsername: username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const query = { userId: user._id };
    if (repository) {
      query["repository.fullName"] = repository;
    }

    const result = await CodeQuality.deleteMany(query);

    res.json({
      message: "Code quality cache cleared",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Cache clear error:", error.message);
    res.status(500).json({
      error: "Failed to clear cache",
      details: error.message,
    });
  }
});

export default router;

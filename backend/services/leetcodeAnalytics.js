import User from "../models/User.js";

/**
 * LeetCode Analytics Service
 * Computes statistics and insights from LeetCode activity data
 */

/**
 * Calculate difficulty distribution
 * @param {Object} leetcodeData - User's LeetCode data from User model
 * @returns {Object} Difficulty distribution statistics
 */
export function calculateDifficultyDistribution(leetcodeData) {
  if (!leetcodeData) {
    return {
      easy: { solved: 0, percentage: 0 },
      medium: { solved: 0, percentage: 0 },
      hard: { solved: 0, percentage: 0 },
      total: 0,
    };
  }

  const { easySolved = 0, mediumSolved = 0, hardSolved = 0, totalSolved = 0 } = leetcodeData;

  return {
    easy: {
      solved: easySolved,
      percentage: totalSolved > 0 ? ((easySolved / totalSolved) * 100).toFixed(2) : 0,
    },
    medium: {
      solved: mediumSolved,
      percentage: totalSolved > 0 ? ((mediumSolved / totalSolved) * 100).toFixed(2) : 0,
    },
    hard: {
      solved: hardSolved,
      percentage: totalSolved > 0 ? ((hardSolved / totalSolved) * 100).toFixed(2) : 0,
    },
    total: totalSolved,
    distribution: [
      { difficulty: "Easy", count: easySolved, color: "#00b8a3" },
      { difficulty: "Medium", count: mediumSolved, color: "#ffc01e" },
      { difficulty: "Hard", count: hardSolved, color: "#ef4743" },
    ],
  };
}

/**
 * Analyze problem-solving patterns and strengths
 * @param {Object} leetcodeData - User's LeetCode data
 * @returns {Object} Problem-solving insights
 */
export function analyzeProblemSolvingPatterns(leetcodeData) {
  if (!leetcodeData) {
    return {
      strengths: [],
      focusAreas: [],
      skillLevel: "Beginner",
    };
  }

  const { easySolved = 0, mediumSolved = 0, hardSolved = 0, totalSolved = 0 } = leetcodeData;

  const strengths = [];
  const focusAreas = [];

  // Determine strengths based on solved problems
  if (easySolved > 50) {
    strengths.push("Strong foundation in basic algorithms");
  }
  if (mediumSolved > 30) {
    strengths.push("Proficient in intermediate problem-solving");
  }
  if (hardSolved > 10) {
    strengths.push("Advanced problem-solving capabilities");
  }
  if (totalSolved > 100) {
    strengths.push("Consistent practice and dedication");
  }

  // Identify focus areas
  if (easySolved < 30) {
    focusAreas.push("Build stronger foundation with easy problems");
  }
  if (mediumSolved < 20 && easySolved > 30) {
    focusAreas.push("Progress to medium difficulty problems");
  }
  if (hardSolved < 5 && mediumSolved > 30) {
    focusAreas.push("Challenge yourself with hard problems");
  }

  // Determine skill level
  let skillLevel = "Beginner";
  if (totalSolved > 200 && hardSolved > 20) {
    skillLevel = "Advanced";
  } else if (totalSolved > 100 && mediumSolved > 30) {
    skillLevel = "Intermediate";
  } else if (totalSolved > 50) {
    skillLevel = "Developing";
  }

  return {
    strengths: strengths.length > 0 ? strengths : ["Starting your LeetCode journey"],
    focusAreas: focusAreas.length > 0 ? focusAreas : ["Continue solving problems consistently"],
    skillLevel,
    totalSolved,
  };
}

/**
 * Analyze topic frequency (estimated based on difficulty distribution)
 * Note: This is a simplified version. Full implementation would require
 * storing individual problem submissions with topic tags.
 * @param {Object} leetcodeData - User's LeetCode data
 * @returns {Object} Topic analysis
 */
export function analyzeTopicFrequency(leetcodeData) {
  if (!leetcodeData || !leetcodeData.totalSolved) {
    return {
      estimatedTopics: [],
      note: "Topic analysis requires individual problem submission data",
    };
  }

  const { easySolved = 0, mediumSolved = 0, hardSolved = 0 } = leetcodeData;

  // Estimated topic distribution based on typical LeetCode patterns
  const estimatedTopics = [
    {
      topic: "Arrays & Strings",
      estimatedCount: Math.floor(easySolved * 0.4 + mediumSolved * 0.3),
      difficulty: "Easy to Medium",
    },
    {
      topic: "Hash Tables",
      estimatedCount: Math.floor(easySolved * 0.2 + mediumSolved * 0.2),
      difficulty: "Easy to Medium",
    },
    {
      topic: "Dynamic Programming",
      estimatedCount: Math.floor(mediumSolved * 0.3 + hardSolved * 0.4),
      difficulty: "Medium to Hard",
    },
    {
      topic: "Trees & Graphs",
      estimatedCount: Math.floor(mediumSolved * 0.25 + hardSolved * 0.3),
      difficulty: "Medium to Hard",
    },
    {
      topic: "Linked Lists",
      estimatedCount: Math.floor(easySolved * 0.15 + mediumSolved * 0.1),
      difficulty: "Easy to Medium",
    },
  ].filter((topic) => topic.estimatedCount > 0)
    .sort((a, b) => b.estimatedCount - a.estimatedCount);

  return {
    estimatedTopics,
    note: "Topic estimates based on typical difficulty patterns. For accurate data, store individual submissions.",
  };
}

/**
 * Calculate problem-solving velocity trends
 * Note: This is simplified. Full implementation would track submission timestamps.
 * @param {Object} leetcodeData - User's LeetCode data
 * @param {Object} previousData - Previous snapshot of LeetCode data (if available)
 * @returns {Object} Velocity trends
 */
export function calculateVelocityTrends(leetcodeData, previousData = null) {
  if (!leetcodeData) {
    return {
      currentVelocity: 0,
      trend: "stable",
      message: "No data available",
    };
  }

  const currentTotal = leetcodeData.totalSolved || 0;

  if (!previousData) {
    return {
      currentVelocity: currentTotal,
      trend: "stable",
      message: "Baseline established. Continue solving to track trends.",
      estimatedProblemsPerWeek: 0,
    };
  }

  const previousTotal = previousData.totalSolved || 0;
  const problemsGained = currentTotal - previousTotal;

  let trend = "stable";
  if (problemsGained > 5) {
    trend = "increasing";
  } else if (problemsGained < 0) {
    trend = "decreasing";
  }

  return {
    currentVelocity: currentTotal,
    problemsGained,
    trend,
    message: getTrendMessage(trend, problemsGained),
    estimatedProblemsPerWeek: problemsGained > 0 ? problemsGained : 0,
  };
}

/**
 * Get trend message based on velocity
 * @param {string} trend - Trend direction
 * @param {number} problemsGained - Number of problems gained
 * @returns {string} Human-readable message
 */
function getTrendMessage(trend, problemsGained) {
  if (trend === "increasing") {
    return `Great progress! You've solved ${problemsGained} more problems recently.`;
  } else if (trend === "decreasing") {
    return "Activity has decreased. Try to maintain consistent practice.";
  } else {
    return "Maintaining steady progress. Keep up the good work!";
  }
}

/**
 * Calculate success rate estimation
 * @param {Object} leetcodeData - User's LeetCode data
 * @returns {Object} Success rate metrics
 */
export function calculateSuccessRate(leetcodeData) {
  if (!leetcodeData || !leetcodeData.totalSolved) {
    return {
      overallSuccessRate: 0,
      byDifficulty: {
        easy: 0,
        medium: 0,
        hard: 0,
      },
      note: "Success rate requires submission attempt data",
    };
  }

  const { easySolved = 0, mediumSolved = 0, hardSolved = 0 } = leetcodeData;

  // Estimated success rates (actual rates would require submission attempt data)
  const easyRate = easySolved > 0 ? 85 : 0;
  const mediumRate = mediumSolved > 0 ? 65 : 0;
  const hardRate = hardSolved > 0 ? 40 : 0;

  const totalProblems = easySolved + mediumSolved + hardSolved;
  const weightedRate = totalProblems > 0
    ? ((easySolved * easyRate + mediumSolved * mediumRate + hardSolved * hardRate) / totalProblems).toFixed(2)
    : 0;

  return {
    overallSuccessRate: weightedRate,
    byDifficulty: {
      easy: easyRate,
      medium: mediumRate,
      hard: hardRate,
    },
    note: "Estimated rates based on typical patterns. Actual rates require submission data.",
  };
}

/**
 * Get comprehensive LeetCode analytics
 * @param {string} userId - User's MongoDB ObjectId
 * @param {Object} previousData - Optional previous snapshot for trend analysis
 * @returns {Object} Complete LeetCode analytics
 */
export async function getLeetCodeAnalytics(userId, previousData = null) {
  const user = await User.findById(userId);
  
  if (!user || !user.leetcodeData) {
    return {
      error: "No LeetCode data found for user",
      hasData: false,
    };
  }

  const leetcodeData = user.leetcodeData;

  const [
    difficultyDist,
    patterns,
    topics,
    velocity,
    successRate,
  ] = await Promise.all([
    Promise.resolve(calculateDifficultyDistribution(leetcodeData)),
    Promise.resolve(analyzeProblemSolvingPatterns(leetcodeData)),
    Promise.resolve(analyzeTopicFrequency(leetcodeData)),
    Promise.resolve(calculateVelocityTrends(leetcodeData, previousData)),
    Promise.resolve(calculateSuccessRate(leetcodeData)),
  ]);

  return {
    hasData: true,
    username: user.leetcodeUsername,
    ranking: leetcodeData.ranking,
    difficultyDistribution: difficultyDist,
    problemSolvingPatterns: patterns,
    topicAnalysis: topics,
    velocityTrends: velocity,
    successRates: successRate,
    generatedAt: new Date(),
  };
}

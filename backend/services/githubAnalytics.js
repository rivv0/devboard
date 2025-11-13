import GitHubActivity from "../models/GithubActivity.js";

/**
 * GitHub Analytics Service
 * Computes statistics and insights from GitHub activity data
 */

/**
 * Calculate commit statistics for different time ranges
 * @param {string} userId - User's MongoDB ObjectId
 * @param {Date} startDate - Start date for analysis
 * @param {Date} endDate - End date for analysis
 * @returns {Object} Commit statistics
 */
export async function calculateCommitStats(userId, startDate, endDate) {
  const activities = await GitHubActivity.find({
    userId,
    activityType: "PushEvent",
    timestamp: { $gte: startDate, $lte: endDate },
  }).sort({ timestamp: 1 });

  // Count total commits
  let totalCommits = 0;
  const commitsByDay = {};
  const commitsByRepo = {};

  activities.forEach((activity) => {
    const commits = activity.details?.payload?.commits || [];
    totalCommits += commits.length;

    // Group by day
    const day = activity.timestamp.toISOString().split("T")[0];
    commitsByDay[day] = (commitsByDay[day] || 0) + commits.length;

    // Group by repository
    const repo = activity.repoName;
    commitsByRepo[repo] = (commitsByRepo[repo] || 0) + commits.length;
  });

  return {
    totalCommits,
    commitsByDay,
    commitsByRepo,
    averageCommitsPerDay: totalCommits / Math.max(1, Object.keys(commitsByDay).length),
  };
}

/**
 * Calculate daily, weekly, and monthly commit statistics
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {Object} Time-based commit statistics
 */
export async function calculateTimeBasedStats(userId) {
  const now = new Date();
  
  // Daily stats (last 24 hours)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dailyStats = await calculateCommitStats(userId, oneDayAgo, now);

  // Weekly stats (last 7 days)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weeklyStats = await calculateCommitStats(userId, oneWeekAgo, now);

  // Monthly stats (last 30 days)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthlyStats = await calculateCommitStats(userId, oneMonthAgo, now);

  return {
    daily: {
      commits: dailyStats.totalCommits,
      repositories: Object.keys(dailyStats.commitsByRepo).length,
    },
    weekly: {
      commits: weeklyStats.totalCommits,
      repositories: Object.keys(weeklyStats.commitsByRepo).length,
      averagePerDay: (weeklyStats.totalCommits / 7).toFixed(2),
    },
    monthly: {
      commits: monthlyStats.totalCommits,
      repositories: Object.keys(monthlyStats.commitsByRepo).length,
      averagePerDay: (monthlyStats.totalCommits / 30).toFixed(2),
      commitsByDay: monthlyStats.commitsByDay,
    },
  };
}

/**
 * Calculate language distribution from repository events
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {Object} Language distribution statistics
 */
export async function calculateLanguageDistribution(userId) {
  const activities = await GitHubActivity.find({
    userId,
    activityType: { $in: ["PushEvent", "CreateEvent"] },
  });

  const languageCount = {};
  const repoLanguages = new Set();

  activities.forEach((activity) => {
    // Extract language from repository details if available
    const language = activity.details?.repo?.language || 
                     activity.details?.payload?.repository?.language;
    
    if (language) {
      languageCount[language] = (languageCount[language] || 0) + 1;
      repoLanguages.add(`${activity.repoName}-${language}`);
    }
  });

  // Calculate percentages
  const totalActivities = Object.values(languageCount).reduce((a, b) => a + b, 0);
  const languageDistribution = Object.entries(languageCount).map(([name, count]) => ({
    name,
    count,
    percentage: ((count / totalActivities) * 100).toFixed(2),
  })).sort((a, b) => b.count - a.count);

  return {
    languages: languageDistribution,
    totalLanguages: Object.keys(languageCount).length,
    topLanguage: languageDistribution[0]?.name || "N/A",
  };
}

/**
 * Calculate repository metrics
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {Object} Repository statistics
 */
export async function calculateRepositoryMetrics(userId) {
  const activities = await GitHubActivity.find({ userId });

  const repoStats = {};
  const repoTypes = {
    created: 0,
    forked: 0,
    contributed: 0,
  };

  activities.forEach((activity) => {
    const repoName = activity.repoName;
    
    if (!repoStats[repoName]) {
      repoStats[repoName] = {
        name: repoName,
        commits: 0,
        pullRequests: 0,
        issues: 0,
        lastActivity: activity.timestamp,
      };
    }

    // Update stats based on activity type
    switch (activity.activityType) {
      case "PushEvent":
        const commits = activity.details?.payload?.commits?.length || 0;
        repoStats[repoName].commits += commits;
        break;
      case "PullRequestEvent":
        repoStats[repoName].pullRequests += 1;
        break;
      case "IssuesEvent":
        repoStats[repoName].issues += 1;
        break;
      case "CreateEvent":
        if (activity.details?.payload?.ref_type === "repository") {
          repoTypes.created += 1;
        }
        break;
      case "ForkEvent":
        repoTypes.forked += 1;
        break;
    }

    // Update last activity
    if (activity.timestamp > repoStats[repoName].lastActivity) {
      repoStats[repoName].lastActivity = activity.timestamp;
    }
  });

  const repositories = Object.values(repoStats).sort((a, b) => b.commits - a.commits);

  return {
    totalRepositories: repositories.length,
    repositoriesCreated: repoTypes.created,
    repositoriesForked: repoTypes.forked,
    mostActiveRepos: repositories.slice(0, 5),
    totalPullRequests: repositories.reduce((sum, repo) => sum + repo.pullRequests, 0),
    totalIssues: repositories.reduce((sum, repo) => sum + repo.issues, 0),
  };
}

/**
 * Identify most productive coding hours from commit timestamps
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {Object} Productivity patterns by hour
 */
export async function identifyProductiveHours(userId) {
  const activities = await GitHubActivity.find({
    userId,
    activityType: "PushEvent",
  });

  const hourlyCommits = Array(24).fill(0);
  const dayOfWeekCommits = Array(7).fill(0);

  activities.forEach((activity) => {
    const timestamp = new Date(activity.timestamp);
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay(); // 0 = Sunday, 6 = Saturday
    
    const commits = activity.details?.payload?.commits?.length || 0;
    hourlyCommits[hour] += commits;
    dayOfWeekCommits[dayOfWeek] += commits;
  });

  // Find peak hours
  const maxCommits = Math.max(...hourlyCommits);
  const peakHours = hourlyCommits
    .map((count, hour) => ({ hour, count }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Find peak days
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const peakDays = dayOfWeekCommits
    .map((count, day) => ({ day: dayNames[day], count }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    hourlyDistribution: hourlyCommits.map((count, hour) => ({
      hour,
      commits: count,
      percentage: maxCommits > 0 ? ((count / maxCommits) * 100).toFixed(2) : 0,
    })),
    peakHours: peakHours.map((item) => ({
      hour: item.hour,
      timeRange: `${item.hour}:00 - ${item.hour + 1}:00`,
      commits: item.count,
    })),
    dayOfWeekDistribution: dayOfWeekCommits.map((count, day) => ({
      day: dayNames[day],
      commits: count,
    })),
    peakDays,
    mostProductiveHour: peakHours[0]?.hour || 0,
    mostProductiveDay: peakDays[0]?.day || "N/A",
  };
}

/**
 * Get comprehensive GitHub analytics
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {Object} Complete GitHub analytics
 */
export async function getGitHubAnalytics(userId) {
  const [timeStats, languages, repoMetrics, productiveHours] = await Promise.all([
    calculateTimeBasedStats(userId),
    calculateLanguageDistribution(userId),
    calculateRepositoryMetrics(userId),
    identifyProductiveHours(userId),
  ]);

  return {
    timeBasedStats: timeStats,
    languageDistribution: languages,
    repositoryMetrics: repoMetrics,
    productivityPatterns: productiveHours,
    generatedAt: new Date(),
  };
}

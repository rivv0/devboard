/**
 * GitHub Wrapped - Spotify Wrapped style year in review for developers
 * Generates fun, shareable stats about a developer's year
 */

/**
 * Generate GitHub Wrapped summary
 * @param {Object} userData - User data
 * @param {Array} githubActivity - GitHub activity data
 * @param {Object} leetcodeData - LeetCode statistics
 * @param {Object} analytics - Computed analytics
 * @returns {Object} Wrapped summary with stats and insights
 */
export function generateGitHubWrapped(userData, githubActivity, leetcodeData, analytics) {
  const year = new Date().getFullYear();
  
  return {
    year,
    user: {
      username: userData.githubUsername,
      avatar: userData.avatar || null,
    },
    stats: generateStats(githubActivity, leetcodeData),
    topLanguages: getTopLanguages(githubActivity, analytics),
    topProjects: getTopProjects(githubActivity),
    codingPersonality: determineCodingPersonality(githubActivity, leetcodeData),
    achievements: generateWrappedAchievements(githubActivity, leetcodeData),
    funFacts: generateFunFacts(githubActivity, leetcodeData),
    monthlyBreakdown: getMonthlyBreakdown(githubActivity),
    comparisons: generateComparisons(githubActivity, leetcodeData),
    predictions: generatePredictions(githubActivity, leetcodeData),
    shareableQuotes: generateShareableQuotes(githubActivity, leetcodeData, userData),
    generatedAt: new Date(),
  };
}

/**
 * Generate core statistics
 */
function generateStats(githubActivity, leetcodeData) {
  const commits = githubActivity.filter(a => a.activityType === "PushEvent");
  const prs = githubActivity.filter(a => a.activityType === "PullRequestEvent");
  const issues = githubActivity.filter(a => a.activityType === "IssuesEvent");
  const repos = [...new Set(githubActivity.map(a => a.repoName))];
  
  // Calculate streaks
  const streak = calculateLongestStreak(githubActivity);
  const currentStreak = calculateCurrentStreak(githubActivity);
  
  // Time analysis
  const timeStats = analyzeTimePatterns(githubActivity);
  
  return {
    totalCommits: commits.length,
    totalPRs: prs.length,
    totalIssues: issues.length,
    totalRepos: repos.length,
    longestStreak: streak,
    currentStreak: currentStreak,
    mostProductiveDay: timeStats.mostProductiveDay,
    mostProductiveHour: timeStats.mostProductiveHour,
    totalDaysActive: timeStats.activeDays,
    leetcode: {
      totalSolved: leetcodeData?.totalSolved || 0,
      easy: leetcodeData?.easySolved || 0,
      medium: leetcodeData?.mediumSolved || 0,
      hard: leetcodeData?.hardSolved || 0,
    },
  };
}

/**
 * Get top languages
 */
function getTopLanguages(githubActivity, analytics) {
  // Simplified - in production, fetch from GitHub API
  const languageHints = {
    "react": { name: "JavaScript", color: "#f1e05a", icon: "⚛️" },
    "node": { name: "Node.js", color: "#68a063", icon: "🟢" },
    "python": { name: "Python", color: "#3572A5", icon: "🐍" },
    "typescript": { name: "TypeScript", color: "#2b7489", icon: "📘" },
    "java": { name: "Java", color: "#b07219", icon: "☕" },
    "go": { name: "Go", color: "#00ADD8", icon: "🔵" },
  };
  
  const languages = {};
  githubActivity.forEach(a => {
    const repoName = a.repoName.toLowerCase();
    Object.keys(languageHints).forEach(hint => {
      if (repoName.includes(hint)) {
        if (!languages[hint]) {
          languages[hint] = { ...languageHints[hint], count: 0 };
        }
        languages[hint].count++;
      }
    });
  });
  
  return Object.values(languages)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((lang, index) => ({
      ...lang,
      rank: index + 1,
      percentage: ((lang.count / githubActivity.length) * 100).toFixed(1),
    }));
}

/**
 * Get top projects
 */
function getTopProjects(githubActivity) {
  const repoActivity = {};
  
  githubActivity.forEach(a => {
    if (!repoActivity[a.repoName]) {
      repoActivity[a.repoName] = {
        name: a.repoName,
        commits: 0,
        lastActivity: a.timestamp,
      };
    }
    repoActivity[a.repoName].commits++;
    if (new Date(a.timestamp) > new Date(repoActivity[a.repoName].lastActivity)) {
      repoActivity[a.repoName].lastActivity = a.timestamp;
    }
  });
  
  return Object.values(repoActivity)
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 5)
    .map((repo, index) => ({
      ...repo,
      rank: index + 1,
    }));
}

/**
 * Determine coding personality
 */
function determineCodingPersonality(githubActivity, leetcodeData) {
  const timeStats = analyzeTimePatterns(githubActivity);
  const commits = githubActivity.filter(a => a.activityType === "PushEvent").length;
  const avgCommitsPerDay = commits / timeStats.activeDays;
  
  let personality = {
    type: "",
    description: "",
    traits: [],
    emoji: "",
  };
  
  // Determine personality type
  if (timeStats.mostProductiveHour >= 22 || timeStats.mostProductiveHour <= 4) {
    personality.type = "Night Owl 🌙";
    personality.description = "You do your best work when the world is asleep";
    personality.traits = ["Creative", "Independent", "Deep Focus"];
    personality.emoji = "🌙";
  } else if (timeStats.mostProductiveHour >= 5 && timeStats.mostProductiveHour <= 8) {
    personality.type = "Early Bird 🌅";
    personality.description = "You conquer code before breakfast";
    personality.traits = ["Disciplined", "Proactive", "Energetic"];
    personality.emoji = "🌅";
  } else {
    personality.type = "Balanced Coder ⚖️";
    personality.description = "You maintain a healthy coding rhythm";
    personality.traits = ["Consistent", "Adaptable", "Sustainable"];
    personality.emoji = "⚖️";
  }
  
  // Add more traits based on activity
  if (avgCommitsPerDay >= 3) {
    personality.traits.push("Highly Productive");
  }
  
  if (leetcodeData?.hardSolved >= 10) {
    personality.traits.push("Problem Solver");
  }
  
  if (timeStats.weekendActivity > timeStats.weekdayActivity * 0.3) {
    personality.traits.push("Passionate");
  }
  
  return personality;
}

/**
 * Generate wrapped-specific achievements
 */
function generateWrappedAchievements(githubActivity, leetcodeData) {
  const achievements = [];
  const commits = githubActivity.filter(a => a.activityType === "PushEvent").length;
  
  // Commit milestones
  if (commits >= 365) {
    achievements.push({
      title: "Daily Devotion",
      description: "Averaged more than 1 commit per day",
      icon: "🔥",
      rarity: "legendary",
    });
  } else if (commits >= 100) {
    achievements.push({
      title: "Consistent Contributor",
      description: `${commits} commits this year`,
      icon: "💪",
      rarity: "rare",
    });
  }
  
  // LeetCode achievements
  if (leetcodeData?.totalSolved >= 200) {
    achievements.push({
      title: "LeetCode Legend",
      description: `Solved ${leetcodeData.totalSolved} problems`,
      icon: "🏆",
      rarity: "legendary",
    });
  } else if (leetcodeData?.totalSolved >= 100) {
    achievements.push({
      title: "Problem Crusher",
      description: `Solved ${leetcodeData.totalSolved} problems`,
      icon: "💯",
      rarity: "rare",
    });
  }
  
  if (leetcodeData?.hardSolved >= 20) {
    achievements.push({
      title: "Algorithm Master",
      description: `Conquered ${leetcodeData.hardSolved} hard problems`,
      icon: "🧠",
      rarity: "epic",
    });
  }
  
  // Streak achievements
  const streak = calculateLongestStreak(githubActivity);
  if (streak >= 30) {
    achievements.push({
      title: "Unstoppable",
      description: `${streak}-day coding streak`,
      icon: "⚡",
      rarity: "epic",
    });
  }
  
  return achievements;
}

/**
 * Generate fun facts
 */
function generateFunFacts(githubActivity, leetcodeData) {
  const facts = [];
  const commits = githubActivity.filter(a => a.activityType === "PushEvent").length;
  const timeStats = analyzeTimePatterns(githubActivity);
  
  // Lines of code estimate (rough)
  const estimatedLines = commits * 50; // Average 50 lines per commit
  facts.push({
    fact: `You wrote approximately ${estimatedLines.toLocaleString()} lines of code`,
    comparison: `That's ${Math.floor(estimatedLines / 500)} pages of a novel!`,
    icon: "📝",
  });
  
  // Time spent coding estimate
  const estimatedHours = commits * 0.5; // Average 30 min per commit
  facts.push({
    fact: `You spent about ${Math.floor(estimatedHours)} hours coding`,
    comparison: `That's ${Math.floor(estimatedHours / 24)} days of your life!`,
    icon: "⏰",
  });
  
  // Most productive time
  const hourLabels = {
    0: "midnight", 1: "1 AM", 2: "2 AM", 3: "3 AM", 4: "4 AM", 5: "5 AM",
    6: "6 AM", 7: "7 AM", 8: "8 AM", 9: "9 AM", 10: "10 AM", 11: "11 AM",
    12: "noon", 13: "1 PM", 14: "2 PM", 15: "3 PM", 16: "4 PM", 17: "5 PM",
    18: "6 PM", 19: "7 PM", 20: "8 PM", 21: "9 PM", 22: "10 PM", 23: "11 PM",
  };
  
  facts.push({
    fact: `Your peak coding hour is ${hourLabels[timeStats.mostProductiveHour]}`,
    comparison: timeStats.mostProductiveHour >= 22 || timeStats.mostProductiveHour <= 4 
      ? "You're a true night owl! 🦉" 
      : "Perfect timing for maximum productivity!",
    icon: "🕐",
  });
  
  // LeetCode facts
  if (leetcodeData?.totalSolved > 0) {
    const avgDifficulty = (
      (leetcodeData.easySolved * 1 + leetcodeData.mediumSolved * 2 + leetcodeData.hardSolved * 3) /
      leetcodeData.totalSolved
    ).toFixed(1);
    
    facts.push({
      fact: `Your average problem difficulty is ${avgDifficulty}/3.0`,
      comparison: avgDifficulty >= 2.0 ? "You love a challenge!" : "Building a strong foundation!",
      icon: "🎯",
    });
  }
  
  // Weekend warrior
  if (timeStats.weekendActivity > timeStats.weekdayActivity * 0.4) {
    facts.push({
      fact: "You're a weekend warrior",
      comparison: `${((timeStats.weekendActivity / githubActivity.length) * 100).toFixed(0)}% of your commits happen on weekends`,
      icon: "🎮",
    });
  }
  
  return facts;
}

/**
 * Get monthly breakdown
 */
function getMonthlyBreakdown(githubActivity) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  const monthlyData = new Array(12).fill(0).map((_, i) => ({
    month: months[i],
    commits: 0,
    prs: 0,
  }));
  
  githubActivity.forEach(a => {
    const month = new Date(a.timestamp).getMonth();
    if (a.activityType === "PushEvent") {
      monthlyData[month].commits++;
    } else if (a.activityType === "PullRequestEvent") {
      monthlyData[month].prs++;
    }
  });
  
  // Find best month
  const bestMonth = monthlyData.reduce((best, current, index) => {
    return current.commits > best.commits ? { ...current, index } : best;
  }, { commits: 0, index: 0 });
  
  return {
    monthly: monthlyData,
    bestMonth: {
      name: months[bestMonth.index],
      commits: bestMonth.commits,
    },
  };
}

/**
 * Generate comparisons
 */
function generateComparisons(githubActivity, leetcodeData) {
  const commits = githubActivity.filter(a => a.activityType === "PushEvent").length;
  
  return [
    {
      metric: "Commits",
      value: commits,
      comparison: commits >= 365 ? "Top 10% of developers" : commits >= 100 ? "Above average" : "Keep building!",
      percentile: commits >= 365 ? 90 : commits >= 100 ? 60 : 40,
    },
    {
      metric: "LeetCode Problems",
      value: leetcodeData?.totalSolved || 0,
      comparison: (leetcodeData?.totalSolved || 0) >= 200 ? "Elite problem solver" : (leetcodeData?.totalSolved || 0) >= 50 ? "Strong foundation" : "Just getting started",
      percentile: (leetcodeData?.totalSolved || 0) >= 200 ? 95 : (leetcodeData?.totalSolved || 0) >= 50 ? 70 : 30,
    },
  ];
}

/**
 * Generate predictions for next year
 */
function generatePredictions(githubActivity, leetcodeData) {
  const commits = githubActivity.filter(a => a.activityType === "PushEvent").length;
  const timeStats = analyzeTimePatterns(githubActivity);
  const avgCommitsPerDay = commits / timeStats.activeDays;
  
  return {
    nextYearCommits: Math.round(avgCommitsPerDay * 365 * 1.2), // 20% growth
    nextYearLeetCode: Math.round((leetcodeData?.totalSolved || 0) * 1.5),
    suggestedGoals: [
      `Reach ${Math.round(commits * 1.5)} commits`,
      `Solve ${Math.round((leetcodeData?.totalSolved || 0) + 50)} more problems`,
      "Contribute to 3 open source projects",
      "Learn a new programming language",
    ],
  };
}

/**
 * Generate shareable quotes
 */
function generateShareableQuotes(githubActivity, leetcodeData, userData) {
  const commits = githubActivity.filter(a => a.activityType === "PushEvent").length;
  const year = new Date().getFullYear();
  
  return [
    `In ${year}, I made ${commits} commits and solved ${leetcodeData?.totalSolved || 0} coding problems. 💪`,
    `My GitHub Wrapped: ${commits} commits, ${leetcodeData?.hardSolved || 0} hard problems conquered. 🚀`,
    `${year} was a year of growth: ${commits} commits across ${[...new Set(githubActivity.map(a => a.repoName))].length} projects. 📈`,
  ];
}

/**
 * Helper: Calculate longest streak
 */
function calculateLongestStreak(activity) {
  if (activity.length === 0) return 0;
  
  const dates = activity
    .map(a => new Date(a.timestamp).toDateString())
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort();
  
  let longest = 1;
  let current = 1;
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  
  return longest;
}

/**
 * Helper: Calculate current streak
 */
function calculateCurrentStreak(activity) {
  if (activity.length === 0) return 0;
  
  const dates = activity
    .map(a => new Date(a.timestamp).toDateString())
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort()
    .reverse();
  
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Helper: Analyze time patterns
 */
function analyzeTimePatterns(activity) {
  const hourCounts = new Array(24).fill(0);
  const dayCounts = new Array(7).fill(0);
  const uniqueDays = new Set();
  let weekendActivity = 0;
  let weekdayActivity = 0;
  
  activity.forEach(a => {
    const date = new Date(a.timestamp);
    hourCounts[date.getHours()]++;
    dayCounts[date.getDay()]++;
    uniqueDays.add(date.toDateString());
    
    if (date.getDay() === 0 || date.getDay() === 6) {
      weekendActivity++;
    } else {
      weekdayActivity++;
    }
  });
  
  const mostProductiveHour = hourCounts.indexOf(Math.max(...hourCounts));
  const mostProductiveDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    dayCounts.indexOf(Math.max(...dayCounts))
  ];
  
  return {
    mostProductiveHour,
    mostProductiveDay,
    activeDays: uniqueDays.size,
    weekendActivity,
    weekdayActivity,
  };
}

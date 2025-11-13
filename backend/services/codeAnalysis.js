import OpenAI from "openai";
import axios from "axios";
import {
  detectDesignPatterns,
  identifyBestPractices,
  generateRefactoringOpportunities,
  generateComprehensiveInsights,
} from "./patternDetection.js";

/**
 * Code Analysis Service
 * Provides AI-powered code quality insights using OpenAI API
 */

// Initialize OpenAI client (will use OPENAI_API_KEY from environment)
let openai = null;

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

/**
 * Fetch commit diffs from GitHub API
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} sha - Commit SHA
 * @param {string} githubToken - GitHub access token
 * @returns {Promise<Object>} Commit data with diff
 */
export async function fetchCommitDiff(owner, repo, sha, githubToken) {
  try {
    const headers = {
      Accept: "application/vnd.github.v3+json",
    };
    
    if (githubToken) {
      headers.Authorization = `token ${githubToken}`;
    }

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`,
      { headers }
    );

    return {
      sha: response.data.sha,
      message: response.data.commit.message,
      author: response.data.commit.author.name,
      date: response.data.commit.author.date,
      stats: response.data.stats,
      files: response.data.files.map((file) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch || "",
      })),
    };
  } catch (error) {
    console.error(`Error fetching commit diff for ${sha}:`, error.message);
    throw new Error(`Failed to fetch commit diff: ${error.message}`);
  }
}

/**
 * Fetch multiple commits for a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} githubToken - GitHub access token
 * @param {number} limit - Number of commits to fetch
 * @param {string} authorUsername - Optional: filter by author's GitHub username
 * @returns {Promise<Array>} Array of commit data
 */
export async function fetchRecentCommits(owner, repo, githubToken, limit = 10, authorUsername = null) {
  try {
    const headers = {
      Accept: "application/vnd.github.v3+json",
    };
    
    if (githubToken) {
      headers.Authorization = `token ${githubToken}`;
    }

    const params = { per_page: limit * 3 }; // Fetch more to filter by author
    
    // Add author filter if provided
    if (authorUsername) {
      params.author = authorUsername;
    }

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers,
        params,
      }
    );

    const commits = response.data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author.name,
      authorLogin: commit.author?.login || null,
      date: commit.commit.author.date,
      url: commit.html_url,
    }));

    // Filter by author username if provided and limit results
    if (authorUsername) {
      return commits
        .filter((commit) => commit.authorLogin === authorUsername)
        .slice(0, limit);
    }

    return commits.slice(0, limit);
  } catch (error) {
    console.error(`Error fetching commits for ${owner}/${repo}:`, error.message);
    throw new Error(`Failed to fetch commits: ${error.message}`);
  }
}

/**
 * Analyze code quality using AI
 * @param {Object} commitData - Commit data with diffs
 * @returns {Promise<Object>} Code quality analysis
 */
export async function analyzeCodeQuality(commitData) {
  const client = getOpenAIClient();
  
  if (!client) {
    // Return basic analysis without AI if no API key
    return generateBasicAnalysis(commitData);
  }

  try {
    // Prepare code context for analysis
    const codeContext = prepareCodeContext(commitData);
    
    // Limit context size to avoid token limits
    const truncatedContext = codeContext.substring(0, 8000);

    const prompt = `Analyze the following code commit and provide insights on code quality:

Commit Message: ${commitData.message}
Files Changed: ${commitData.files.length}
Additions: ${commitData.stats.additions}
Deletions: ${commitData.stats.deletions}

Code Changes:
${truncatedContext}

Please provide:
1. Overall code quality score (0-100)
2. Complexity assessment (Low/Medium/High)
3. Design patterns identified (if any)
4. Best practices demonstrated
5. Potential improvements or refactoring opportunities
6. Test coverage indicators (if visible)

Format your response as JSON with the following structure:
{
  "score": <number>,
  "complexity": "<Low|Medium|High>",
  "patterns": ["pattern1", "pattern2"],
  "bestPractices": ["practice1", "practice2"],
  "improvements": ["improvement1", "improvement2"],
  "testCoverage": "<None|Partial|Good>",
  "summary": "<brief summary>"
}`;

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert code reviewer specializing in software quality analysis. Provide constructive, actionable feedback.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0].message.content;
    
    // Try to parse JSON response
    try {
      const analysis = JSON.parse(responseText);
      return {
        ...analysis,
        aiPowered: true,
        model: "gpt-3.5-turbo",
      };
    } catch (parseError) {
      // If JSON parsing fails, extract information from text
      return parseTextResponse(responseText, commitData);
    }
  } catch (error) {
    console.error("Error in AI code analysis:", error.message);
    // Fallback to basic analysis
    return generateBasicAnalysis(commitData);
  }
}

/**
 * Prepare code context from commit data
 * @param {Object} commitData - Commit data
 * @returns {string} Formatted code context
 */
function prepareCodeContext(commitData) {
  let context = "";
  
  for (const file of commitData.files.slice(0, 5)) { // Limit to 5 files
    context += `\n--- ${file.filename} (${file.status}) ---\n`;
    if (file.patch) {
      context += file.patch.substring(0, 1000); // Limit patch size
      context += "\n";
    }
  }
  
  return context;
}

/**
 * Generate basic analysis without AI
 * @param {Object} commitData - Commit data
 * @returns {Object} Basic code quality analysis
 */
function generateBasicAnalysis(commitData) {
  const { stats, files, message } = commitData;
  
  // Calculate basic metrics
  const totalChanges = stats.additions + stats.deletions;
  const changeRatio = stats.deletions > 0 ? stats.additions / stats.deletions : stats.additions;
  
  // Determine complexity based on changes
  let complexity = "Low";
  if (totalChanges > 500 || files.length > 10) {
    complexity = "High";
  } else if (totalChanges > 100 || files.length > 5) {
    complexity = "Medium";
  }
  
  // Calculate score based on various factors
  let score = 70; // Base score
  
  // Adjust for commit message quality
  if (message.length > 20 && message.length < 200) {
    score += 5;
  }
  
  // Adjust for file organization
  if (files.length <= 5) {
    score += 5;
  }
  
  // Adjust for change ratio (balanced changes are better)
  if (changeRatio > 0.5 && changeRatio < 2) {
    score += 5;
  }
  
  // Detect test files
  const hasTests = files.some((f) =>
    f.filename.includes("test") ||
    f.filename.includes("spec") ||
    f.filename.includes("__tests__")
  );
  
  if (hasTests) {
    score += 10;
  }
  
  // Detect common patterns from filenames
  const patterns = [];
  if (files.some((f) => f.filename.includes("service") || f.filename.includes("Service"))) {
    patterns.push("Service Layer Pattern");
  }
  if (files.some((f) => f.filename.includes("model") || f.filename.includes("Model"))) {
    patterns.push("Data Model Pattern");
  }
  if (files.some((f) => f.filename.includes("controller") || f.filename.includes("Controller"))) {
    patterns.push("MVC Pattern");
  }
  
  const bestPractices = [];
  if (hasTests) {
    bestPractices.push("Includes test coverage");
  }
  if (files.length <= 5) {
    bestPractices.push("Focused commit scope");
  }
  if (message.length > 20) {
    bestPractices.push("Descriptive commit message");
  }
  
  const improvements = [];
  if (!hasTests) {
    improvements.push("Consider adding unit tests");
  }
  if (totalChanges > 300) {
    improvements.push("Consider breaking into smaller commits");
  }
  if (message.length < 20) {
    improvements.push("Add more descriptive commit messages");
  }
  
  return {
    score: Math.min(100, Math.max(0, score)),
    complexity,
    patterns,
    bestPractices,
    improvements,
    testCoverage: hasTests ? "Partial" : "None",
    summary: `Commit modifies ${files.length} file(s) with ${totalChanges} total changes. ${complexity} complexity detected.`,
    aiPowered: false,
  };
}

/**
 * Parse text response from AI when JSON parsing fails
 * @param {string} text - AI response text
 * @param {Object} commitData - Original commit data
 * @returns {Object} Parsed analysis
 */
function parseTextResponse(text, commitData) {
  // Fallback parsing logic
  const basicAnalysis = generateBasicAnalysis(commitData);
  
  return {
    ...basicAnalysis,
    summary: text.substring(0, 200),
    aiPowered: true,
    model: "gpt-3.5-turbo",
  };
}

/**
 * Calculate code quality score based on multiple factors
 * @param {Object} analysis - Code analysis result
 * @param {Object} commitData - Commit data
 * @returns {number} Quality score (0-100)
 */
export function calculateQualityScore(analysis, commitData) {
  if (analysis.score) {
    return analysis.score;
  }
  
  // Fallback calculation
  return generateBasicAnalysis(commitData).score;
}

/**
 * Analyze multiple commits and generate timeline
 * @param {Array} commits - Array of commit data with analysis
 * @returns {Object} Timeline analysis
 */
export function generateQualityTimeline(commits) {
  const timeline = commits.map((commit) => ({
    date: commit.date,
    sha: commit.sha.substring(0, 7),
    message: commit.message.split("\n")[0].substring(0, 60),
    score: commit.analysis?.score || 70,
    complexity: commit.analysis?.complexity || "Medium",
    highlights: [
      ...(commit.analysis?.bestPractices || []).slice(0, 2),
      ...(commit.analysis?.patterns || []).slice(0, 1),
    ],
  }));
  
  // Calculate trends
  const scores = timeline.map((t) => t.score);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  // Determine trend direction
  let trend = "stable";
  if (scores.length >= 3) {
    const recentAvg = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const olderAvg = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
    
    if (recentAvg > olderAvg + 5) {
      trend = "improving";
    } else if (recentAvg < olderAvg - 5) {
      trend = "declining";
    }
  }
  
  return {
    timeline,
    summary: {
      averageScore: Math.round(avgScore),
      trend,
      totalCommits: commits.length,
      highQualityCommits: scores.filter((s) => s >= 80).length,
    },
  };
}

/**
 * Batch analyze multiple commits
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} githubToken - GitHub access token
 * @param {number} limit - Number of commits to analyze
 * @param {string} authorUsername - Optional: filter by author's GitHub username
 * @returns {Promise<Array>} Array of analyzed commits
 */
export async function batchAnalyzeCommits(owner, repo, githubToken, limit = 10, authorUsername = null) {
  try {
    // Fetch recent commits (filtered by author if provided)
    const commits = await fetchRecentCommits(owner, repo, githubToken, limit, authorUsername);
    
    // Analyze each commit (with rate limiting consideration)
    const analyzedCommits = [];
    
    for (const commit of commits.slice(0, Math.min(5, limit))) {
      try {
        const commitData = await fetchCommitDiff(owner, repo, commit.sha, githubToken);
        const analysis = await analyzeCodeQuality(commitData);
        
        analyzedCommits.push({
          ...commit,
          stats: commitData.stats,
          filesChanged: commitData.files.length,
          analysis,
        });
        
        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error analyzing commit ${commit.sha}:`, error.message);
        // Continue with next commit
      }
    }
    
    return analyzedCommits;
  } catch (error) {
    console.error("Error in batch analysis:", error.message);
    throw error;
  }
}

/**
 * Analyze commit with comprehensive insights including patterns and best practices
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} sha - Commit SHA
 * @param {string} githubToken - GitHub access token
 * @returns {Promise<Object>} Comprehensive analysis with insights
 */
export async function analyzeCommitWithInsights(owner, repo, sha, githubToken) {
  try {
    const commitData = await fetchCommitDiff(owner, repo, sha, githubToken);
    
    // Get basic quality analysis
    const qualityAnalysis = await analyzeCodeQuality(commitData);
    
    // Get comprehensive insights (patterns, best practices, refactoring)
    const insights = await generateComprehensiveInsights(commitData);
    
    return {
      commit: {
        sha: commitData.sha,
        message: commitData.message,
        author: commitData.author,
        date: commitData.date,
      },
      stats: commitData.stats,
      filesChanged: commitData.files.length,
      qualityAnalysis,
      insights,
      analyzedAt: new Date(),
    };
  } catch (error) {
    console.error("Error in comprehensive commit analysis:", error.message);
    throw error;
  }
}

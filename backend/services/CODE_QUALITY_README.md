# AI-Powered Code Quality Insights

This feature provides comprehensive code quality analysis for GitHub commits using AI-powered insights.

## Features

### 1. Code Analysis Service (`codeAnalysis.js`)
- Fetches commit diffs from GitHub API
- Analyzes code quality using OpenAI GPT-3.5-turbo
- Calculates quality scores (0-100)
- Identifies complexity levels (Low/Medium/High)
- Provides fallback analysis when AI is unavailable
- Batch analyzes multiple commits

### 2. Pattern Detection Service (`patternDetection.js`)
- Detects design patterns (MVC, Repository, Factory, Singleton, etc.)
- Identifies best practices (testing, error handling, documentation, etc.)
- Generates refactoring opportunities
- Works with or without AI (has intelligent fallbacks)

### 3. Code Quality Model (`CodeQuality.js`)
- Stores analyzed commit data
- Tracks quality scores over time
- Indexes for efficient queries
- Links to users and repositories

## API Endpoints

### Analyze Code Quality
```
POST /api/code-quality/analyze/:username
Body: {
  repository: "owner/repo",  // optional, analyzes top repos if not provided
  limit: 5,                   // number of commits to analyze
  forceRefresh: false         // bypass cache
}
```

### Get Insights
```
GET /api/code-quality/insights/:username?repository=owner/repo&limit=30
```

### Get Timeline
```
GET /api/code-quality/timeline/:username?repository=owner/repo&days=90
```

### Analyze Patterns
```
POST /api/code-quality/patterns/:username
Body: {
  repository: "owner/repo",
  sha: "commit-sha"
}
```

### Get Pattern Summary
```
GET /api/code-quality/patterns-summary/:username?repository=owner/repo&limit=50
```

### Clear Cache
```
DELETE /api/code-quality/cache/:username?repository=owner/repo
```

## Setup

1. Install OpenAI package (already done):
```bash
npm install openai
```

2. Add OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_api_key_here
```

3. The service works without an API key (uses fallback analysis), but AI-powered insights require a valid OpenAI API key.

## Frontend Components

### CodeQualityTimeline
- Displays quality trends over time
- Shows individual commit details
- Interactive timeline with expandable commits
- Trend visualization with charts

### CodeQualityInsights
- Aggregated insights across all commits
- Complexity distribution
- Design patterns detected
- Best practices followed
- Areas for improvement
- Test coverage statistics

## Usage

1. Navigate to the dashboard
2. Scroll to "AI-Powered Code Insights" section
3. Click "analyze code quality" to start analysis
4. View timeline and insights
5. Click on individual commits for detailed analysis

## AI Analysis

When OpenAI API key is configured, the system provides:
- Detailed code quality scoring
- Pattern recognition
- Best practice identification
- Specific refactoring suggestions
- Context-aware insights

Without API key, the system provides:
- Basic quality scoring based on metrics
- Pattern detection from file structure
- Common best practice checks
- Standard refactoring suggestions

## Performance Considerations

- Analysis is cached for 24 hours
- Batch analysis limited to 5 commits at a time
- Rate limiting with 500ms delay between commits
- Async processing to avoid blocking

## Requirements Met

✅ Requirement 11.1: AI-powered code analysis with NLP
✅ Requirement 11.2: Design pattern detection
✅ Requirement 11.3: Code quality scoring algorithm
✅ Requirement 11.4: Timeline visualization with insights
✅ Requirement 11.5: Best practices and refactoring suggestions

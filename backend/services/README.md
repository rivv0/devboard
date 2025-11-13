# Analytics Services

This directory contains the analytics computation services for the resume enhancement platform.

## Services

### GitHub Analytics (`githubAnalytics.js`)
Processes GitHub activity data to generate insights about coding patterns and productivity.

**Key Metrics:**
- Time-based statistics (daily, weekly, monthly)
- Language distribution
- Repository metrics
- Productivity patterns (peak hours and days)

**Usage:**
```javascript
import { getGitHubAnalytics } from './services/githubAnalytics.js';

const analytics = await getGitHubAnalytics(userId);
```

### LeetCode Analytics (`leetcodeAnalytics.js`)
Analyzes LeetCode problem-solving data to provide insights about skill development.

**Key Metrics:**
- Difficulty distribution
- Problem-solving patterns
- Topic frequency analysis
- Velocity trends
- Success rate estimation

**Usage:**
```javascript
import { getLeetCodeAnalytics } from './services/leetcodeAnalytics.js';

const analytics = await getLeetCodeAnalytics(userId, previousData);
```

## Data Flow

1. Raw activity data is stored in MongoDB (GitHubActivity collection)
2. Analytics services process this data on-demand
3. Computed analytics are cached in the Analytics collection
4. Frontend fetches analytics via REST API
5. Cache is automatically refreshed after 6 hours

## Performance

- Analytics are computed asynchronously
- Results are cached for 6 hours
- Database queries use optimized indexes
- Parallel processing for multiple metrics

## Extending

To add new analytics:

1. Create a new function in the appropriate service file
2. Add the metric to the main analytics aggregation function
3. Update the Analytics model schema if needed
4. Create corresponding visualization components in frontend

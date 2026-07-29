# DevBoard - Developer Portfolio Platform

A beautiful, minimal developer portfolio that showcases your GitHub activity, LeetCode stats and generates a Spotify Wrapped-style year in review.

## Features

- **GitHub Integration** - Sync and display your GitHub activity
- **LeetCode Stats** - Track your problem-solving progress
- **AI Code Analysis** - Get insights on your code quality
- **DevWrapped** - Spotify Wrapped style year in review
- **Analytics Dashboard** - Visualize your coding patterns


### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/devboard.git
cd devboard
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Visit** `http://localhost:5173`

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
OAUTH_CALLBACK_URL=http://localhost:5001/auth/github/callback
PORT=5001
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001
```


1. **Sign in** with your GitHub account
2. **Sync** your GitHub activity
3. **Link** your LeetCode account (optional)
4. **View** your analytics and stats
5. **Generate** your DevWrapped

## Features in Detail

### GitHub Activity
- Commits, PRs, Issues tracking
- Repository activity
- Contribution heatmap
- Productivity patterns

### LeetCode Integration
- Problems solved by difficulty
- Success rates
- Topic analysis
- Progress tracking

### DevWrapped
- Year in review
- Coding personality
- Achievements
- Fun facts
- Predictions for next year

### Analytics
- Coding patterns
- Language distribution
- Productivity insights
- Code quality metrics



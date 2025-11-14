# 🎉 GitHub Wrapped & AI Story Generator

Two creative features to impress FAANG recruiters!

## Features

### 1. GitHub Wrapped (Spotify Wrapped Style)
An animated, shareable year-in-review of your coding activity.

**What it shows:**
- Total commits, PRs, and repos
- Top programming languages
- Coding personality (Night Owl, Early Bird, etc.)
- LeetCode achievements
- Fun facts (lines of code, hours spent)
- Monthly breakdown
- Predictions for next year
- Shareable quotes

### 2. AI Coding Story Generator
Uses OpenAI to create a compelling narrative about your developer journey.

**What it generates:**
- 3-paragraph professional story
- Key highlights and achievements
- Developer journey timeline
- Coding personality insights

## How to Use

### 1. Make sure you have data synced
- Go to dashboard
- Sync your GitHub activity
- Link your LeetCode account (optional)

### 2. Scroll down on dashboard
You'll see two new sections:
- **GitHub Wrapped** - Click "Generate My Wrapped"
- **AI Coding Story** - Click "Generate My Story"

### 3. Share with recruiters!
- Copy your story to clipboard
- Share wrapped quotes on LinkedIn
- Add to your resume/portfolio

## API Endpoints

```
GET  /api/story/wrapped/:username    - Generate GitHub Wrapped
POST /api/story/generate              - Generate AI story
POST /api/story/quick-summary         - Quick summary
```

## Requirements

- OpenAI API key in `.env` file
- Synced GitHub activity data
- (Optional) LeetCode data for complete stats

## Why This Impresses Recruiters

1. **Shows creativity** - Not just another portfolio
2. **AI integration** - Demonstrates modern tech skills
3. **Data visualization** - Clean, engaging UI
4. **Storytelling** - Makes your work memorable
5. **Shareable** - Easy to spread on social media

Enjoy! 🚀

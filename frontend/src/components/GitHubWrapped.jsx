import { useState, useEffect } from "react";
import axios from "axios";

const GitHubWrapped = ({ username }) => {
  const [wrapped, setWrapped] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchWrapped = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5001/api/wrapped/${username}`);
      setWrapped(response.data.wrapped);
    } catch (error) {
      console.error("Error fetching wrapped:", error);
      const errorMsg = error.response?.data?.error || "Failed to generate GitHub Wrapped";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!wrapped && !loading) {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-12 text-center">
        <h2 className="text-3xl font-light text-white mb-4">GitHub Wrapped {new Date().getFullYear()}</h2>
        <p className="text-white/60 mb-4">See your year in code, Spotify Wrapped style</p>
        {username ? (
          <p className="text-white/40 text-sm mb-8">Looking for data for: @{username}</p>
        ) : (
          <p className="text-yellow-400/60 text-sm mb-8">⚠️ No username provided. Please authenticate first.</p>
        )}
        <button
          onClick={fetchWrapped}
          disabled={!username}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate My Wrapped 🎉
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-12 text-center">
        <div className="animate-pulse">
          <div className="text-4xl mb-4">✨</div>
          <p className="text-white/60">Generating your wrapped...</p>
        </div>
      </div>
    );
  }

  const slides = [
    // Slide 1: Welcome
    <div key="welcome" className="text-center py-20">
      <h1 className="text-6xl font-bold text-white mb-6">
        GitHub Wrapped
      </h1>
      <p className="text-3xl text-white/80 mb-4">{wrapped.year}</p>
      <p className="text-xl text-white/60">@{wrapped.user.username}</p>
    </div>,

    // Slide 2: Total Commits
    <div key="commits" className="text-center py-20">
      <p className="text-xl text-white/60 mb-4">You made</p>
      <h2 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
        {wrapped.stats.totalCommits}
      </h2>
      <p className="text-2xl text-white/80">commits this year</p>
      {wrapped.stats.totalCommits >= 365 && (
        <p className="text-lg text-green-400 mt-6">🔥 That's more than 1 per day!</p>
      )}
    </div>,

    // Slide 3: Top Language
    <div key="language" className="text-center py-20">
      <p className="text-xl text-white/60 mb-4">Your top language was</p>
      <div className="text-7xl mb-4">{wrapped.topLanguages[0]?.icon || "💻"}</div>
      <h2 className="text-5xl font-bold text-white mb-4">
        {wrapped.topLanguages[0]?.name || "JavaScript"}
      </h2>
      <p className="text-xl text-white/60">
        {wrapped.topLanguages[0]?.percentage || "0"}% of your code
      </p>
    </div>,

    // Slide 4: Coding Personality
    <div key="personality" className="text-center py-20">
      <p className="text-xl text-white/60 mb-4">Your coding personality</p>
      <div className="text-7xl mb-4">{wrapped.codingPersonality.emoji}</div>
      <h2 className="text-4xl font-bold text-white mb-4">
        {wrapped.codingPersonality.type}
      </h2>
      <p className="text-lg text-white/70 mb-6 max-w-md mx-auto">
        {wrapped.codingPersonality.description}
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        {wrapped.codingPersonality.traits.map((trait, i) => (
          <span key={i} className="px-4 py-2 bg-white/10 text-white/80 rounded-full text-sm">
            {trait}
          </span>
        ))}
      </div>
    </div>,

    // Slide 5: LeetCode Stats
    wrapped.stats.leetcode.totalSolved > 0 && (
      <div key="leetcode" className="text-center py-20">
        <p className="text-xl text-white/60 mb-4">You solved</p>
        <h2 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4">
          {wrapped.stats.leetcode.totalSolved}
        </h2>
        <p className="text-2xl text-white/80 mb-8">LeetCode problems</p>
        <div className="flex gap-6 justify-center">
          <div>
            <div className="text-3xl font-bold text-green-400">{wrapped.stats.leetcode.easy}</div>
            <div className="text-sm text-white/60">Easy</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-400">{wrapped.stats.leetcode.medium}</div>
            <div className="text-sm text-white/60">Medium</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-red-400">{wrapped.stats.leetcode.hard}</div>
            <div className="text-sm text-white/60">Hard</div>
          </div>
        </div>
      </div>
    ),

    // Slide 6: Achievements
    <div key="achievements" className="py-20">
      <h2 className="text-4xl font-bold text-white text-center mb-12">Achievements Unlocked</h2>
      <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
        {wrapped.achievements.map((achievement, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-lg text-center">
            <div className="text-5xl mb-3">{achievement.icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{achievement.title}</h3>
            <p className="text-sm text-white/60">{achievement.description}</p>
            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs ${
              achievement.rarity === "legendary" ? "bg-yellow-500/20 text-yellow-400" :
              achievement.rarity === "epic" ? "bg-purple-500/20 text-purple-400" :
              "bg-blue-500/20 text-blue-400"
            }`}>
              {achievement.rarity}
            </span>
          </div>
        ))}
      </div>
    </div>,

    // Slide 7: Fun Facts
    <div key="facts" className="py-20">
      <h2 className="text-4xl font-bold text-white text-center mb-12">Fun Facts</h2>
      <div className="space-y-6 max-w-2xl mx-auto">
        {wrapped.funFacts.map((fact, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{fact.icon}</div>
              <div>
                <p className="text-lg text-white mb-2">{fact.fact}</p>
                <p className="text-sm text-white/60">{fact.comparison}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // Slide 8: Predictions
    <div key="predictions" className="text-center py-20">
      <h2 className="text-4xl font-bold text-white mb-8">Looking Ahead to {wrapped.year + 1}</h2>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 p-6 rounded-lg">
          <p className="text-white/60 mb-2">Predicted commits</p>
          <p className="text-4xl font-bold text-white">{wrapped.predictions.nextYearCommits}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg text-left">
          <p className="text-white/60 mb-4">Suggested goals:</p>
          <ul className="space-y-2">
            {wrapped.predictions.suggestedGoals.map((goal, i) => (
              <li key={i} className="text-white/80 flex items-center gap-2">
                <span className="text-green-400">✓</span> {goal}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>,

    // Slide 9: Share
    <div key="share" className="text-center py-20">
      <h2 className="text-4xl font-bold text-white mb-8">Share Your Wrapped</h2>
      <div className="max-w-xl mx-auto space-y-4">
        {wrapped.shareableQuotes.map((quote, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-lg text-left">
            <p className="text-white/80">{quote}</p>
            <button
              onClick={() => navigator.clipboard.writeText(quote)}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Copy to clipboard
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => setCurrentSlide(0)}
        className="mt-8 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
      >
        Watch Again
      </button>
    </div>,
  ].filter(Boolean);

  return (
    <div className="relative bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20 border border-white/10 rounded-lg overflow-hidden">
      {/* Slide Content */}
      <div className="min-h-[600px] flex items-center justify-center p-12">
        {slides[currentSlide]}
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          ← Previous
        </button>
        
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition ${
                i === currentSlide ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default GitHubWrapped;

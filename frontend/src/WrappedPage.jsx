import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import P5Background from "./P5Background";

const WrappedPage = () => {
  const [searchParams] = useSearchParams();
  const githubUsername = searchParams.get("username");
  
  const [wrapped, setWrapped] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchWrapped = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5001/api/wrapped/${githubUsername}`);
      setWrapped(response.data.wrapped);
    } catch (error) {
      console.error("Error fetching wrapped:", error);
      const errorMsg = error.response?.data?.error || "Failed to generate wrapped";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (githubUsername) {
      fetchWrapped();
    }
  }, [githubUsername]);

  if (!githubUsername) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center relative">
        <P5Background />
        <div className="relative z-10 text-center">
          <p className="text-base text-white/40 mb-4">error: no username found</p>
          <a href="/" className="text-base text-white/60 hover:text-white transition">
            return home
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center relative">
        <P5Background />
        <div className="relative z-10 text-center">
          <div className="text-base text-white/40">generating wrapped...</div>
        </div>
      </div>
    );
  }

  if (!wrapped) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center relative">
        <P5Background />
        <div className="relative z-10 text-center">
          <p className="text-base text-white/40">failed to load wrapped</p>
        </div>
      </div>
    );
  }

  const slides = [
    // Slide 1: Welcome
    <div key="welcome" className="text-center py-20">
      <h1 className="text-7xl font-light text-white mb-6" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 200 }}>
        devwrapped
      </h1>
      <p className="text-3xl text-white/80 font-light mb-4">{wrapped.year}</p>
      <p className="text-xl text-white/60">@{wrapped.user.username}</p>
    </div>,

    // Slide 2: Total Commits
    <div key="commits" className="text-center py-20">
      <p className="text-xl text-white/60 mb-4 font-light">you made</p>
      <h2 className="text-9xl font-light text-white mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 200 }}>
        {wrapped.stats.totalCommits}
      </h2>
      <p className="text-2xl text-white/80 font-light">commits this year</p>
    </div>,

    // Slide 3: Top Language
    wrapped.topLanguages[0] && (
      <div key="language" className="text-center py-20">
        <p className="text-xl text-white/60 mb-4 font-light">your top language was</p>
        <h2 className="text-6xl font-light text-white mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 200 }}>
          {wrapped.topLanguages[0].name}
        </h2>
        <p className="text-xl text-white/60 font-light">
          {wrapped.topLanguages[0].percentage}% of your code
        </p>
      </div>
    ),

    // Slide 4: Coding Personality
    <div key="personality" className="text-center py-20">
      <p className="text-xl text-white/60 mb-4 font-light">your coding personality</p>
      <h2 className="text-5xl font-light text-white mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 200 }}>
        {wrapped.codingPersonality.type.replace(/[🌙🌅⚖️]/g, '').trim()}
      </h2>
      <p className="text-lg text-white/70 mb-6 max-w-md mx-auto font-light">
        {wrapped.codingPersonality.description}
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        {wrapped.codingPersonality.traits.map((trait, i) => (
          <span key={i} className="px-4 py-2 bg-white/10 text-white/80 text-sm font-light">
            {trait}
          </span>
        ))}
      </div>
    </div>,

    // Slide 5: LeetCode Stats
    wrapped.stats.leetcode.totalSolved > 0 && (
      <div key="leetcode" className="text-center py-20">
        <p className="text-xl text-white/60 mb-4 font-light">you solved</p>
        <h2 className="text-9xl font-light text-white mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 200 }}>
          {wrapped.stats.leetcode.totalSolved}
        </h2>
        <p className="text-2xl text-white/80 mb-8 font-light">leetcode problems</p>
        <div className="flex gap-8 justify-center">
          <div>
            <div className="text-4xl font-light text-white/90">{wrapped.stats.leetcode.easy}</div>
            <div className="text-sm text-white/60 font-light">easy</div>
          </div>
          <div>
            <div className="text-4xl font-light text-white/90">{wrapped.stats.leetcode.medium}</div>
            <div className="text-sm text-white/60 font-light">medium</div>
          </div>
          <div>
            <div className="text-4xl font-light text-white/90">{wrapped.stats.leetcode.hard}</div>
            <div className="text-sm text-white/60 font-light">hard</div>
          </div>
        </div>
      </div>
    ),

    // Slide 6: Achievements
    <div key="achievements" className="py-20">
      <h2 className="text-4xl font-light text-white text-center mb-12" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 200 }}>
        achievements unlocked
      </h2>
      <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
        {wrapped.achievements.map((achievement, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 p-6">
            <h3 className="text-lg font-light text-white mb-2">{achievement.title}</h3>
            <p className="text-sm text-white/60 font-light">{achievement.description}</p>
          </div>
        ))}
      </div>
    </div>,

    // Slide 7: Fun Facts
    <div key="facts" className="py-20">
      <h2 className="text-4xl font-light text-white text-center mb-12" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 200 }}>
        fun facts
      </h2>
      <div className="space-y-6 max-w-2xl mx-auto">
        {wrapped.funFacts.map((fact, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 p-6">
            <p className="text-lg text-white mb-2 font-light">{fact.fact}</p>
            <p className="text-sm text-white/60 font-light">{fact.comparison}</p>
          </div>
        ))}
      </div>
    </div>,

    // Slide 8: Predictions
    <div key="predictions" className="text-center py-20">
      <h2 className="text-4xl font-light text-white mb-8" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 200 }}>
        looking ahead to {wrapped.year + 1}
      </h2>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-white/[0.02] border border-white/5 p-6">
          <p className="text-white/60 mb-2 font-light">predicted commits</p>
          <p className="text-5xl font-light text-white">{wrapped.predictions.nextYearCommits}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-6 text-left">
          <p className="text-white/60 mb-4 font-light">suggested goals</p>
          <ul className="space-y-2">
            {wrapped.predictions.suggestedGoals.map((goal, i) => (
              <li key={i} className="text-white/80 font-light">{goal}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#08080a] relative">
      <P5Background />
      
      <div className="relative z-10 h-full px-24 py-16">
        {/* Header */}
        <div className="border-b border-white/5 pb-12 mb-16">
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-light text-white tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 200 }}>
              devwrapped
            </h1>
            <a href={`/dashboard?username=${githubUsername}`} className="text-base text-white/40 hover:text-white/60 transition">
              back to dashboard
            </a>
          </div>
        </div>

        {/* Slide Content */}
        <div className="min-h-[600px] flex items-center justify-center">
          {slides[currentSlide]}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="px-4 py-2 bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm font-light"
          >
            previous
          </button>
          
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 transition ${
                  i === currentSlide ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className="px-4 py-2 bg-white/10 text-white/60 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm font-light"
          >
            next
          </button>
        </div>
      </div>
    </div>
  );
};

export default WrappedPage;

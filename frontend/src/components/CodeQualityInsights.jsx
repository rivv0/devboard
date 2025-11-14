import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";

/**
 * Code Quality Insights Component
 * Displays aggregated insights including patterns, best practices, and improvements
 */
function CodeQualityInsights({ username }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (username) {
      fetchInsights();
    }
  }, [username]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/code-quality/insights/${username}`
      );
      setInsights(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching insights:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-6">
        <p className="text-sm text-white/40 mb-4">code quality insights</p>
        <div className="h-48 flex items-center justify-center">
          <p className="text-base text-white/20">Loading...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white/[0.02] border border-white/5 p-6">
        <p className="text-sm text-white/40 mb-4">overall insights</p>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-3xl text-white/90 font-light mb-2">
              {insights.summary.averageScore}
            </p>
            <p className="text-sm text-white/40">average quality score</p>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`text-xs ${
                  insights.summary.trend === "improving"
                    ? "text-emerald-400"
                    : insights.summary.trend === "declining"
                    ? "text-rose-400"
                    : "text-white/40"
                }`}
              >
                {insights.summary.trend === "improving" && "↗ improving"}
                {insights.summary.trend === "declining" && "↘ declining"}
                {insights.summary.trend === "stable" && "→ stable"}
              </span>
            </div>
          </div>
          <div>
            <p className="text-3xl text-emerald-400 font-light mb-2">
              {insights.summary.highQualityCommits}
            </p>
            <p className="text-sm text-white/40">high quality commits</p>
            <p className="text-xs text-white/20 mt-2">
              {((insights.summary.highQualityCommits / insights.summary.totalCommitsAnalyzed) * 100).toFixed(0)}% of total
            </p>
          </div>
          <div>
            <p className="text-3xl text-white/90 font-light mb-2">
              {insights.summary.totalCommitsAnalyzed}
            </p>
            <p className="text-sm text-white/40">commits analyzed</p>
          </div>
        </div>
      </div>

      {/* Complexity Distribution */}
      <div className="bg-white/[0.02] border border-white/5 p-6">
        <p className="text-sm text-white/40 mb-4">complexity distribution</p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-emerald-400/80">Low</span>
              <span className="text-sm text-white/60">
                {insights.distributions.complexity.Low} commits
              </span>
            </div>
            <div className="w-full h-2 bg-white/5 overflow-hidden">
              <div
                className="h-full bg-emerald-500/60"
                style={{
                  width: `${
                    (insights.distributions.complexity.Low /
                      insights.summary.totalCommitsAnalyzed) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-amber-400/80">Medium</span>
              <span className="text-sm text-white/60">
                {insights.distributions.complexity.Medium} commits
              </span>
            </div>
            <div className="w-full h-2 bg-white/5 overflow-hidden">
              <div
                className="h-full bg-amber-500/60"
                style={{
                  width: `${
                    (insights.distributions.complexity.Medium /
                      insights.summary.totalCommitsAnalyzed) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-rose-400/80">High</span>
              <span className="text-sm text-white/60">
                {insights.distributions.complexity.High} commits
              </span>
            </div>
            <div className="w-full h-2 bg-white/5 overflow-hidden">
              <div
                className="h-full bg-rose-500/60"
                style={{
                  width: `${
                    (insights.distributions.complexity.High /
                      insights.summary.totalCommitsAnalyzed) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Design Patterns */}
      {insights.patterns.designPatterns && insights.patterns.designPatterns.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 p-6">
          <p className="text-sm text-white/40 mb-4">design patterns detected</p>
          <div className="flex flex-wrap gap-2">
            {insights.patterns.designPatterns.map((pattern, index) => (
              <span
                key={index}
                className="text-sm bg-blue-500/10 text-blue-400 px-3 py-2 border border-blue-500/20"
              >
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      {insights.patterns.bestPractices && insights.patterns.bestPractices.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 p-6">
          <p className="text-sm text-white/40 mb-4">best practices followed</p>
          <div className="grid grid-cols-2 gap-3">
            {insights.patterns.bestPractices.slice(0, 8).map((practice, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-emerald-400/80"
              >
                <span className="text-emerald-400/40 mt-1">✓</span>
                <span>{practice}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Improvements */}
      {insights.patterns.commonImprovements &&
        insights.patterns.commonImprovements.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 p-6">
            <p className="text-sm text-white/40 mb-4">areas for improvement</p>
            <div className="space-y-2">
              {insights.patterns.commonImprovements.slice(0, 6).map((improvement, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-amber-400/80"
                >
                  <span className="text-amber-400/40 mt-1">•</span>
                  <span>{improvement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Test Coverage Distribution */}
      <div className="bg-white/[0.02] border border-white/5 p-6">
        <p className="text-sm text-white/40 mb-4">test coverage</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl text-rose-400 font-light mb-1">
              {insights.distributions.testCoverage.None}
            </p>
            <p className="text-xs text-white/40">None</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-amber-400 font-light mb-1">
              {insights.distributions.testCoverage.Partial}
            </p>
            <p className="text-xs text-white/40">Partial</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-emerald-400 font-light mb-1">
              {insights.distributions.testCoverage.Good}
            </p>
            <p className="text-xs text-white/40">Good</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeQualityInsights;

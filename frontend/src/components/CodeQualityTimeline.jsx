import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import axios from "axios";

/**
 * Code Quality Timeline Component
 * Displays code quality trends over time with specific insights for major commits
 */
function CodeQualityTimeline({ username }) {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [days, setDays] = useState(90);

  useEffect(() => {
    if (username) {
      fetchTimeline();
    }
  }, [username, days]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5001/api/code-quality/timeline/${username}?days=${days}`
      );
      setTimelineData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      setLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    try {
      setAnalyzing(true);
      await axios.post(`http://localhost:5001/api/code-quality/analyze/${username}`, {
        limit: 10,
      });
      // Refresh timeline after analysis
      await fetchTimeline();
      setAnalyzing(false);
    } catch (error) {
      console.error("Error analyzing code quality:", error);
      setAnalyzing(false);
    }
  };

  const getQualityColor = (score) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#3b82f6"; // blue
    if (score >= 40) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const getComplexityColor = (complexity) => {
    if (complexity === "Low") return "text-emerald-400";
    if (complexity === "Medium") return "text-amber-400";
    return "text-rose-400";
  };

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-6">
        <p className="text-sm text-white/40 mb-4">code quality timeline</p>
        <div className="h-64 flex items-center justify-center">
          <p className="text-base text-white/20">Loading...</p>
        </div>
      </div>
    );
  }

  if (!timelineData) {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-white/40">code quality timeline</p>
          <button
            onClick={triggerAnalysis}
            disabled={analyzing}
            className="text-sm text-white/40 hover:text-white/60 transition disabled:opacity-30"
          >
            {analyzing ? "analyzing..." : "analyze code quality →"}
          </button>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-base text-white/20 mb-4">No code quality data available</p>
            <p className="text-sm text-white/10">Click "analyze code quality" to start</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base text-white/40 mb-2">code quality timeline</h3>
          <p className="text-sm text-white/20">
            {timelineData.summary.totalCommits} commits analyzed
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-white/[0.02] border border-white/10 text-white/60 text-sm px-3 py-2 focus:outline-none focus:border-white/30 transition"
          >
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
          </select>
          <button
            onClick={triggerAnalysis}
            disabled={analyzing}
            className="text-sm text-white/40 hover:text-white/60 transition disabled:opacity-30"
          >
            {analyzing ? "analyzing..." : "refresh →"}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/[0.02] border border-white/5 p-4">
          <p className="text-2xl text-white/90 font-light mb-1">
            {timelineData.summary.averageScore}
          </p>
          <p className="text-sm text-white/40">avg quality score</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-4">
          <p className="text-2xl text-white/90 font-light mb-1">
            {timelineData.summary.totalCommits}
          </p>
          <p className="text-sm text-white/40">commits analyzed</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-4">
          <p className="text-2xl text-emerald-400 font-light mb-1">
            {timelineData.timeline.filter((c) => c.score >= 80).length}
          </p>
          <p className="text-sm text-white/40">high quality</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-4">
          <p className="text-2xl text-amber-400 font-light mb-1">
            {timelineData.timeline.filter((c) => c.improvements.length > 0).length}
          </p>
          <p className="text-sm text-white/40">need improvement</p>
        </div>
      </div>

      {/* Trend Chart */}
      {timelineData.trendData && timelineData.trendData.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 p-6">
          <p className="text-sm text-white/40 mb-4">quality trend</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.3)"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                style={{ fontSize: "12px" }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  color: "rgba(255,255,255,0.9)",
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend
                wrapperStyle={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="averageScore"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 3 }}
                activeDot={{ r: 5 }}
                name="Quality Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Commit Timeline */}
      <div className="bg-white/[0.02] border border-white/5 p-6">
        <p className="text-sm text-white/40 mb-4">commit history</p>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {timelineData.timeline.map((commit, index) => (
            <div
              key={index}
              onClick={() =>
                setSelectedCommit(selectedCommit?.sha === commit.sha ? null : commit)
              }
              className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 p-4 cursor-pointer transition-colors duration-200"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-white/30 font-mono">{commit.sha}</span>
                    <span className="text-xs text-white/20">
                      {new Date(commit.date).toLocaleDateString()}
                    </span>
                    <span className={`text-xs ${getComplexityColor(commit.complexity)}`}>
                      {commit.complexity}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 truncate mb-2">{commit.message}</p>
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span>{commit.repository}</span>
                    <span>{commit.filesChanged} files</span>
                    <span>{commit.totalChanges} changes</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div
                    className="text-2xl font-light"
                    style={{ color: getQualityColor(commit.score) }}
                  >
                    {commit.score}
                  </div>
                  <div className="w-16 h-2 bg-white/5 overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${commit.score}%`,
                        backgroundColor: getQualityColor(commit.score),
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedCommit?.sha === commit.sha && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                  {/* Patterns */}
                  {commit.patterns && commit.patterns.length > 0 && (
                    <div>
                      <p className="text-xs text-white/40 mb-2">Design Patterns</p>
                      <div className="flex flex-wrap gap-2">
                        {commit.patterns.map((pattern, i) => (
                          <span
                            key={i}
                            className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 border border-blue-500/20"
                          >
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Best Practices */}
                  {commit.bestPractices && commit.bestPractices.length > 0 && (
                    <div>
                      <p className="text-xs text-white/40 mb-2">Best Practices</p>
                      <div className="flex flex-wrap gap-2">
                        {commit.bestPractices.map((practice, i) => (
                          <span
                            key={i}
                            className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 border border-emerald-500/20"
                          >
                            {practice}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvements */}
                  {commit.improvements && commit.improvements.length > 0 && (
                    <div>
                      <p className="text-xs text-white/40 mb-2">Suggested Improvements</p>
                      <ul className="space-y-1">
                        {commit.improvements.map((improvement, i) => (
                          <li key={i} className="text-xs text-amber-400/80 flex items-start gap-2">
                            <span className="text-amber-400/40">•</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Test Coverage */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">Test Coverage:</span>
                    <span
                      className={`text-xs ${
                        commit.testCoverage === "Good"
                          ? "text-emerald-400"
                          : commit.testCoverage === "Partial"
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {commit.testCoverage}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CodeQualityTimeline;

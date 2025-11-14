import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import AnalyticsTrendChart from "./AnalyticsTrendChart";
import ProductivityHeatmap from "./ProductivityHeatmap";
import StatisticsCard from "./StatisticsCard";

/**
 * Analytics Dashboard Component
 * Main component that fetches and displays comprehensive analytics
 */
function AnalyticsDashboard({ username }) {
  const [githubAnalytics, setGithubAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (username) {
      fetchAnalytics();
    }
  }, [username]);

  const fetchAnalytics = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const refreshParam = forceRefresh ? "?refresh=true" : "";

      // Fetch GitHub analytics only
      const githubRes = await axios.get(
        `${API_URL}/api/analytics/github/${username}${refreshParam}`
      );

      setGithubAnalytics(githubRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError("Failed to load analytics");
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics(true);
    setRefreshing(false);
  };

  // Prepare trend data for chart (last 30 days)
  const prepareTrendData = () => {
    if (!githubAnalytics?.timeBasedStats?.monthly?.commitsByDay) return [];

    const commitsByDay = githubAnalytics.timeBasedStats.monthly.commitsByDay;
    const days = Object.keys(commitsByDay).sort();

    if (days.length === 0) return [];

    return days.map((date) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      commits: commitsByDay[date],
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base text-white/40 tracking-wide">analytics</h2>
          <div className="animate-pulse text-white/40">Loading...</div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 p-6 h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-6">
        <p className="text-base text-rose-400">{error}</p>
        <button
          onClick={() => fetchAnalytics()}
          className="mt-4 text-white/60 hover:text-white transition"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-base text-white/40 tracking-wide">analytics</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-white/40 hover:text-white/60 transition disabled:opacity-30"
          title="Refresh analytics"
        >
          <svg
            className={`w-6 h-6 ${refreshing ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </button>
      </div>

      {/* No Data Message */}
      {githubAnalytics && 
       githubAnalytics.repositoryMetrics?.totalRepositories === 0 && (
        <div className="bg-white/[0.02] border border-white/5 p-10 text-center">
          <p className="text-base text-white/40 mb-4">No GitHub activity data available yet</p>
          <p className="text-sm text-white/20">
            Make sure to sync your GitHub activity first by clicking the refresh button in the GitHub section above.
          </p>
        </div>
      )}

      {/* GitHub Analytics */}
      {githubAnalytics && 
       githubAnalytics.repositoryMetrics?.totalRepositories > 0 && (
        <>
          <div className="grid grid-cols-2 gap-6">
            {/* Time-based Stats */}
            <StatisticsCard
              title="github activity"
              stats={githubAnalytics.timeBasedStats}
              type="github"
            />

            {/* Language Distribution */}
            <StatisticsCard
              title="language distribution"
              stats={githubAnalytics.languageDistribution}
              type="languages"
            />
          </div>

          {/* Trend Chart */}
          <AnalyticsTrendChart
            data={prepareTrendData()}
            title="30-day commit trend"
          />

          {/* Productivity Heatmap */}
          <ProductivityHeatmap
            hourlyData={githubAnalytics.productivityPatterns?.hourlyDistribution}
            dayOfWeekData={githubAnalytics.productivityPatterns?.dayOfWeekDistribution}
          />

          {/* Productivity Insights */}
          <StatisticsCard
            title="productivity insights"
            stats={githubAnalytics.productivityPatterns}
            type="productivity"
          />

          {/* Repository Metrics */}
          <div className="bg-white/[0.02] border border-white/5 p-6">
            <p className="text-sm text-white/40 mb-4">repository metrics</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-3xl text-white/90 font-light">
                  {githubAnalytics.repositoryMetrics?.totalRepositories || 0}
                </p>
                <p className="text-xs text-white/40">total repositories</p>
              </div>
              <div>
                <p className="text-3xl text-white/90 font-light">
                  {githubAnalytics.repositoryMetrics?.totalPullRequests || 0}
                </p>
                <p className="text-xs text-white/40">pull requests</p>
              </div>
              <div>
                <p className="text-3xl text-white/90 font-light">
                  {githubAnalytics.repositoryMetrics?.totalIssues || 0}
                </p>
                <p className="text-xs text-white/40">issues</p>
              </div>
            </div>

            {/* Most Active Repos */}
            {githubAnalytics.repositoryMetrics?.mostActiveRepos && (
              <div className="mt-6 border-t border-white/5 pt-4">
                <p className="text-xs text-white/30 mb-3">most active repositories</p>
                <div className="space-y-2">
                  {githubAnalytics.repositoryMetrics.mostActiveRepos.slice(0, 5).map((repo, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-white/60 truncate">{repo.name}</span>
                      <span className="text-sm text-emerald-400">{repo.commits} commits</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Cache Info */}
      {githubAnalytics?.cached && (
        <div className="text-center">
          <p className="text-xs text-white/20">
            Showing cached data. Click refresh for latest analytics.
          </p>
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboard;

import React, { useState, useEffect } from "react";
import axios from "axios";

const LeetCodeStats = ({ username }) => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get(`http://localhost:5001/api/leetcode/stats/${username}`);
        const recentRes = await axios.get(`http://localhost:5001/api/leetcode/recent/${username}`);
        setStats(statsRes.data.matchedUser);
        setRecent(recentRes.data);
      } catch (err) {
        console.error("LeetCode Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) return <p className="text-gray-500">Fetching LeetCode data...</p>;
  if (!stats) return <p className="text-red-500">Failed to load LeetCode data</p>;

  const solved = stats.submitStatsGlobal.acSubmissionNum.reduce((acc, item) => {
    acc[item.difficulty] = item.count;
    return acc;
  }, {});

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">💡 LeetCode Stats</h2>

      <div className="grid grid-cols-3 gap-4 text-center mb-6">
        <div className="bg-green-100 p-3 rounded-xl">
          <p className="text-sm text-gray-600">Easy</p>
          <h3 className="text-lg font-semibold">{solved.Easy}</h3>
        </div>
        <div className="bg-yellow-100 p-3 rounded-xl">
          <p className="text-sm text-gray-600">Medium</p>
          <h3 className="text-lg font-semibold">{solved.Medium}</h3>
        </div>
        <div className="bg-red-100 p-3 rounded-xl">
          <p className="text-sm text-gray-600">Hard</p>
          <h3 className="text-lg font-semibold">{solved.Hard}</h3>
        </div>
      </div>

      <p className="text-gray-700 mb-4">
        🏆 <b>Ranking:</b> {stats.profile.ranking.toLocaleString()}  
        &nbsp;&nbsp;⭐ <b>Reputation:</b> {stats.profile.reputation}
      </p>

      <h3 className="text-xl font-semibold mb-2">Recent Submissions</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {recent.length > 0 ? (
          recent.map((sub, idx) => (
            <div
              key={idx}
              className="border p-2 rounded-lg text-sm bg-gray-50 hover:bg-gray-100 transition"
            >
              <p>
                <b>{sub.title}</b> — {sub.statusDisplay} ({sub.lang})
              </p>
              <p className="text-xs text-gray-500">
                {new Date(sub.timestamp * 1000).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p>No recent submissions found.</p>
        )}
      </div>
    </div>
  );
};

export default LeetCodeStats;

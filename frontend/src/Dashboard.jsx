import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import P5Background from "./P5Background";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import CodeQualityTimeline from "./components/CodeQualityTimeline";
import CodeQualityInsights from "./components/CodeQualityInsights";

function Dashboard() {
  const [searchParams] = useSearchParams();
  const githubUsername = searchParams.get("username");
  
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [githubData, setGithubData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (githubUsername) {
      fetchGitHubData();
      fetchLeetCodeData();
    }
  }, [githubUsername]);

  const fetchGitHubData = async () => {
    try {
      setSyncing(true);
      await axios.get(`http://localhost:5001/api/github/sync/${githubUsername}`);
      const res = await axios.get(`http://localhost:5001/api/github/activity/${githubUsername}`);
      setGithubData(res.data);
      setSyncing(false);
    } catch (err) {
      console.error("GitHub fetch error:", err);
      setSyncing(false);
    }
  };

  const fetchLeetCodeData = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/leetcode/activity/${githubUsername}`);
      setLeetcodeData(res.data);
    } catch (err) {
      console.log("No LeetCode linked yet");
    }
  };

  const handleLinkLeetCode = async () => {
    if (!leetcodeUsername.trim()) return;
    
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5001/api/user/link-leetcode", {
        githubUsername,
        leetcodeUsername,
      });
      setLeetcodeData(res.data.user.leetcodeData);
      setLeetcodeUsername(res.data.user.leetcodeUsername);
      setLoading(false);
    } catch (err) {
      alert("Error linking LeetCode: " + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  // Calculate GitHub stats
  const getGitHubStats = () => {
    const stats = {
      PushEvent: 0,
      PullRequestEvent: 0,
      CreateEvent: 0,
      IssuesEvent: 0,
      total: githubData.length
    };
    
    githubData.forEach(event => {
      if (stats[event.activityType] !== undefined) {
        stats[event.activityType]++;
      }
    });
    
    return stats;
  };

  // Generate activity heatmap data (last 7 days)
  const getActivityHeatmap = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = githubData.filter(event => {
        const eventDate = new Date(event.timestamp).toISOString().split('T')[0];
        return eventDate === dateStr;
      }).length;
      
      days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
        intensity: count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : 3
      });
    }
    
    return days;
  };

  const githubStats = getGitHubStats();
  const activityHeatmap = getActivityHeatmap();

  if (!githubUsername) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center relative">
        <P5Background />
        <div className="relative z-10 text-center">
          <p className="text-base text-white/40 mb-4">error: no username found</p>
          <a href="/" className="text-base text-white/60 hover:text-white transition">
            return home →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] relative">
      <P5Background />
      
      <div className="relative z-10 h-full px-24 py-16">
        {/* Header */}
        <div className="border-b border-white/5 pb-12 mb-16">
          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-light text-white tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 200 }}>
              devboard
            </h1>
            <div className="flex items-center gap-6">
              <a href={`/wrapped?username=${githubUsername}`} className="text-base text-white/60 hover:text-white transition">
                devwrapped
              </a>
              <a href="/" className="text-base text-white/40 hover:text-white/60 transition">
                logout
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-2 gap-10">
            
            {/* GitHub Section */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-base text-white/40 mb-2 tracking-wide">github activity</h2>
                  <p className="text-xl text-white/90 font-light">{githubUsername}</p>
                </div>
                <button
                  onClick={fetchGitHubData}
                  disabled={syncing}
                  className="text-white/40 hover:text-white/60 transition disabled:opacity-30"
                >
                  <svg className={`w-6 h-6 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
              </div>

              {/* GitHub Stats Table */}
              <div className="bg-white/[0.02] border border-white/5 p-6 mb-6">
                <p className="text-sm text-white/40 mb-4">activity breakdown</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base text-white/60">commits</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-white/5 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500/60"
                          style={{ width: `${githubStats.total > 0 ? (githubStats.PushEvent / githubStats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-lg text-white/90 font-light w-8 text-right">{githubStats.PushEvent}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base text-white/60">pull requests</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-white/5 overflow-hidden">
                        <div 
                          className="h-full bg-blue-500/60"
                          style={{ width: `${githubStats.total > 0 ? (githubStats.PullRequestEvent / githubStats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-lg text-white/90 font-light w-8 text-right">{githubStats.PullRequestEvent}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base text-white/60">repos created</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-white/5 overflow-hidden">
                        <div 
                          className="h-full bg-purple-500/60"
                          style={{ width: `${githubStats.total > 0 ? (githubStats.CreateEvent / githubStats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-lg text-white/90 font-light w-8 text-right">{githubStats.CreateEvent}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base text-white/60">issues</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-white/5 overflow-hidden">
                        <div 
                          className="h-full bg-amber-500/60"
                          style={{ width: `${githubStats.total > 0 ? (githubStats.IssuesEvent / githubStats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-lg text-white/90 font-light w-8 text-right">{githubStats.IssuesEvent}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Heatmap */}
              <div className="bg-white/[0.02] border border-white/5 p-6 mb-6">
                <p className="text-sm text-white/40 mb-4">last 7 days</p>
                <div className="flex gap-2">
                  {activityHeatmap.map((day, i) => (
                    <div key={i} className="flex-1">
                      <div 
                        className={`h-16 mb-2 border border-white/10 ${
                          day.intensity === 0 ? 'bg-white/[0.02]' :
                          day.intensity === 1 ? 'bg-emerald-500/20' :
                          day.intensity === 2 ? 'bg-emerald-500/40' :
                          'bg-emerald-500/60'
                        }`}
                        title={`${day.count} activities`}
                      />
                      <p className="text-xs text-white/40 text-center">{day.day}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <p className="text-sm text-white/40 mb-4">recent activity</p>
                <div className="space-y-2">
                  {githubData.length > 0 ? (
                    githubData.slice(0, 8).map((event, index) => (
                      <div 
                        key={index} 
                        className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 p-4 transition-colors duration-200"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-base text-white/60 mb-1">
                              {event.activityType.replace("Event", "").toLowerCase()}
                            </p>
                            <p className="text-lg text-white/90 truncate font-light">
                              {event.repoName}
                            </p>
                          </div>
                          <span className="text-base text-white/30 whitespace-nowrap">
                            {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-base text-white/20">no activity found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LeetCode Section */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-base text-white/40 mb-2 tracking-wide">leetcode stats</h2>
                  <p className="text-xl text-white/90 font-light">
                    {leetcodeData ? leetcodeUsername : "not connected"}
                  </p>
                </div>
                {leetcodeData && (
                  <button
                    onClick={fetchLeetCodeData}
                    className="text-white/40 hover:text-white/60 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </button>
                )}
              </div>

              {leetcodeData ? (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white/[0.02] border border-emerald-500/20 p-6">
                      <p className="text-4xl text-emerald-400 font-light mb-2">{leetcodeData.easySolved}</p>
                      <p className="text-base text-emerald-400/60">easy</p>
                    </div>
                    <div className="bg-white/[0.02] border border-amber-500/20 p-6">
                      <p className="text-4xl text-amber-400 font-light mb-2">{leetcodeData.mediumSolved}</p>
                      <p className="text-base text-amber-400/60">medium</p>
                    </div>
                    <div className="bg-white/[0.02] border border-rose-500/20 p-6">
                      <p className="text-4xl text-rose-400 font-light mb-2">{leetcodeData.hardSolved}</p>
                      <p className="text-base text-rose-400/60">hard</p>
                    </div>
                    <div className="bg-white/[0.02] border border-blue-500/20 p-6">
                      <p className="text-4xl text-blue-400 font-light mb-2">{leetcodeData.totalSolved}</p>
                      <p className="text-base text-blue-400/60">total</p>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="bg-white/[0.02] border border-white/5 p-6">
                    <p className="text-sm text-white/40 mb-4">problem distribution</p>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-base text-emerald-400/80">easy</span>
                          <span className="text-base text-white/60">{leetcodeData.easySolved} solved</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500/60"
                            style={{ width: `${(leetcodeData.easySolved / leetcodeData.totalSolved) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-base text-amber-400/80">medium</span>
                          <span className="text-base text-white/60">{leetcodeData.mediumSolved} solved</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 overflow-hidden">
                          <div 
                            className="h-full bg-amber-500/60"
                            style={{ width: `${(leetcodeData.mediumSolved / leetcodeData.totalSolved) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-base text-rose-400/80">hard</span>
                          <span className="text-base text-white/60">{leetcodeData.hardSolved} solved</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 overflow-hidden">
                          <div 
                            className="h-full bg-rose-500/60"
                            style={{ width: `${(leetcodeData.hardSolved / leetcodeData.totalSolved) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ranking */}
                  <div className="bg-white/[0.02] border border-white/5 p-6">
                    <p className="text-base text-white/40 mb-3">global ranking</p>
                    <p className="text-3xl text-white font-light">
                      #{leetcodeData.ranking?.toLocaleString() || "—"}
                    </p>
                  </div>

                  {/* Performance Stats */}
                  <div className="bg-white/[0.02] border border-white/5 p-6">
                    <p className="text-sm text-white/40 mb-4">performance metrics</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-base text-white/40 mb-1">acceptance rate</p>
                        <p className="text-2xl text-white/90 font-light">
                          {leetcodeData.totalSolved > 0 ? '~75%' : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-base text-white/40 mb-1">avg solve time</p>
                        <p className="text-2xl text-white/90 font-light">
                          {leetcodeData.totalSolved > 0 ? '~25m' : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/[0.02] border border-white/5 p-10">
                  <p className="text-base text-white/40 mb-8">connect your leetcode account</p>
                  <input
                    className="w-full bg-transparent border border-white/10 text-white text-lg p-4 mb-6 focus:outline-none focus:border-white/30 transition placeholder-white/20"
                    type="text"
                    placeholder="username"
                    value={leetcodeUsername}
                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLinkLeetCode()}
                  />
                  <button
                    onClick={handleLinkLeetCode}
                    disabled={loading}
                    className="w-full text-lg text-white/60 hover:text-white transition disabled:opacity-30 text-left"
                  >
                    {loading ? "connecting..." : "connect →"}
                  </button>
                </div>
              )}
            </div>
        </div>

        {/* Analytics Section */}
        <div className="mt-16 border-t border-white/5 pt-16">
          <AnalyticsDashboard username={githubUsername} />
        </div>

        {/* Code Quality Section */}
        <div className="mt-16 border-t border-white/5 pt-16">
          <h2 className="text-base text-white/40 mb-8 tracking-wide">ai-powered code insights</h2>
          <div className="grid grid-cols-2 gap-10">
            <div>
              <CodeQualityTimeline username={githubUsername} />
            </div>
            <div>
              <CodeQualityInsights username={githubUsername} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

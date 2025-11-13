/**
 * Statistics Dashboard Card Component
 * Displays key metrics in a clean card format
 */
function StatisticsCard({ title, stats, type = "github" }) {
  if (!stats) {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-6">
        <p className="text-sm text-white/40 mb-4">{title}</p>
        <div className="h-32 flex items-center justify-center">
          <p className="text-base text-white/20">No data available</p>
        </div>
      </div>
    );
  }

  if (type === "github") {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-6">
        <p className="text-sm text-white/40 mb-4">{title}</p>
        <div className="space-y-4">
          {/* Daily Stats */}
          <div>
            <p className="text-xs text-white/30 mb-2">last 24 hours</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl text-white/90 font-light">{stats.daily?.commits || 0}</p>
                <p className="text-xs text-white/40">commits</p>
              </div>
              <div>
                <p className="text-2xl text-white/90 font-light">{stats.daily?.repositories || 0}</p>
                <p className="text-xs text-white/40">repositories</p>
              </div>
            </div>
          </div>

          {/* Weekly Stats */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-white/30 mb-2">last 7 days</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl text-white/90 font-light">{stats.weekly?.commits || 0}</p>
                <p className="text-xs text-white/40">commits</p>
              </div>
              <div>
                <p className="text-2xl text-white/90 font-light">{stats.weekly?.averagePerDay || 0}</p>
                <p className="text-xs text-white/40">avg/day</p>
              </div>
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-white/30 mb-2">last 30 days</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl text-white/90 font-light">{stats.monthly?.commits || 0}</p>
                <p className="text-xs text-white/40">commits</p>
              </div>
              <div>
                <p className="text-2xl text-white/90 font-light">{stats.monthly?.repositories || 0}</p>
                <p className="text-xs text-white/40">repositories</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "leetcode") {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-6">
        <p className="text-sm text-white/40 mb-4">{title}</p>
        <div className="space-y-4">
          {/* Difficulty Distribution */}
          <div>
            <p className="text-xs text-white/30 mb-3">problem distribution</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                <p className="text-2xl text-emerald-400 font-light">{stats.difficultyDistribution?.easy?.solved || 0}</p>
                <p className="text-xs text-emerald-400/60">easy</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 text-center">
                <p className="text-2xl text-amber-400 font-light">{stats.difficultyDistribution?.medium?.solved || 0}</p>
                <p className="text-xs text-amber-400/60">medium</p>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 text-center">
                <p className="text-2xl text-rose-400 font-light">{stats.difficultyDistribution?.hard?.solved || 0}</p>
                <p className="text-xs text-rose-400/60">hard</p>
              </div>
            </div>
          </div>

          {/* Skill Level */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-white/30 mb-2">skill level</p>
            <p className="text-2xl text-white/90 font-light">{stats.problemSolvingPatterns?.skillLevel || "Beginner"}</p>
          </div>

          {/* Total Solved */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-white/30 mb-2">total solved</p>
            <p className="text-3xl text-blue-400 font-light">{stats.difficultyDistribution?.total || 0}</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === "languages") {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-6">
        <p className="text-sm text-white/40 mb-4">{title}</p>
        <div className="space-y-3">
          {stats.languages && stats.languages.length > 0 ? (
            stats.languages.slice(0, 5).map((lang, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-white/60">{lang.name}</span>
                  <span className="text-sm text-white/40">{lang.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500/60 to-purple-500/60"
                    style={{ width: `${lang.percentage}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-base text-white/20 text-center py-4">No language data</p>
          )}
        </div>
      </div>
    );
  }

  if (type === "productivity") {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-6">
        <p className="text-sm text-white/40 mb-4">{title}</p>
        <div className="space-y-4">
          {/* Peak Hours */}
          {stats.peakHours && stats.peakHours.length > 0 && (
            <div>
              <p className="text-xs text-white/30 mb-2">most productive hours</p>
              {stats.peakHours.slice(0, 3).map((peak, index) => (
                <div key={index} className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/60">{peak.timeRange}</span>
                  <span className="text-sm text-emerald-400">{peak.commits} commits</span>
                </div>
              ))}
            </div>
          )}

          {/* Peak Days */}
          {stats.peakDays && stats.peakDays.length > 0 && (
            <div className="border-t border-white/5 pt-4">
              <p className="text-xs text-white/30 mb-2">most productive days</p>
              {stats.peakDays.slice(0, 3).map((peak, index) => (
                <div key={index} className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/60">{peak.day}</span>
                  <span className="text-sm text-emerald-400">{peak.count} commits</span>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-xs text-white/30 mb-2">summary</p>
            <p className="text-sm text-white/60">
              Most productive at <span className="text-emerald-400">{stats.mostProductiveHour}:00</span> on <span className="text-emerald-400">{stats.mostProductiveDay}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default StatisticsCard;

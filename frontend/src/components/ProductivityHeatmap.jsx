/**
 * Productivity Heatmap Component
 * Displays coding activity by hour of day and day of week
 */
function ProductivityHeatmap({ hourlyData, dayOfWeekData }) {
  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-6">
        <p className="text-sm text-white/40 mb-4">productivity heatmap</p>
        <div className="h-64 flex items-center justify-center">
          <p className="text-base text-white/20">No data available</p>
        </div>
      </div>
    );
  }

  // Get max commits for intensity calculation
  const maxCommits = Math.max(...hourlyData.map(h => h.commits));

  // Get intensity level (0-4)
  const getIntensity = (commits) => {
    if (commits === 0) return 0;
    const percentage = (commits / maxCommits) * 100;
    if (percentage < 20) return 1;
    if (percentage < 40) return 2;
    if (percentage < 70) return 3;
    return 4;
  };

  // Get color based on intensity
  const getColor = (intensity) => {
    switch (intensity) {
      case 0: return 'bg-white/[0.02]';
      case 1: return 'bg-emerald-500/20';
      case 2: return 'bg-emerald-500/40';
      case 3: return 'bg-emerald-500/60';
      case 4: return 'bg-emerald-500/80';
      default: return 'bg-white/[0.02]';
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 p-6">
      <p className="text-sm text-white/40 mb-4">productivity heatmap</p>
      
      {/* Hourly Distribution */}
      <div className="mb-6">
        <p className="text-xs text-white/30 mb-3">commits by hour</p>
        <div className="grid grid-cols-12 gap-1">
          {hourlyData.map((item, index) => {
            const intensity = getIntensity(item.commits);
            return (
              <div key={index} className="relative group">
                <div 
                  className={`h-12 border border-white/10 ${getColor(intensity)} transition-all duration-200 hover:scale-110`}
                  title={`${item.hour}:00 - ${item.commits} commits`}
                />
                <p className="text-[10px] text-white/30 text-center mt-1">
                  {item.hour % 3 === 0 ? item.hour : ''}
                </p>
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {item.hour}:00 - {item.commits} commits
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day of Week Distribution */}
      {dayOfWeekData && dayOfWeekData.length > 0 && (
        <div>
          <p className="text-xs text-white/30 mb-3">commits by day</p>
          <div className="grid grid-cols-7 gap-2">
            {dayOfWeekData.map((item, index) => {
              const maxDayCommits = Math.max(...dayOfWeekData.map(d => d.commits));
              const intensity = item.commits === 0 ? 0 : Math.ceil((item.commits / maxDayCommits) * 4);
              return (
                <div key={index} className="text-center">
                  <div 
                    className={`h-16 mb-2 border border-white/10 ${getColor(intensity)}`}
                    title={`${item.day} - ${item.commits} commits`}
                  />
                  <p className="text-xs text-white/40">{item.day.slice(0, 3)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex items-center gap-2">
        <p className="text-xs text-white/30">Less</p>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((intensity) => (
            <div 
              key={intensity}
              className={`w-4 h-4 border border-white/10 ${getColor(intensity)}`}
            />
          ))}
        </div>
        <p className="text-xs text-white/30">More</p>
      </div>
    </div>
  );
}

export default ProductivityHeatmap;

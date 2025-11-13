import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

/**
 * Trend Chart Component for 90-day activity view
 * Displays commit trends over time
 */
function AnalyticsTrendChart({ data, title = "Activity Trend" }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 p-6">
        <p className="text-sm text-white/40 mb-4">{title}</p>
        <div className="h-64 flex items-center justify-center">
          <p className="text-base text-white/20">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 p-6">
      <p className="text-sm text-white/40 mb-4">{title}</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="date" 
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              color: 'rgba(255,255,255,0.9)'
            }}
          />
          <Legend 
            wrapperStyle={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="commits" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AnalyticsTrendChart;

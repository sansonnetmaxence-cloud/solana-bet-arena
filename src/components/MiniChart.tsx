import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
}

const MiniChart = ({ data, height = 90 }: MiniChartProps) => {
  const chartData = useMemo(() =>
    data.map((value, i) => ({ i, value })),
  [data]);

  const trendUp = data.length >= 2 && data[data.length - 1] >= data[0];
  const color = trendUp ? 'hsl(160, 100%, 51%)' : 'hsl(0, 100%, 63%)';
  const gradId = trendUp ? 'fillGreen' : 'fillRed';

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center opacity-40" style={{ width: '100%', height }}>
        <span className="text-[10px] text-muted-foreground font-display tracking-widest uppercase">Loading chart...</span>
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const pad = (max - min) * 0.1 || 0.5;

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={[min - pad, max + pad]} hide />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradId})`}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MiniChart;

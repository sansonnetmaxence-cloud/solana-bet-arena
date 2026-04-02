import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface DepthChartProps {
  currentPrice: number | null;
}

const DepthChart = ({ currentPrice }: DepthChartProps) => {
  const data = useMemo(() => {
    if (!currentPrice) return [];
    const points: { price: number; bids: number; asks: number }[] = [];
    const spread = currentPrice * 0.02;
    const steps = 20;

    // Bids (left side) - cumulative descending
    let cumBid = 0;
    for (let i = steps; i >= 1; i--) {
      const price = currentPrice - (i / steps) * spread;
      cumBid += Math.random() * 80 + 20;
      points.push({ price: +price.toFixed(2), bids: +cumBid.toFixed(1), asks: 0 });
    }

    // Mid point
    points.push({ price: +currentPrice.toFixed(2), bids: 0, asks: 0 });

    // Asks (right side) - cumulative ascending
    let cumAsk = 0;
    for (let i = 1; i <= steps; i++) {
      const price = currentPrice + (i / steps) * spread;
      cumAsk += Math.random() * 80 + 20;
      points.push({ price: +price.toFixed(2), bids: 0, asks: +cumAsk.toFixed(1) });
    }

    return points;
  }, [currentPrice]);

  if (!currentPrice) return null;

  return (
    <div className="mt-3 rounded-xl border border-border/30 bg-card/30 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-display uppercase tracking-wider text-muted-foreground/80 font-semibold">
          Depth Chart
        </span>
        <span className="text-[10px] text-muted-foreground/50 font-mono">
          ${currentPrice.toFixed(2)}
        </span>
      </div>
      <div className="h-[160px] sm:h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="bidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160, 100%, 51%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(160, 100%, 51%)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="askGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0, 100%, 63%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(0, 100%, 63%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="price"
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              tickCount={5}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border) / 0.3)',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'var(--font-display)',
              }}
              labelFormatter={(v) => `$${v}`}
            />
            <Area
              type="stepAfter"
              dataKey="bids"
              stroke="hsl(160, 100%, 51%)"
              strokeWidth={1.5}
              fill="url(#bidGrad)"
              isAnimationActive={false}
            />
            <Area
              type="stepAfter"
              dataKey="asks"
              stroke="hsl(0, 100%, 63%)"
              strokeWidth={1.5}
              fill="url(#askGrad)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DepthChart;

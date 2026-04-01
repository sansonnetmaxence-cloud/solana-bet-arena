import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface BetRecord {
  id: string;
  direction: 'up' | 'down';
  targetPrice: number;
  startPrice: number;
  endPrice: number;
  amount: number;
  timeframe: number;
  result: 'won' | 'lost';
  timestamp: Date;
}

interface PnLChartProps {
  history: BetRecord[];
  currency: 'SOL' | 'USD';
  solPrice: number;
}

const PnLChart = ({ history, currency, solPrice }: PnLChartProps) => {
  const chartData = useMemo(() => {
    if (history.length === 0) return [];
    let cumulative = 0;
    return [
      { index: 0, pnl: 0, label: 'Start' },
      ...history.map((bet, i) => {
        cumulative += bet.result === 'won' ? bet.amount : -bet.amount;
        const value = currency === 'USD' ? cumulative * solPrice : cumulative;
        return {
          index: i + 1,
          pnl: parseFloat(value.toFixed(2)),
          label: `#${i + 1}`,
        };
      }),
    ];
  }, [history, currency, solPrice]);

  if (history.length < 1) return null;

  const lastValue = chartData[chartData.length - 1]?.pnl ?? 0;
  const isPositive = lastValue >= 0;
  const color = isPositive ? 'hsl(160, 100%, 51%)' : 'hsl(0, 100%, 63%)';

  const min = Math.min(...chartData.map(d => d.pnl));
  const max = Math.max(...chartData.map(d => d.pnl));
  const pad = (max - min) * 0.15 || 1;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-display text-sm sm:text-base text-foreground uppercase tracking-widest font-bold">
          Performance
        </h4>
        <span className={cn(
          'font-display text-base sm:text-xl font-black tabular-nums px-3 py-1 rounded-lg',
          isPositive ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
        )}>
          {isPositive ? '+' : ''}{lastValue.toFixed(2)} {currency === 'SOL' ? 'SOL' : '$'}
        </span>
      </div>
      <div className="w-full h-[160px] sm:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" hide />
            <YAxis domain={[min - pad, max + pad]} hide />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const val = payload[0].value as number;
                return (
                  <div className="bg-card/95 backdrop-blur-md border border-border/30 rounded-lg px-3 py-2 shadow-xl">
                    <span className={cn(
                      'font-display text-sm font-bold tabular-nums',
                      val >= 0 ? 'text-success' : 'text-danger'
                    )}>
                      {val >= 0 ? '+' : ''}{val.toFixed(2)} {currency === 'SOL' ? 'SOL' : '$'}
                    </span>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="pnl"
              stroke={color}
              strokeWidth={2.5}
              fill="url(#pnlGrad)"
              dot={false}
              activeDot={{ r: 5, fill: color, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PnLChart;

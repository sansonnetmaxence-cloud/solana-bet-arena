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

interface BetHistoryProps {
  history: BetRecord[];
}

const BetHistory = ({ history }: BetHistoryProps) => {
  if (history.length === 0) {
    return (
      <div className="w-full px-6 py-8 text-center">
        <span className="font-display text-xs text-muted-foreground/50 uppercase tracking-widest">
          No bets yet — start playing!
        </span>
      </div>
    );
  }

  const totalWon = history.filter(b => b.result === 'won').length;
  const totalLost = history.filter(b => b.result === 'lost').length;
  const totalProfit = history.reduce((acc, b) =>
    acc + (b.result === 'won' ? b.amount : -b.amount), 0
  );

  return (
    <div className="w-full px-4 md:px-8 py-8">
      {/* Stats bar */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg md:text-xl text-foreground uppercase tracking-widest font-bold">
          📊 Bet History
        </h3>
        <div className="flex items-center gap-4">
          <span className="font-display text-sm md:text-base text-success uppercase tracking-wider font-bold">
            {totalWon}W
          </span>
          <span className="font-display text-sm md:text-base text-danger uppercase tracking-wider font-bold">
            {totalLost}L
          </span>
          <span className={cn(
            'font-display text-lg md:text-xl font-black',
            totalProfit >= 0 ? 'text-success text-glow-green' : 'text-danger text-glow-red'
          )}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} SOL
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/50">
              {['Time', 'Direction', 'Target', 'Entry', 'Exit', 'Amount', 'Result'].map(h => (
                <th key={h} className="font-display text-xs text-muted-foreground/70 uppercase tracking-widest pb-3 px-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.slice().reverse().map((bet) => (
              <tr key={bet.id} className="border-b border-border/20 hover:bg-card/50 transition-colors">
                <td className="py-2 px-2 font-mono text-[10px] text-muted-foreground">
                  {bet.timestamp.toLocaleTimeString()}
                </td>
                <td className="py-2 px-2">
                  <span className={cn(
                    'font-display text-[10px] uppercase',
                    bet.direction === 'up' ? 'text-success' : 'text-danger'
                  )}>
                    {bet.direction === 'up' ? '▲ UP' : '▼ DOWN'}
                  </span>
                </td>
                <td className="py-2 px-2 font-mono text-[10px] text-foreground">
                  ${bet.targetPrice.toFixed(2)}
                </td>
                <td className="py-2 px-2 font-mono text-[10px] text-muted-foreground">
                  ${bet.startPrice.toFixed(2)}
                </td>
                <td className="py-2 px-2 font-mono text-[10px] text-muted-foreground">
                  ${bet.endPrice.toFixed(2)}
                </td>
                <td className="py-2 px-2 font-mono text-[10px] text-foreground">
                  {bet.amount} SOL
                </td>
                <td className="py-2 px-2">
                  <span className={cn(
                    'font-display text-[10px] font-bold uppercase px-2 py-0.5 rounded',
                    bet.result === 'won'
                      ? 'text-success bg-success/10 border border-success/30'
                      : 'text-danger bg-danger/10 border border-danger/30'
                  )}>
                    {bet.result === 'won' ? `+${bet.amount}` : `-${bet.amount}`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { type BetRecord };
export default BetHistory;

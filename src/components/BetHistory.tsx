import { useState } from 'react';
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
  const [currency, setCurrency] = useState<'SOL' | 'USD'>('SOL');
  const solPrice = 130; // approximate SOL/USD for display

  const formatAmount = (amount: number, prefix = '') => {
    if (currency === 'USD') return `${prefix}$${(amount * solPrice).toFixed(2)}`;
    return `${prefix}${amount.toFixed(2)} SOL`;
  };

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
          Bet History
        </h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrency(c => c === 'SOL' ? 'USD' : 'SOL')}
            className="px-2 py-0.5 rounded border border-border/40 text-[9px] font-display font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            {currency === 'SOL' ? '◎ SOL' : '$ USD'}
          </button>
          <span className="font-display text-sm md:text-base text-success uppercase tracking-wider font-bold">
            {totalWon}W
          </span>
          <span className="font-display text-sm md:text-base text-danger uppercase tracking-wider font-bold">
            {totalLost}L
          </span>
          <span className={cn(
            'font-display text-lg md:text-xl font-black',
            totalProfit >= 0 ? 'text-success' : 'text-danger'
          )}>
            {totalProfit >= 0 ? '+' : ''}{formatAmount(Math.abs(totalProfit), totalProfit >= 0 ? '+' : '-').replace(/^[+-]/, totalProfit >= 0 ? '+' : '-')}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/50">
              {['Time', 'Direction', 'Target', 'Entry', 'Exit', 'Amount', 'P&L', 'Result'].map(h => (
                <th key={h} className="font-display text-xs text-muted-foreground/70 uppercase tracking-widest pb-3 px-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.slice().reverse().map((bet) => (
              <tr key={bet.id} className="border-b border-border/20 hover:bg-card/50 transition-colors">
                <td className="py-3 px-3 font-mono text-sm text-muted-foreground">
                  {bet.timestamp.toLocaleTimeString()}
                </td>
                <td className="py-3 px-3">
                  <span className={cn(
                    'font-display text-sm uppercase font-bold',
                    bet.direction === 'up' ? 'text-primary' : 'text-danger'
                  )}>
                    {bet.direction === 'up' ? '▲ UP' : '▼ DOWN'}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-sm text-foreground font-bold">
                  ${bet.targetPrice.toFixed(2)}
                </td>
                <td className="py-3 px-3 font-mono text-sm text-muted-foreground">
                  ${bet.startPrice.toFixed(2)}
                </td>
                <td className="py-3 px-3 font-mono text-sm text-muted-foreground">
                  ${bet.endPrice.toFixed(2)}
                </td>
                <td className="py-3 px-3 font-mono text-sm text-foreground font-bold">
                  {bet.amount} SOL
                </td>
                <td className="py-3 px-3">
                  <span className={cn(
                    'font-mono text-sm font-bold tabular-nums',
                    bet.result === 'won' ? 'text-success' : 'text-danger'
                  )}>
                    {bet.result === 'won' ? '+' : '-'}{formatAmount(bet.amount)}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className={cn(
                    'font-display text-sm font-black uppercase px-3 py-1 rounded',
                    bet.result === 'won'
                      ? 'text-success bg-success/10 border border-success/30'
                      : 'text-danger bg-danger/10 border border-danger/30'
                  )}>
                    {bet.result === 'won' ? 'WIN' : 'LOSS'}
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

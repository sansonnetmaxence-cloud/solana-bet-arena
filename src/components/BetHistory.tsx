import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DollarSign, CircleDot, ArrowLeftRight } from 'lucide-react';
import PnLChart from './PnLChart';

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
  const solPrice = 130;

  const formatAmount = (amount: number, prefix = '') => {
    if (currency === 'USD') return `${prefix}$${(amount * solPrice).toFixed(2)}`;
    return `${prefix}${amount.toFixed(2)} SOL`;
  };

  if (history.length === 0) {
    return (
      <div className="w-full px-4 sm:px-6 py-6 sm:py-8 text-center">
        <span className="font-display text-[10px] sm:text-xs text-muted-foreground/50 uppercase tracking-widest">
          No bets yet — start playing!
        </span>
      </div>
    );
  }

  const totalWon = history.filter(b => b.result === 'won').length;
  const totalLost = history.filter(b => b.result === 'lost').length;
  const totalProfit = history.reduce((acc, b) => acc + (b.result === 'won' ? b.amount : -b.amount), 0);
  const winrate = history.length > 0 ? ((totalWon / history.length) * 100).toFixed(1) : '0.0';

  // Best trade
  const bestTrade = history.reduce((best, b) => {
    if (b.result === 'won' && b.amount > (best?.amount ?? 0)) return b;
    return best;
  }, null as (typeof history)[0] | null);

  // Current streak
  const reversed = [...history].reverse();
  let streakType: 'won' | 'lost' | null = reversed[0]?.result ?? null;
  let streakCount = 0;
  for (const b of reversed) {
    if (b.result === streakType) streakCount++;
    else break;
  }

  return (
    <div className="w-full px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8">
      {/* Stats bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
        <h3 className="font-display text-base sm:text-lg md:text-xl text-foreground uppercase tracking-widest font-bold">
          Bet History
        </h3>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <button
            onClick={() => setCurrency(c => c === 'SOL' ? 'USD' : 'SOL')}
            className="flex items-center gap-1 px-2 py-0.5 rounded border border-border/40 text-[8px] sm:text-[9px] font-display font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            {currency === 'SOL'
              ? <CircleDot size={10} className="text-muted-foreground" />
              : <DollarSign size={10} className="text-muted-foreground" />
            }
            <ArrowLeftRight size={8} className="text-muted-foreground/50" />
            {currency === 'SOL'
              ? <DollarSign size={10} className="text-muted-foreground/50" />
              : <CircleDot size={10} className="text-muted-foreground/50" />
            }
          </button>
          <span className="font-display text-xs sm:text-sm md:text-base text-success uppercase tracking-wider font-bold">{totalWon}W</span>
          <span className="font-display text-xs sm:text-sm md:text-base text-danger uppercase tracking-wider font-bold">{totalLost}L</span>
          <span className={cn(
            'font-display text-sm sm:text-lg md:text-xl font-black',
            totalProfit >= 0 ? 'text-success' : 'text-danger'
          )}>
            {totalProfit >= 0 ? '+' : ''}{formatAmount(Math.abs(totalProfit), totalProfit >= 0 ? '+' : '-').replace(/^[+-]/, totalProfit >= 0 ? '+' : '-')}
          </span>
        </div>
      </div>

      {/* P&L Chart */}
      {history.length >= 1 && (
        <div className="mb-4 sm:mb-6 p-4 sm:p-5 rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm shadow-sm">
          <PnLChart history={history} currency={currency} solPrice={solPrice} />
        </div>
      )}

      {/* Mobile cards view */}
      <div className="flex flex-col gap-2 sm:hidden">
        {history.slice().reverse().map((bet) => (
          <div key={bet.id} className={cn(
            'rounded-lg border p-3 flex items-center justify-between',
            bet.result === 'won' ? 'border-success/20 bg-success/[0.03]' : 'border-danger/20 bg-danger/[0.03]'
          )}>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'font-display text-xs uppercase font-bold',
                  bet.direction === 'up' ? 'text-primary' : 'text-danger'
                )}>
                  {bet.direction === 'up' ? '▲ UP' : '▼ DN'}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {bet.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <span className="font-mono text-xs text-foreground">${bet.targetPrice.toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className={cn(
                'font-display text-sm font-black uppercase px-2 py-0.5 rounded',
                bet.result === 'won'
                  ? 'text-success bg-success/10'
                  : 'text-danger bg-danger/10'
              )}>
                {bet.result === 'won' ? 'WIN' : 'LOSS'}
              </span>
              <span className={cn(
                'font-mono text-xs font-bold tabular-nums',
                bet.result === 'won' ? 'text-success' : 'text-danger'
              )}>
                {bet.result === 'won' ? '+' : '-'}{formatAmount(bet.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden sm:block overflow-x-auto scrollbar-hide">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/50">
              {['Time', 'Direction', 'Target', 'Entry', 'Exit', 'Amount', 'P&L', 'Result'].map(h => (
                <th key={h} className="font-display text-[10px] md:text-xs text-muted-foreground/70 uppercase tracking-widest pb-2 sm:pb-3 px-2 sm:px-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.slice().reverse().map((bet) => (
              <tr key={bet.id} className="border-b border-border/20 hover:bg-card/50 transition-colors">
                <td className="py-2 sm:py-3 px-2 sm:px-3 font-mono text-xs sm:text-sm text-muted-foreground">
                  {bet.timestamp.toLocaleTimeString()}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-3">
                  <span className={cn(
                    'font-display text-xs sm:text-sm uppercase font-bold',
                    bet.direction === 'up' ? 'text-primary' : 'text-danger'
                  )}>
                    {bet.direction === 'up' ? '▲ UP' : '▼ DOWN'}
                  </span>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-3 font-mono text-xs sm:text-sm text-foreground font-bold">
                  ${bet.targetPrice.toFixed(2)}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-3 font-mono text-xs sm:text-sm text-muted-foreground">
                  ${bet.startPrice.toFixed(2)}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-3 font-mono text-xs sm:text-sm text-muted-foreground">
                  ${bet.endPrice.toFixed(2)}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-3 font-mono text-xs sm:text-sm text-foreground font-bold">
                  {bet.amount} SOL
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-3">
                  <span className={cn(
                    'font-mono text-xs sm:text-sm font-bold tabular-nums',
                    bet.result === 'won' ? 'text-success' : 'text-danger'
                  )}>
                    {bet.result === 'won' ? '+' : '-'}{formatAmount(bet.amount)}
                  </span>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-3">
                  <span className={cn(
                    'font-display text-xs sm:text-sm font-black uppercase px-2 sm:px-3 py-0.5 sm:py-1 rounded',
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

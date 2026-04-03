import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { MarketSymbol } from '@/hooks/useCryptoPrice';
import MarketSelector from './MarketSelector';

interface HeaderProps {
  priceDirection: 'up' | 'down' | 'neutral';
  selectedMarket: MarketSymbol;
  onMarketChange: (market: MarketSymbol) => void;
}


const Header = ({ priceDirection, selectedMarket, onMarketChange }: HeaderProps) => {
  const [totalSol, setTotalSol] = useState(124_853.42);

  useEffect(() => {
    const interval = setInterval(() => {
      const gain = 0.05 + Math.random() * 2.5;
      setTotalSol(prev => prev + gain);
    }, 800 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-b border-border/30 bg-card/40 backdrop-blur-md relative z-20">
      <header className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="font-display text-primary text-xs sm:text-sm font-black">◎</span>
            </div>
            <div className="flex flex-col">
              <h1 className="font-display text-sm sm:text-base font-bold tracking-wider uppercase leading-tight">
                <span className="text-primary">SOL</span>
                <span className="text-foreground/60">BET</span>
              </h1>
              <span className="font-display text-[7px] sm:text-[8px] text-muted-foreground tracking-widest uppercase hidden sm:block">Prediction Market</span>
            </div>
          </div>
          <div className="hidden sm:block h-6 w-px bg-border/30" />
          <MarketSelector selectedMarket={selectedMarket} onMarketChange={onMarketChange} />
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-success/[0.04] border border-success/10">
          <span className="font-display text-[7px] sm:text-[8px] text-success/60 uppercase tracking-widest">Community Wins</span>
          <span className="font-display text-sm sm:text-base font-black text-success tabular-nums">
            {totalSol.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="font-display text-[8px] sm:text-[9px] text-success/50 font-bold">SOL</span>
        </div>

        <div className="flex sm:hidden items-center gap-1.5 px-2 py-1 rounded-md bg-success/[0.04] border border-success/10">
          <span className="font-display text-xs font-black text-success tabular-nums">
            {(totalSol / 1000).toFixed(1)}K
          </span>
          <span className="font-display text-[7px] text-success/50 font-bold">SOL</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-danger" />
          </span>
          <span className="font-display text-[8px] sm:text-[9px] text-danger uppercase tracking-widest font-bold">Live</span>
        </div>
      </header>

      {/* Market pairs strip */}
      <div className="flex items-center gap-1 px-3 sm:px-6 pb-2 overflow-x-auto scrollbar-hide">
        {markets.map((m) => (
          <button
            key={m.pair}
            onClick={() => m.symbol && onMarketChange(m.symbol)}
            disabled={m.soon}
            className={cn(
              'relative px-3 py-1 rounded-md text-[10px] sm:text-[11px] font-display font-semibold tracking-wide whitespace-nowrap transition-all duration-200 border',
              m.symbol === selectedMarket
                ? 'border-primary/40 text-primary bg-primary/10'
                : m.soon
                  ? 'border-border/20 text-muted-foreground/30 cursor-not-allowed'
                  : 'border-border/20 text-muted-foreground/60 hover:text-foreground hover:border-border/40'
            )}
          >
            {m.pair}
            {m.soon && (
              <span className="ml-1.5 text-[8px] font-mono text-muted-foreground/30 uppercase">soon</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Header;

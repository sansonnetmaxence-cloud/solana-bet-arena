import { useState, useEffect } from 'react';

interface HeaderProps {
  priceDirection: 'up' | 'down' | 'neutral';
}

const Header = ({ priceDirection }: HeaderProps) => {
  const [totalSol, setTotalSol] = useState(124_853.42);

  useEffect(() => {
    const interval = setInterval(() => {
      const gain = 0.05 + Math.random() * 2.5;
      setTotalSol(prev => prev + gain);
    }, 800 + Math.random() * 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border/30 bg-card/40 backdrop-blur-md relative z-20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="font-display text-primary text-sm font-black">◎</span>
        </div>
        <div className="flex flex-col">
          <h1 className="font-display text-base font-bold tracking-wider uppercase leading-tight">
            <span className="text-primary">SOL</span>
            <span className="text-foreground/60">BET</span>
          </h1>
          <span className="font-display text-[8px] text-muted-foreground tracking-widest uppercase">Prediction Market</span>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/[0.04] border border-success/10">
        <span className="font-display text-[8px] text-success/60 uppercase tracking-widest">Community Wins</span>
        <span className="font-display text-base font-black text-success tabular-nums">
          {totalSol.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="font-display text-[9px] text-success/50 font-bold">SOL</span>
      </div>

      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${priceDirection === 'up' ? 'bg-success' : priceDirection === 'down' ? 'bg-danger' : 'bg-muted-foreground'}`} />
        <span className="font-display text-[9px] text-muted-foreground uppercase tracking-widest">Live</span>
      </div>
    </header>
  );
};

export default Header;

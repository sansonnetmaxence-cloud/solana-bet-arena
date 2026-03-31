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
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center glow-primary">
          <span className="font-display text-primary text-xs font-bold">S</span>
        </div>
        <h1 className="font-display text-lg md:text-xl font-bold tracking-wider uppercase">
          <span className="text-primary text-glow-primary">SOL</span>
          <span className="text-muted-foreground">BET</span>
        </h1>
      </div>

      <div className="flex items-center gap-2 bg-success/5 border border-success/20 rounded-lg px-4 py-2">
        <span className="font-display text-[9px] text-success/70 uppercase tracking-widest">🏆 Community Wins</span>
        <span className="font-display text-lg md:text-xl font-black text-success text-glow-green tabular-nums">
          {totalSol.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="font-display text-xs text-success/60 font-bold">SOL</span>
      </div>

      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${priceDirection === 'up' ? 'bg-success animate-pulse-glow' : priceDirection === 'down' ? 'bg-danger animate-pulse-glow' : 'bg-muted-foreground'}`} />
        <span className="font-display text-[10px] text-muted-foreground uppercase tracking-widest">Live Feed</span>
      </div>
    </header>
  );
};

export default Header;

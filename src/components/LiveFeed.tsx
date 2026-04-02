import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const PSEUDOS = [
  'CryptoKing', 'SolHunter', 'MoonBoy', 'DiamondHands', 'Whale99',
  'Degen_Alpha', 'SOLdier', 'PumpMaster', 'NightTrader', 'FlipGod',
  'TokenBeast', 'ChartWizard', 'BullRunner', 'GreenCandle', 'SharkFin',
  'LiquidGold', 'RocketMan', 'SolSurfer', 'BlockSmith', 'CoinSniper',
  'ApeKing', 'PhantomX', 'VoltTrader', 'IronHands', 'StackOverflow',
  'MegaBull', 'SolFlare69', 'CryptoNinja', 'WhaleTail', 'AlphaWolf',
];

const playBigWinSound = () => {
  try {
    const ctx = new AudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch {}
};

const generateFakeTrade = () => {
  const pseudo = PSEUDOS[Math.floor(Math.random() * PSEUDOS.length)];
  const suffix = Math.floor(Math.random() * 999);
  const won = Math.random() > 0.3;
  const amount = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10][Math.floor(Math.random() * 8)];
  const priceBase = 120 + Math.random() * 40;
  const direction = Math.random() > 0.5 ? 'up' : 'down';
  const timeframe = ['30s', '1min', '2min', '5min'][Math.floor(Math.random() * 4)];
  return { id: crypto.randomUUID(), pseudo: `${pseudo}${suffix}`, won, amount, price: priceBase.toFixed(2), direction, timeframe };
};

interface Trade {
  id: string; pseudo: string; won: boolean; amount: number; price: string; direction: string; timeframe: string;
}

const LiveFeed = () => {
  const [trades, setTrades] = useState<Trade[]>(() => Array.from({ length: 8 }, generateFakeTrade));

  const showBigWinToast = useCallback((trade: Trade) => {
    playBigWinSound();
    toast({
      title: `${trade.pseudo} just won BIG!`,
      description: `+${trade.amount} SOL on $${trade.price} ${trade.direction === 'up' ? '▲' : '▼'} (${trade.timeframe})`,
      className: 'border-success/60 bg-success/10 text-success font-display',
      duration: 5000,
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTrade = generateFakeTrade();
      if (newTrade.won && newTrade.amount >= 5) showBigWinToast(newTrade);
      setTrades(prev => [newTrade, ...prev].slice(0, 30));
    }, 1500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [showBigWinToast]);

  return (
    <div className="w-full py-2 px-2 sm:px-4 overflow-hidden">
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
        <span className="font-display text-[9px] sm:text-[10px] text-muted-foreground/60 uppercase tracking-widest">
          Live Trades
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {trades.slice(0, 12).map((trade, i) => (
          <div
            key={trade.id}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] sm:text-[11px]',
              'backdrop-blur-md border transition-all duration-500',
              'animate-fade-in',
              trade.won
                ? 'bg-success/[0.08] border-success/20 text-success'
                : 'bg-danger/[0.06] border-danger/15 text-danger/70',
              i === 0 && 'ring-1 ring-primary/20 scale-105',
            )}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className="font-bold text-[9px]">
              {trade.direction === 'up' ? '▲' : '▼'}
            </span>
            <span className="font-display font-semibold truncate max-w-[60px] sm:max-w-[80px]">
              {trade.pseudo}
            </span>
            <span className="font-mono font-bold">
              {trade.won ? '+' : '-'}{trade.amount}
            </span>
            <span className="text-muted-foreground/40 text-[8px] hidden sm:inline">
              {trade.timeframe}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveFeed;

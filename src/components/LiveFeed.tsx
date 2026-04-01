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
  const [trades, setTrades] = useState<Trade[]>(() => Array.from({ length: 5 }, generateFakeTrade));

  const showBigWinToast = useCallback((trade: Trade) => {
    playBigWinSound();
    toast({
      title: `🏆 ${trade.pseudo} just won BIG!`,
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
    <div className="w-full border-t border-border/30 bg-card/20 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-b border-border/20">
        <span className="text-danger text-[9px] sm:text-[10px] animate-pulse">●</span>
        <span className="font-display text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest">Live Trades</span>
      </div>
      <div className="relative h-[120px] sm:h-[160px] md:h-[180px] overflow-hidden">
        <div className="absolute inset-0 flex flex-col">
          {trades.slice(0, 8).map((trade, i) => (
            <div
              key={trade.id}
              className={cn(
                'flex items-center justify-between px-3 sm:px-4 py-1 sm:py-1.5 border-b border-border/10 transition-all duration-500',
                i === 0 && 'animate-slide-in-feed',
              )}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <span className={cn(
                  'text-[9px] sm:text-[10px] font-bold',
                  trade.direction === 'up' ? 'text-success' : 'text-danger'
                )}>
                  {trade.direction === 'up' ? '▲' : '▼'}
                </span>
                <span className="font-display text-[10px] sm:text-xs text-foreground/90 truncate max-w-[60px] sm:max-w-[100px]">
                  {trade.pseudo}
                </span>
                <span className="text-[8px] sm:text-[9px] text-muted-foreground hidden sm:inline">
                  ${trade.price} • {trade.timeframe}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {trade.won ? (
                  <span className="font-display text-[10px] sm:text-xs font-bold text-success">
                    +{trade.amount} SOL 🏆
                  </span>
                ) : (
                  <span className="font-display text-[10px] sm:text-xs text-danger/60">
                    -{trade.amount} SOL
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-10 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default LiveFeed;

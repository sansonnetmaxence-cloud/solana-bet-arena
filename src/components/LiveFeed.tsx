import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const PSEUDOS = [
  'CryptoKing', 'SolHunter', 'MoonBoy', 'DiamondHands', 'Whale99',
  'Degen_Alpha', 'SOLdier', 'PumpMaster', 'NightTrader', 'FlipGod',
  'TokenBeast', 'ChartWizard', 'BullRunner', 'GreenCandle', 'SharkFin',
  'LiquidGold', 'RocketMan', 'SolSurfer', 'BlockSmith', 'CoinSniper',
  'ApeKing', 'PhantomX', 'VoltTrader', 'IronHands', 'StackOverflow',
  'MegaBull', 'SolFlare69', 'CryptoNinja', 'WhaleTail', 'AlphaWolf',
];

const generateFakeTrade = () => {
  const pseudo = PSEUDOS[Math.floor(Math.random() * PSEUDOS.length)];
  const suffix = Math.floor(Math.random() * 999);
  const won = Math.random() > 0.3; // 70% win rate to entice
  const amount = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10][Math.floor(Math.random() * 8)];
  const priceBase = 120 + Math.random() * 40;
  const direction = Math.random() > 0.5 ? 'up' : 'down';
  const timeframe = ['30s', '1min', '2min', '5min'][Math.floor(Math.random() * 4)];

  return {
    id: crypto.randomUUID(),
    pseudo: `${pseudo}${suffix}`,
    won,
    amount,
    price: priceBase.toFixed(2),
    direction,
    timeframe,
  };
};

interface Trade {
  id: string;
  pseudo: string;
  won: boolean;
  amount: number;
  price: string;
  direction: string;
  timeframe: string;
}

const LiveFeed = () => {
  const [trades, setTrades] = useState<Trade[]>(() =>
    Array.from({ length: 5 }, generateFakeTrade)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTrades(prev => {
        const next = [generateFakeTrade(), ...prev];
        return next.slice(0, 30);
      });
    }, 1500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full border-t border-border/30 bg-card/20 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/20">
        <span className="text-danger text-[10px] animate-pulse">●</span>
        <span className="font-display text-[10px] text-muted-foreground uppercase tracking-widest">Live Trades</span>
      </div>
      <div className="relative h-[180px] overflow-hidden">
        <div className="absolute inset-0 flex flex-col">
          {trades.slice(0, 8).map((trade, i) => (
            <div
              key={trade.id}
              className={cn(
                'flex items-center justify-between px-4 py-1.5 border-b border-border/10 transition-all duration-500',
                i === 0 && 'animate-slide-in-feed',
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn(
                  'text-[10px] font-bold',
                  trade.direction === 'up' ? 'text-success' : 'text-danger'
                )}>
                  {trade.direction === 'up' ? '▲' : '▼'}
                </span>
                <span className="font-display text-xs text-foreground/90 truncate max-w-[100px]">
                  {trade.pseudo}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  ${trade.price} • {trade.timeframe}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {trade.won ? (
                  <span className="font-display text-xs font-bold text-success text-glow-green">
                    +{trade.amount} SOL 🏆
                  </span>
                ) : (
                  <span className="font-display text-xs text-danger/60">
                    -{trade.amount} SOL
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default LiveFeed;

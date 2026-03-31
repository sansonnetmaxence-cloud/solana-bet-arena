import { useMemo } from 'react';
import PriceCard from './PriceCard';
import { cn } from '@/lib/utils';

interface BettingGridProps {
  currentPrice: number | null;
  previousPrice: number | null;
  priceHistory: number[];
  onSelectBet: (price: number, direction: 'up' | 'down', quickTimeframe?: number) => void;
  activeBet: { price: number; direction: 'up' | 'down'; timeframe: number; startPrice: number } | null;
  betResult: 'won' | 'lost' | null;
  quickBetMode?: boolean;
}

const TIMEFRAMES = ['1min', '2min', '5min', '30s'];

const BettingGrid = ({ currentPrice, previousPrice, priceHistory, onSelectBet, activeBet, betResult, quickBetMode }: BettingGridProps) => {
  const basePrice = currentPrice ?? 150;

  // Start at 0.10 from current price, increment by 0.10
  const offsets = useMemo(() => {
    const result: number[] = [];
    const steps = [
      ...Array.from({ length: 10 }, (_, i) => 0.1 + i * 0.1),   // 0.10 to 1.00
      ...Array.from({ length: 10 }, (_, i) => 1.25 + i * 0.25),  // 1.25 to 3.50
      ...Array.from({ length: 10 }, (_, i) => 4 + i * 1),         // 4 to 13
    ];
    return steps;
  }, []);

  const downPrices = useMemo(() =>
    offsets.map(o => Math.round((basePrice - o) * 100) / 100).reverse()
  , [basePrice, offsets]);

  const upPrices = useMemo(() =>
    offsets.map(o => Math.round((basePrice + o) * 100) / 100)
  , [basePrice, offsets]);

  const randomTimes = useMemo(() => {
    const map: Record<string, string> = {};
    [...downPrices, ...upPrices].forEach((p) => {
      map[p.toFixed(4)] = TIMEFRAMES[Math.floor(Math.random() * TIMEFRAMES.length)];
    });
    return map;
  }, [basePrice]);

  const parseTime = (label: string): number => {
    if (label === '30s') return 0.5;
    return parseInt(label);
  };

  const renderCard = (p: number, dir: 'up' | 'down', index: number) => {
    const timeLabel = quickBetMode ? randomTimes[p.toFixed(4)] : undefined;
    const isActive = activeBet?.price === p && activeBet?.direction === dir;
    return (
      <div
        key={`${dir}-${p}`}
        className={cn(
          'transition-all duration-500',
          activeBet && !isActive && 'opacity-10 blur-[2px] scale-95',
          activeBet && isActive && 'z-20 scale-110',
        )}
        style={{
          animationDelay: `${index * 20}ms`,
        }}
      >
        <PriceCard
          price={p}
          direction={dir}
          onClick={() => onSelectBet(p, dir, timeLabel ? parseTime(timeLabel) : undefined)}
          selected={isActive ?? false}
          result={isActive ? betResult : null}
          disabled={!!activeBet}
          timeLabel={timeLabel}
        />
      </div>
    );
  };

  return (
    <div className={cn(
      'relative flex items-center justify-center gap-3 md:gap-5 transition-all duration-500',
    )}>
      {/* Down bets */}
      <div className="grid grid-cols-5 gap-1 md:gap-1.5 max-h-[80vh] overflow-y-auto scrollbar-hide">
        {downPrices.map((p, i) => renderCard(p, 'down', i))}
      </div>

      {/* Center */}
      <div className={cn(
        'transition-all duration-700 shrink-0',
        activeBet && 'scale-105',
      )}>
        <PriceCard
          price={0}
          direction="up"
          isCenter
          currentPrice={currentPrice ?? undefined}
          previousPrice={previousPrice ?? undefined}
          priceHistory={priceHistory}
        />
      </div>

      {/* Up bets */}
      <div className="grid grid-cols-5 gap-1 md:gap-1.5 max-h-[80vh] overflow-y-auto scrollbar-hide">
        {upPrices.map((p, i) => renderCard(p, 'up', i))}
      </div>
    </div>
  );
};

export default BettingGrid;

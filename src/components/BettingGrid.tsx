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

  const offsets = [
    0.01, 0.05, 0.1, 0.15, 0.2, 0.25, 0.35, 0.5, 0.75,
    1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 10, 12,
    15, 18, 20, 25, 30, 35
  ];

  const downPrices = useMemo(() =>
    offsets.map(o => basePrice - o).reverse()
  , [basePrice]);

  const upPrices = useMemo(() =>
    offsets.map(o => basePrice + o)
  , [basePrice]);

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

  const renderCard = (p: number, dir: 'up' | 'down') => {
    const timeLabel = quickBetMode ? randomTimes[p.toFixed(4)] : undefined;
    return (
      <PriceCard
        key={`${dir}-${p}`}
        price={p}
        direction={dir}
        onClick={() => onSelectBet(p, dir, timeLabel ? parseTime(timeLabel) : undefined)}
        selected={activeBet?.price === p && activeBet?.direction === dir}
        result={activeBet?.price === p && activeBet?.direction === dir ? betResult : null}
        disabled={!!activeBet}
        timeLabel={timeLabel}
      />
    );
  };

  return (
    <div className={cn(
      'relative flex items-center justify-center gap-3 md:gap-5 transition-all duration-500',
      betResult && 'after:absolute after:inset-0 after:bg-background/60 after:rounded-xl after:pointer-events-none after:z-10'
    )}>
      {/* Down bets */}
      <div className="grid grid-cols-5 gap-1 md:gap-1.5 max-h-[80vh] overflow-y-auto scrollbar-hide">
        {downPrices.map((p) => renderCard(p, 'down'))}
      </div>

      {/* Center */}
      <PriceCard
        price={0}
        direction="up"
        isCenter
        currentPrice={currentPrice ?? undefined}
        previousPrice={previousPrice ?? undefined}
        priceHistory={priceHistory}
      />

      {/* Up bets */}
      <div className="grid grid-cols-5 gap-1 md:gap-1.5 max-h-[80vh] overflow-y-auto scrollbar-hide">
        {upPrices.map((p) => renderCard(p, 'up'))}
      </div>
    </div>
  );
};

export default BettingGrid;

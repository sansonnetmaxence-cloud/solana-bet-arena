import { useMemo } from 'react';
import PriceCard from './PriceCard';
import { cn } from '@/lib/utils';

interface BettingGridProps {
  currentPrice: number | null;
  priceHistory: number[];
  onSelectBet: (price: number, direction: 'up' | 'down') => void;
  activeBet: { price: number; direction: 'up' | 'down'; timeframe: number; startPrice: number } | null;
  betResult: 'won' | 'lost' | null;
}

const BettingGrid = ({ currentPrice, priceHistory, onSelectBet, activeBet, betResult }: BettingGridProps) => {
  const basePrice = currentPrice ?? 150;

  // More granular price steps
  const downPrices = useMemo(() => [
    basePrice - 15,
    basePrice - 12,
    basePrice - 10,
    basePrice - 8,
    basePrice - 7,
    basePrice - 6,
    basePrice - 5,
    basePrice - 4,
    basePrice - 3.5,
    basePrice - 3,
    basePrice - 2.5,
    basePrice - 2,
    basePrice - 1.75,
    basePrice - 1.5,
    basePrice - 1.25,
    basePrice - 1,
    basePrice - 0.75,
    basePrice - 0.5,
    basePrice - 0.35,
    basePrice - 0.25,
    basePrice - 0.15,
    basePrice - 0.1,
    basePrice - 0.05,
    basePrice - 0.01,
  ], [basePrice]);

  const upPrices = useMemo(() => [
    basePrice + 0.01,
    basePrice + 0.05,
    basePrice + 0.1,
    basePrice + 0.15,
    basePrice + 0.25,
    basePrice + 0.35,
    basePrice + 0.5,
    basePrice + 0.75,
    basePrice + 1,
    basePrice + 1.25,
    basePrice + 1.5,
    basePrice + 1.75,
    basePrice + 2,
    basePrice + 2.5,
    basePrice + 3,
    basePrice + 3.5,
    basePrice + 4,
    basePrice + 5,
    basePrice + 6,
    basePrice + 7,
    basePrice + 8,
    basePrice + 10,
    basePrice + 12,
    basePrice + 15,
  ], [basePrice]);

  const renderCard = (p: number, dir: 'up' | 'down') => (
    <PriceCard
      key={`${dir}-${p}`}
      price={p}
      direction={dir}
      onClick={() => onSelectBet(p, dir)}
      selected={activeBet?.price === p && activeBet?.direction === dir}
      result={activeBet?.price === p && activeBet?.direction === dir ? betResult : null}
      disabled={!!activeBet}
    />
  );

  return (
    <div className={cn(
      'relative flex items-center justify-center gap-4 md:gap-6 transition-all duration-500',
      betResult && 'after:absolute after:inset-0 after:bg-background/60 after:rounded-xl after:pointer-events-none after:z-10'
    )}>
      {/* Down bets - left side */}
      <div className="grid grid-cols-4 gap-1.5 md:gap-2">
        {downPrices.map((p) => renderCard(p, 'down'))}
      </div>

      {/* Center price with mini chart */}
      <PriceCard
        price={0}
        direction="up"
        isCenter
        currentPrice={currentPrice ?? undefined}
        priceHistory={priceHistory}
      />

      {/* Up bets - right side */}
      <div className="grid grid-cols-4 gap-1.5 md:gap-2">
        {upPrices.map((p) => renderCard(p, 'up'))}
      </div>
    </div>
  );
};

export default BettingGrid;

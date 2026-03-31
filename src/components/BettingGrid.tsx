import { useState, useEffect, useMemo } from 'react';
import PriceCard from './PriceCard';
import { cn } from '@/lib/utils';

interface BettingGridProps {
  currentPrice: number | null;
  onSelectBet: (price: number, direction: 'up' | 'down') => void;
  activeBet: { price: number; direction: 'up' | 'down'; timeframe: number; startPrice: number } | null;
  betResult: 'won' | 'lost' | null;
}

const BettingGrid = ({ currentPrice, onSelectBet, activeBet, betResult }: BettingGridProps) => {
  const basePrice = currentPrice ?? 150;

  const downPrices = useMemo(() => {
    return [
      basePrice - 5,
      basePrice - 3,
      basePrice - 2,
      basePrice - 1,
      basePrice - 0.5,
    ];
  }, [basePrice]);

  const upPrices = useMemo(() => {
    return [
      basePrice + 0.5,
      basePrice + 1,
      basePrice + 2,
      basePrice + 3,
      basePrice + 5,
    ];
  }, [basePrice]);

  return (
    <div className={cn(
      'relative flex items-center justify-center gap-3 md:gap-4 flex-wrap transition-all duration-500',
      betResult && 'after:absolute after:inset-0 after:bg-background/60 after:rounded-xl after:pointer-events-none after:z-10'
    )}>
      {/* Down bets - left side */}
      <div className="flex flex-col gap-3 items-end">
        {downPrices.map((p) => (
          <PriceCard
            key={`down-${p}`}
            price={p}
            direction="down"
            onClick={() => onSelectBet(p, 'down')}
            selected={activeBet?.price === p && activeBet?.direction === 'down'}
            result={activeBet?.price === p && activeBet?.direction === 'down' ? betResult : null}
            disabled={!!activeBet}
          />
        ))}
      </div>

      {/* Center price */}
      <PriceCard price={0} direction="up" isCenter currentPrice={currentPrice ?? undefined} />

      {/* Up bets - right side */}
      <div className="flex flex-col gap-3 items-start">
        {upPrices.map((p) => (
          <PriceCard
            key={`up-${p}`}
            price={p}
            direction="up"
            onClick={() => onSelectBet(p, 'up')}
            selected={activeBet?.price === p && activeBet?.direction === 'up'}
            result={activeBet?.price === p && activeBet?.direction === 'up' ? betResult : null}
            disabled={!!activeBet}
          />
        ))}
      </div>
    </div>
  );
};

export default BettingGrid;

import { useMemo } from 'react';
import PriceCard from './PriceCard';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ActiveBet {
  id: string;
  price: number;
  direction: 'up' | 'down';
  timeframe: number;
  startPrice: number;
  amount: number;
  countdown: number;
}

interface BettingGridProps {
  currentPrice: number | null;
  previousPrice: number | null;
  priceHistory: number[];
  onSelectBet: (price: number, direction: 'up' | 'down', quickTimeframe?: number) => void;
  activeBets: ActiveBet[];
  betResult: 'won' | 'lost' | null;
  quickBetMode?: boolean;
  countdown?: number;
  selectedPrice?: number | null;
  selectedDirection?: 'up' | 'down' | null;
  market?: string;
}

const TIMEFRAMES = ['1min', '2min', '5min', '30s'];

const BettingGrid = ({ currentPrice, previousPrice, priceHistory, onSelectBet, activeBets, betResult, quickBetMode, countdown, selectedPrice, selectedDirection, market }: BettingGridProps) => {
  const basePrice = currentPrice ?? 150;
  const hasBets = activeBets.length > 0;
  const primaryBet = hasBets ? activeBets[0] : null;
  const isMobile = useIsMobile();

  const offsets = useMemo(() => {
    if (isMobile) {
      // Fewer cards on mobile
      return [
        ...Array.from({ length: 6 }, (_, i) => 0.1 + i * 0.15),
        ...Array.from({ length: 6 }, (_, i) => 1.25 + i * 0.5),
      ];
    }
    const steps = [
      ...Array.from({ length: 10 }, (_, i) => 0.1 + i * 0.1),
      ...Array.from({ length: 10 }, (_, i) => 1.25 + i * 0.25),
      ...Array.from({ length: 10 }, (_, i) => 4 + i * 1),
    ];
    return steps;
  }, [isMobile]);

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

  const isCardActive = (p: number, dir: 'up' | 'down') => {
    return activeBets.some(b => Math.abs(b.price - p) < 0.001 && b.direction === dir);
  };

  const isCardSelected = (p: number, dir: 'up' | 'down') => {
    return selectedPrice != null && Math.abs(selectedPrice - p) < 0.001 && selectedDirection === dir;
  };

  const renderCard = (p: number, dir: 'up' | 'down', index: number) => {
    const timeLabel = quickBetMode ? randomTimes[p.toFixed(4)] : undefined;
    const active = isCardActive(p, dir);
    const selected = isCardSelected(p, dir);
    return (
      <div key={`${dir}-${p}`} className="transition-all duration-200">
        <PriceCard
          price={p}
          direction={dir}
          onClick={() => onSelectBet(p, dir, timeLabel ? parseTime(timeLabel) : undefined)}
          selected={active || selected}
          result={active ? betResult : null}
          disabled={false}
          timeLabel={timeLabel}
        />
      </div>
    );
  };

  const centerActiveBet = primaryBet ? {
    price: primaryBet.price,
    direction: primaryBet.direction,
    timeframe: primaryBet.timeframe,
    startPrice: primaryBet.startPrice,
    amount: primaryBet.amount,
  } : null;

  const gridCols = isMobile ? 3 : 5;

  return (
    <div className={cn(
      'relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-5 transition-all duration-500 w-full px-2 sm:px-0',
    )}>
      {/* Mobile: Center card on top */}
      <div className={cn(
        'sm:hidden transition-all duration-700 shrink-0 relative z-0 w-full flex justify-center',
        hasBets && 'scale-[1.02]',
      )}>
        <PriceCard
          price={0}
          direction="up"
          isCenter
          currentPrice={currentPrice ?? undefined}
          previousPrice={previousPrice ?? undefined}
          priceHistory={priceHistory}
          activeBet={centerActiveBet}
          activeBets={activeBets.map(b => ({
            price: b.price,
            direction: b.direction,
            timeframe: b.timeframe,
            startPrice: b.startPrice,
            amount: b.amount,
            countdown: b.countdown,
          }))}
          countdown={countdown}
          selectedPrice={selectedPrice}
          selectedDirection={selectedDirection}
        />
      </div>

      {/* Mobile: grids side by side below center */}
      <div className="flex sm:hidden gap-2 w-full justify-center">
        <div className={`grid grid-cols-${gridCols} gap-1 max-h-[40vh] overflow-y-auto scrollbar-hide`}>
          {downPrices.map((p, i) => renderCard(p, 'down', i))}
        </div>
        <div className={`grid grid-cols-${gridCols} gap-1 max-h-[40vh] overflow-y-auto scrollbar-hide`}>
          {upPrices.map((p, i) => renderCard(p, 'up', i))}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:grid grid-cols-4 md:grid-cols-5 gap-1 md:gap-1.5 max-h-[80vh] overflow-y-auto scrollbar-hide relative z-10">
        {downPrices.map((p, i) => renderCard(p, 'down', i))}
      </div>

      <div className={cn(
        'hidden sm:block transition-all duration-700 shrink-0 relative z-0 mx-2 md:mx-4',
        hasBets && 'scale-[1.03]',
      )}>
        <PriceCard
          price={0}
          direction="up"
          isCenter
          currentPrice={currentPrice ?? undefined}
          previousPrice={previousPrice ?? undefined}
          priceHistory={priceHistory}
          activeBet={centerActiveBet}
          activeBets={activeBets.map(b => ({
            price: b.price,
            direction: b.direction,
            timeframe: b.timeframe,
            startPrice: b.startPrice,
            amount: b.amount,
            countdown: b.countdown,
          }))}
          countdown={countdown}
          selectedPrice={selectedPrice}
          selectedDirection={selectedDirection}
        />
      </div>

      <div className="hidden sm:grid grid-cols-4 md:grid-cols-5 gap-1 md:gap-1.5 max-h-[80vh] overflow-y-auto scrollbar-hide relative z-10">
        {upPrices.map((p, i) => renderCard(p, 'up', i))}
      </div>
    </div>
  );
};

export default BettingGrid;

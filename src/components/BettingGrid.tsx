import { memo, useMemo } from 'react';
import PriceCard from './PriceCard';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { buildPriceTiers } from '@/lib/priceDistribution';

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

const parseTime = (label: string): number => {
  if (label === '30s') return 0.5;
  return parseInt(label, 10);
};

// Round base price to a stable bucket so the card list does NOT recompute
// on every micro-tick. Recomputes only when the integer dollar value moves.
const bucketPrice = (price: number) => Math.round(price);

const BettingGrid = ({
  currentPrice,
  previousPrice,
  priceHistory,
  onSelectBet,
  activeBets,
  betResult,
  quickBetMode,
  countdown,
  selectedPrice,
  selectedDirection,
  market,
}: BettingGridProps) => {
  const basePrice = currentPrice ?? 150;
  const hasBets = activeBets.length > 0;
  const primaryBet = hasBets ? activeBets[0] : null;
  const isMobile = useIsMobile();

  // Tiers depend only on viewport — totally stable.
  const tiers = useMemo(() => buildPriceTiers(isMobile), [isMobile]);

  // Snapshot price for the cards so they don't re-render on every stream tick.
  const snapshotPrice = useMemo(
    () => bucketPrice(basePrice),
    [bucketPrice(basePrice)],
  );

  const upPrices = useMemo(
    () =>
      tiers.map((t) => ({
        price: Math.round((snapshotPrice + t.offset) * 100) / 100,
        timeLabel: t.timeLabel,
      })),
    [tiers, snapshotPrice],
  );

  const downPrices = useMemo(
    () =>
      // Mirror UP order: cheapest offsets near the center, biggest at edges.
      tiers
        .map((t) => ({
          price: Math.round((snapshotPrice - t.offset) * 100) / 100,
          timeLabel: t.timeLabel,
        }))
        .reverse(),
    [tiers, snapshotPrice],
  );

  const isCardActive = (p: number, dir: 'up' | 'down') =>
    activeBets.some((b) => Math.abs(b.price - p) < 0.001 && b.direction === dir);

  const isCardSelected = (p: number, dir: 'up' | 'down') =>
    selectedPrice != null && Math.abs(selectedPrice - p) < 0.001 && selectedDirection === dir;

  const renderCard = (item: { price: number; timeLabel: string }, dir: 'up' | 'down') => {
    const timeLabel = quickBetMode ? item.timeLabel : undefined;
    const active = isCardActive(item.price, dir);
    const selected = isCardSelected(item.price, dir);
    return (
      <PriceCard
        key={`${dir}-${item.price}-${item.timeLabel}`}
        price={item.price}
        direction={dir}
        onClick={() => onSelectBet(item.price, dir, timeLabel ? parseTime(timeLabel) : undefined)}
        selected={active || selected}
        result={active ? betResult : null}
        disabled={false}
        timeLabel={timeLabel}
      />
    );
  };

  const centerActiveBet = primaryBet
    ? {
        price: primaryBet.price,
        direction: primaryBet.direction,
        timeframe: primaryBet.timeframe,
        startPrice: primaryBet.startPrice,
        amount: primaryBet.amount,
      }
    : null;

  const gridClass =
    'grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 md:gap-2 [contain:layout_paint] [content-visibility:auto]';

  return (
    <div className="relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 transition-all duration-500 w-full max-w-full px-3 sm:px-4 md:px-6 overflow-hidden">
      {/* Mobile: Center card on top */}
      <div
        className={cn(
          'sm:hidden transition-all duration-700 shrink-0 relative z-0 w-full flex justify-center',
          hasBets && 'scale-[1.02]',
        )}
      >
        <PriceCard
          price={0}
          direction="up"
          isCenter
          currentPrice={currentPrice ?? undefined}
          previousPrice={previousPrice ?? undefined}
          priceHistory={priceHistory}
          activeBet={centerActiveBet}
          activeBets={activeBets.map((b) => ({
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
          market={market}
        />
      </div>

      {/* Mobile grids */}
      <div className="flex sm:hidden gap-2 w-full justify-center">
        <div className="grid grid-cols-3 gap-1 max-h-[40vh] overflow-y-auto scrollbar-hide [overscroll-behavior:contain]">
          {downPrices.map((item) => renderCard(item, 'down'))}
        </div>
        <div className="grid grid-cols-3 gap-1 max-h-[40vh] overflow-y-auto scrollbar-hide [overscroll-behavior:contain]">
          {upPrices.map((item) => renderCard(item, 'up'))}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:block flex-1 min-w-0 max-h-[80vh] overflow-auto scrollbar-hide [overscroll-behavior:contain] relative z-10 rounded-2xl bg-card/30 border border-border/20 p-3 md:p-4">
        <div className={gridClass}>
          {downPrices.map((item) => renderCard(item, 'down'))}
        </div>
      </div>

      <div
        className={cn(
          'hidden sm:block transition-all duration-700 shrink-0 relative z-0 mx-2 md:mx-4',
          hasBets && 'scale-[1.03]',
        )}
      >
        <PriceCard
          price={0}
          direction="up"
          isCenter
          currentPrice={currentPrice ?? undefined}
          previousPrice={previousPrice ?? undefined}
          priceHistory={priceHistory}
          activeBet={centerActiveBet}
          activeBets={activeBets.map((b) => ({
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
          market={market}
        />
      </div>

      <div className="hidden sm:block flex-1 min-w-0 max-h-[80vh] overflow-auto scrollbar-hide [overscroll-behavior:contain] relative z-10 rounded-2xl bg-card/30 border border-border/20 p-3 md:p-4">
        <div className={gridClass}>
          {upPrices.map((item) => renderCard(item, 'up'))}
        </div>
      </div>
    </div>
  );
};

export default memo(BettingGrid);

import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import MiniChart from './MiniChart';

type BetResult = 'won' | 'lost' | null;

interface PriceCardProps {
  price: number;
  direction: 'up' | 'down';
  isCenter?: boolean;
  currentPrice?: number;
  previousPrice?: number;
  priceHistory?: number[];
  onClick?: () => void;
  selected?: boolean;
  result?: BetResult;
  disabled?: boolean;
  timeLabel?: string;
  activeBet?: { price: number; direction: 'up' | 'down'; timeframe: number; startPrice: number; amount: number } | null;
  activeBets?: { price: number; direction: 'up' | 'down'; timeframe: number; startPrice: number; amount: number; countdown?: number }[];
  countdown?: number;
  selectedPrice?: number | null;
  selectedDirection?: 'up' | 'down' | null;
  market?: string;
}

const MARKET_INFO: Record<string, { pair: string; name: string; icon: string }> = {
  SOL: { pair: 'SOL / USD', name: 'Solana', icon: '◎' },
  BTC: { pair: 'BTC / USD', name: 'Bitcoin', icon: '₿' },
  ETH: { pair: 'ETH / USD', name: 'Ethereum', icon: 'Ξ' },
  XRP: { pair: 'XRP / USD', name: 'XRP', icon: '✕' },
};

const PriceCard = ({
  price,
  direction,
  isCenter = false,
  currentPrice,
  priceHistory = [],
  onClick,
  selected = false,
  result,
  disabled = false,
  timeLabel,
  activeBet,
  activeBets = [],
  selectedPrice,
  selectedDirection,
  market = 'SOL',
}: PriceCardProps) => {
  const marketInfo = MARKET_INFO[market] || MARKET_INFO.SOL;
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const [priceTrend, setPriceTrend] = useState<'up' | 'down'>('up');
  const [displayPrice, setDisplayPrice] = useState(currentPrice ?? 0);
  const animRef = useRef<number>(0);
  const prevPriceRef = useRef(currentPrice);
  const targetRef = useRef(currentPrice ?? 0);
  const displayRef = useRef(currentPrice ?? 0);
  const glowIntensity = useRef(0);

  useEffect(() => {
    if (!isCenter || currentPrice == null) return;
    if (prevPriceRef.current != null) {
      if (currentPrice > prevPriceRef.current) {
        setPriceFlash('up');
        setPriceTrend('up');
        glowIntensity.current = 1;
      } else if (currentPrice < prevPriceRef.current) {
        setPriceFlash('down');
        setPriceTrend('down');
        glowIntensity.current = 1;
      }
    }
    prevPriceRef.current = currentPrice;
    targetRef.current = currentPrice;
    const t1 = setTimeout(() => setPriceFlash(null), 800);
    return () => clearTimeout(t1);
  }, [currentPrice, isCenter]);

  useEffect(() => {
    if (!isCenter) return;
    const tick = () => {
      const lerp = 0.08;
      displayRef.current += (targetRef.current - displayRef.current) * lerp;
      glowIntensity.current *= 0.96;
      setDisplayPrice(displayRef.current);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [isCenter]);

  const formatCountdown = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const hasBet = !!activeBet;
  const betDir = activeBet?.direction;

  if (isCenter) {
    const priceDelta = currentPrice && activeBet
      ? currentPrice - activeBet.startPrice
      : null;
    const priceDeltaPositive = priceDelta != null ? priceDelta >= 0 : null;

    return (
      <div className={cn(
        'relative flex flex-col rounded-2xl bg-card/95 backdrop-blur-sm shrink-0 transition-all duration-700 ease-out overflow-hidden border',
        // Responsive sizing
        hasBet
          ? 'w-full max-w-[22rem] h-[24rem] sm:w-[26rem] sm:h-[32rem] md:w-[32rem] md:h-[38rem] lg:w-[36rem] lg:h-[42rem]'
          : 'w-full max-w-[20rem] h-[22rem] sm:w-[24rem] sm:h-[28rem] md:w-[28rem] md:h-[34rem] lg:w-[32rem] lg:h-[38rem]',
        hasBet && betDir === 'up' && 'border-success/20',
        hasBet && betDir === 'down' && 'border-danger/20',
        !hasBet && 'border-border/30',
      )}
        style={{
          boxShadow: hasBet
            ? betDir === 'up'
              ? '0 0 60px hsl(160 100% 51% / 0.12), 0 0 120px hsl(160 100% 51% / 0.04)'
              : '0 0 60px hsl(0 100% 63% / 0.12), 0 0 120px hsl(0 100% 63% / 0.04)'
            : undefined,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-5 pt-3 sm:pt-4 pb-1 sm:pb-2 z-[1]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-[8px] sm:text-[10px] font-black text-primary">◎</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xs sm:text-sm text-foreground font-bold tracking-wide">SOL / USD</span>
              <span className="font-display text-[8px] sm:text-[9px] text-muted-foreground tracking-wider">Solana</span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-danger/8 border border-danger/15">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-danger animate-pulse" />
            <span className="font-display text-[7px] sm:text-[8px] text-danger font-bold uppercase tracking-widest">Live</span>
          </div>
        </div>

        {/* Active bets */}
        {activeBets.length > 0 && (
          <div className="flex flex-col gap-1 sm:gap-1.5 mx-3 sm:mx-4 mt-1 z-[1] max-h-[80px] sm:max-h-[120px] overflow-y-auto scrollbar-hide">
            {activeBets.map((bet, i) => {
              const isUp = bet.direction === 'up';
              return (
                <div
                  key={i}
                  className={cn(
                    'rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between',
                    isUp ? 'bg-success/6 border border-success/15' : 'bg-danger/6 border border-danger/15',
                  )}
                >
                  <span className={cn(
                    'font-display text-lg sm:text-2xl font-black tabular-nums',
                    isUp ? 'text-success' : 'text-danger',
                  )}>
                    {bet.countdown != null ? formatCountdown(bet.countdown) : '--:--'}
                  </span>
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      'font-display text-xs sm:text-sm font-black tabular-nums',
                      isUp ? 'text-success' : 'text-danger',
                    )}>
                      ${bet.price.toFixed(2)}
                    </span>
                    <span className="font-display text-[7px] sm:text-[8px] text-muted-foreground uppercase tracking-widest">
                      {isUp ? '▲ UP' : '▼ DN'} · {bet.amount} SOL
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Price */}
        <div className="flex flex-col items-center justify-center flex-1 z-[1] py-1 px-2 w-full">
          <div className="relative overflow-hidden w-full flex items-center justify-center">
            <span
              key={`price-${priceTrend}-${Math.floor(displayPrice)}`}
              className={cn(
                'font-display font-black leading-none tabular-nums block whitespace-nowrap',
                // Dynamic sizing based on price length
                displayPrice >= 10000
                  ? hasBet
                    ? 'text-2xl sm:text-4xl md:text-5xl lg:text-6xl'
                    : 'text-3xl sm:text-5xl md:text-6xl lg:text-[4.5rem]'
                  : displayPrice >= 1000
                    ? hasBet
                      ? 'text-3xl sm:text-5xl md:text-5xl lg:text-6xl'
                      : 'text-3xl sm:text-5xl md:text-6xl lg:text-[5rem]'
                    : hasBet
                      ? 'text-3xl sm:text-5xl md:text-6xl lg:text-7xl'
                      : 'text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem]',
                priceTrend === 'up' ? 'text-success' : 'text-danger',
                priceFlash === 'up' && 'animate-price-fly-up',
                priceFlash === 'down' && 'animate-price-fly-down',
              )}
              style={{
                textShadow: priceTrend === 'up'
                  ? `0 0 ${20 + glowIntensity.current * 30}px hsl(160 100% 51% / ${0.2 + glowIntensity.current * 0.4})`
                  : `0 0 ${20 + glowIntensity.current * 30}px hsl(0 100% 63% / ${0.2 + glowIntensity.current * 0.4})`,
              }}
            >
              ${displayPrice.toFixed(2)}
            </span>
          </div>

          {!hasBet && !selectedPrice && priceFlash && (
            <span className={cn(
              'text-base sm:text-lg font-display mt-1 block',
              priceFlash === 'up' ? 'text-success animate-arrow-float-up' : 'text-danger animate-arrow-float-down',
            )}>
              {priceFlash === 'up' ? '▲' : '▼'}
            </span>
          )}

          {hasBet && priceDelta != null && (
            <div className={cn(
              'mt-1.5 sm:mt-2 px-2 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-display font-bold flex items-center gap-1 tabular-nums',
              priceDeltaPositive
                ? 'bg-success/8 text-success border border-success/15'
                : 'bg-danger/8 text-danger border border-danger/15',
            )}>
              <span>{priceDeltaPositive ? '↑' : '↓'}</span>
              <span>{priceDeltaPositive ? '+' : ''}{priceDelta.toFixed(2)}</span>
            </div>
          )}

          {!hasBet && selectedPrice != null && selectedDirection && (
            <div className={cn(
              'mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border flex flex-col items-center animate-in fade-in zoom-in-95 duration-200',
              selectedDirection === 'up'
                ? 'bg-success/6 border-success/20 text-success'
                : 'bg-danger/6 border-danger/20 text-danger',
            )}>
              <span className="text-[7px] sm:text-[8px] uppercase tracking-widest font-bold opacity-60">Selected</span>
              <span className="font-display text-lg sm:text-xl font-black tabular-nums">${selectedPrice.toFixed(2)}</span>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase">{selectedDirection === 'up' ? '▲ UP' : '▼ DOWN'}</span>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="relative w-full z-[1]">
          <div className="absolute bottom-full left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-card/90 to-transparent pointer-events-none z-10" />
          <MiniChart data={priceHistory} height={hasBet ? 100 : 90} />
        </div>
      </div>
    );
  }

  // Small bet cards — responsive
  const isUp = direction === 'up';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group relative flex flex-col items-center justify-center rounded-lg border cursor-pointer font-display backdrop-blur-md overflow-hidden',
        'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:scale-[1.08] hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0',
        // Responsive card sizes
        timeLabel
          ? 'w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] md:w-[96px] md:h-[96px]'
          : 'w-[56px] h-[56px] sm:w-[68px] sm:h-[68px] md:w-[76px] md:h-[76px]',
        isUp
          ? 'border-success/15 bg-success/[0.03] hover:border-success/40 hover:bg-success/[0.08]'
          : 'border-danger/15 bg-danger/[0.03] hover:border-danger/40 hover:bg-danger/[0.08]',
        isUp
          ? 'hover:shadow-[0_0_20px_hsl(160_100%_51%/0.15),0_4px_12px_hsl(0_0%_0%/0.3)]'
          : 'hover:shadow-[0_0_20px_hsl(0_100%_63%/0.15),0_4px_12px_hsl(0_0%_0%/0.3)]',
        selected && isUp && 'border-success/50 bg-success/[0.08] ring-1 ring-success/30 scale-[1.05]',
        selected && !isUp && 'border-danger/50 bg-danger/[0.08] ring-1 ring-danger/30 scale-[1.05]',
        result === 'won' && 'border-success/60 bg-success/10',
        result === 'lost' && 'border-danger/60 bg-danger/10',
        disabled && 'opacity-30 cursor-not-allowed hover:scale-100 hover:translate-y-0',
      )}
    >
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg',
        isUp
          ? 'bg-gradient-to-t from-success/[0.06] to-transparent'
          : 'bg-gradient-to-b from-danger/[0.06] to-transparent',
      )} />

      <span className={cn(
        'text-[6px] sm:text-[7px] uppercase tracking-wider mb-0.5 transition-all duration-300 relative z-[1]',
        'group-hover:tracking-[0.2em]',
        isUp ? 'text-success/50 group-hover:text-success/90' : 'text-danger/50 group-hover:text-danger/90'
      )}>
        {isUp ? '▲ UP' : '▼ DN'}
      </span>
      <span className={cn(
        'font-bold tabular-nums transition-all duration-300 relative z-[1]',
        'group-hover:font-extrabold',
        timeLabel ? 'text-[10px] sm:text-xs md:text-sm' : 'text-[9px] sm:text-[10px] md:text-xs',
        isUp ? 'text-success/80 group-hover:text-success' : 'text-danger/80 group-hover:text-danger',
      )}>
        ${price.toFixed(2)}
      </span>
      {timeLabel && (
        <span className={cn(
          'text-[7px] sm:text-[8px] mt-0.5 uppercase tracking-wider font-bold px-1 sm:px-1.5 py-0.5 rounded transition-all duration-300 relative z-[1]',
          'group-hover:px-2',
          isUp ? 'text-success/60 bg-success/[0.05] group-hover:bg-success/[0.1]' : 'text-danger/60 bg-danger/[0.05] group-hover:bg-danger/[0.1]'
        )}>
          {timeLabel}
        </span>
      )}
    </button>
  );
};

export default PriceCard;

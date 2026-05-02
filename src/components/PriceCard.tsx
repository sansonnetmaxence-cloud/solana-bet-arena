import { memo, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import MiniChart from './MiniChart';
import btcLogo from '@/assets/crypto-btc.png';
import ethLogo from '@/assets/crypto-eth.png';
import solLogo from '@/assets/crypto-sol.png';
import xrpLogo from '@/assets/crypto-xrp.png';

type BetResult = 'won' | 'lost' | null;

interface PriceCardProps {
  price: number;
  direction: 'up' | 'down';
  isCenter?: boolean;
  currentPrice?: number;
  previousPrice?: number;
  priceHistory?: number[];
  onClick?: () => void;
  /** Stable callback alternative — args passed at click time so the parent
   *  can keep a single useCallback reference and let memo work. */
  onSelect?: (price: number, direction: 'up' | 'down', quickTimeframe?: number) => void;
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

const MARKET_INFO: Record<string, { pair: string; name: string; icon: string; logo: string }> = {
  SOL: { pair: 'SOL / USD', name: 'Solana', icon: '◎', logo: solLogo },
  BTC: { pair: 'BTC / USD', name: 'Bitcoin', icon: '₿', logo: btcLogo },
  ETH: { pair: 'ETH / USD', name: 'Ethereum', icon: 'Ξ', logo: ethLogo },
  XRP: { pair: 'XRP / USD', name: 'XRP', icon: '✕', logo: xrpLogo },
};

const PriceCardImpl = ({
  price,
  direction,
  isCenter = false,
  currentPrice,
  priceHistory = [],
  onClick,
  onSelect,
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
  const priceTextRef = useRef<HTMLSpanElement | null>(null);
  const animRef = useRef<number>(0);
  const prevPriceRef = useRef(currentPrice);
  const targetRef = useRef(currentPrice ?? 0);
  const displayRef = useRef(currentPrice ?? 0);
  const glowRef = useRef(0);
  const runningRef = useRef(false);

  // Track currentPrice -> trend, flash, target
  useEffect(() => {
    if (!isCenter || currentPrice == null) return;
    if (prevPriceRef.current != null) {
      if (currentPrice > prevPriceRef.current) {
        setPriceFlash('up');
        setPriceTrend('up');
        glowRef.current = 1;
      } else if (currentPrice < prevPriceRef.current) {
        setPriceFlash('down');
        setPriceTrend('down');
        glowRef.current = 1;
      }
    }
    prevPriceRef.current = currentPrice;
    targetRef.current = currentPrice;

    // Re-arm animation only if needed (RAF stays idle when prices match)
    if (!runningRef.current && Math.abs(targetRef.current - displayRef.current) > 0.005) {
      runningRef.current = true;
      const tick = () => {
        const lerp = 0.18;
        displayRef.current += (targetRef.current - displayRef.current) * lerp;
        glowRef.current *= 0.94;
        // Direct DOM write — bypasses React re-render entirely
        if (priceTextRef.current) {
          priceTextRef.current.textContent = `$${displayRef.current.toFixed(2)}`;
        }
        if (Math.abs(targetRef.current - displayRef.current) < 0.005) {
          runningRef.current = false;
          if (priceTextRef.current) {
            priceTextRef.current.textContent = `$${targetRef.current.toFixed(2)}`;
          }
          return;
        }
        animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    }

    const t = setTimeout(() => setPriceFlash(null), 700);
    return () => clearTimeout(t);
  }, [currentPrice, isCenter]);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  const formatCountdown = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const hasBet = !!activeBet;
  const betDir = activeBet?.direction;

  if (isCenter) {
    const priceDelta = currentPrice && activeBet ? currentPrice - activeBet.startPrice : null;
    const priceDeltaPositive = priceDelta != null ? priceDelta >= 0 : null;

    return (
      <div
        className={cn(
          'relative flex flex-col rounded-2xl bg-card/95 backdrop-blur-sm shrink-0 transition-all duration-700 ease-out overflow-hidden border',
          hasBet
            ? 'w-full max-w-[22rem] h-[24rem] sm:w-[24rem] sm:h-[30rem] md:w-[26rem] md:h-[34rem] lg:w-[32rem] lg:h-[40rem] xl:w-[36rem] xl:h-[42rem]'
            : 'w-full max-w-[20rem] h-[22rem] sm:w-[22rem] sm:h-[26rem] md:w-[24rem] md:h-[30rem] lg:w-[28rem] lg:h-[36rem] xl:w-[32rem] xl:h-[38rem]',
          hasBet && betDir === 'up' && 'border-success/20',
          hasBet && betDir === 'down' && 'border-danger/20',
          !hasBet && 'border-border/30',
        )}
        style={{
          containerType: 'inline-size' as any,
          contain: 'layout paint',
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
            <img src={marketInfo.logo} alt={marketInfo.name} className="w-5 h-5 sm:w-7 sm:h-7 rounded-full object-contain" />
            <div className="flex flex-col">
              <span className="font-display text-xs sm:text-sm text-foreground font-bold tracking-wide">{marketInfo.pair}</span>
              <span className="font-display text-[8px] sm:text-[9px] text-muted-foreground tracking-wider">{marketInfo.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-danger/8 border border-danger/15">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-danger animate-pulse" />
            <span className="font-display text-[7px] sm:text-[8px] text-danger font-bold uppercase tracking-widest">Live</span>
          </div>
        </div>

        {/* Active bets */}
        {activeBets.length > 0 && (
          <div className="flex flex-col gap-1 sm:gap-1.5 mx-3 sm:mx-4 mt-1 z-[1] max-h-[80px] sm:max-h-[120px] overflow-y-auto scrollbar-hide [overscroll-behavior:contain]">
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
                  <span
                    className={cn(
                      'font-display text-lg sm:text-2xl font-black tabular-nums',
                      isUp ? 'text-success' : 'text-danger',
                    )}
                  >
                    {bet.countdown != null ? formatCountdown(bet.countdown) : '--:--'}
                  </span>
                  <div className="flex flex-col items-end">
                    <span
                      className={cn(
                        'font-display text-xs sm:text-sm font-black tabular-nums',
                        isUp ? 'text-success' : 'text-danger',
                      )}
                    >
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
        <div className="flex flex-col items-center justify-center flex-1 z-[1] py-1 px-4 w-full">
          <div className="relative w-full flex items-center justify-center">
            <span
              ref={priceTextRef}
              className={cn(
                'font-display font-black leading-none tabular-nums block whitespace-nowrap will-change-transform',
                priceTrend === 'up' ? 'text-success' : 'text-danger',
                priceFlash === 'up' && 'animate-price-fly-up',
                priceFlash === 'down' && 'animate-price-fly-down',
              )}
              style={{
                fontSize: 'clamp(2.5rem, 15cqi, 8rem)',
                textShadow:
                  priceTrend === 'up'
                    ? `0 0 24px hsl(160 100% 51% / 0.3)`
                    : `0 0 24px hsl(0 100% 63% / 0.3)`,
              }}
            >
              ${(currentPrice ?? 0).toFixed(2)}
            </span>
          </div>

          {!hasBet && !selectedPrice && priceFlash && (
            <span
              className={cn(
                'text-base sm:text-lg font-display mt-1 block',
                priceFlash === 'up' ? 'text-success animate-arrow-float-up' : 'text-danger animate-arrow-float-down',
              )}
            >
              {priceFlash === 'up' ? '▲' : '▼'}
            </span>
          )}

          {hasBet && priceDelta != null && (
            <div
              className={cn(
                'mt-1.5 sm:mt-2 px-2 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-display font-bold flex items-center gap-1 tabular-nums',
                priceDeltaPositive
                  ? 'bg-success/8 text-success border border-success/15'
                  : 'bg-danger/8 text-danger border border-danger/15',
              )}
            >
              <span>{priceDeltaPositive ? '↑' : '↓'}</span>
              <span>
                {priceDeltaPositive ? '+' : ''}
                {priceDelta.toFixed(2)}
              </span>
            </div>
          )}

          {!hasBet && selectedPrice != null && selectedDirection && (
            <div
              className={cn(
                'mt-2 sm:mt-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border flex flex-col items-center animate-in fade-in zoom-in-95 duration-200',
                selectedDirection === 'up'
                  ? 'bg-success/6 border-success/20 text-success'
                  : 'bg-danger/6 border-danger/20 text-danger',
              )}
            >
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

  // Small bet cards — responsive, GPU-friendly hover
  const isUp = direction === 'up';

  return (
    <button
      onClick={() => {
        if (onSelect) {
          const tf = timeLabel ? (timeLabel === '30s' ? 0.5 : parseInt(timeLabel, 10)) : undefined;
          onSelect(price, direction, tf);
        } else if (onClick) {
          onClick();
        }
      }}
      disabled={disabled}
      className={cn(
        'group relative flex flex-col items-center justify-center rounded-lg border cursor-pointer font-display backdrop-blur-md overflow-hidden',
        'transition-transform duration-200 ease-out will-change-transform',
        'hover:scale-[1.04] hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0',
        timeLabel
          ? 'w-full aspect-square min-w-[60px] max-w-[120px]'
          : 'w-full aspect-square min-w-[48px] max-w-[96px]',
        isUp
          ? 'border-success/15 bg-success/[0.03] hover:border-success/40'
          : 'border-danger/15 bg-danger/[0.03] hover:border-danger/40',
        selected && isUp && 'border-success/50 bg-success/[0.08] ring-1 ring-success/30 scale-[1.05]',
        selected && !isUp && 'border-danger/50 bg-danger/[0.08] ring-1 ring-danger/30 scale-[1.05]',
        result === 'won' && 'border-success/60 bg-success/10',
        result === 'lost' && 'border-danger/60 bg-danger/10',
        disabled && 'opacity-30 cursor-not-allowed hover:scale-100 hover:translate-y-0',
      )}
    >
      {/* Glow overlay (opacity-only transition = no paint cost outside hover) */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none',
          isUp
            ? 'bg-gradient-to-t from-success/[0.08] to-transparent'
            : 'bg-gradient-to-b from-danger/[0.08] to-transparent',
        )}
      />

      <span
        className={cn(
          'text-[6px] sm:text-[7px] uppercase tracking-wider mb-0.5 relative z-[1]',
          isUp ? 'text-success/60 group-hover:text-success/90' : 'text-danger/60 group-hover:text-danger/90',
        )}
      >
        {isUp ? '▲ UP' : '▼ DN'}
      </span>
      <span
        className={cn(
          'font-bold tabular-nums relative z-[1]',
          timeLabel ? 'text-[10px] sm:text-xs md:text-sm' : 'text-[9px] sm:text-[10px] md:text-xs',
          isUp ? 'text-success/85 group-hover:text-success' : 'text-danger/85 group-hover:text-danger',
        )}
      >
        ${price.toFixed(2)}
      </span>
      {timeLabel && (
        <span
          className={cn(
            'text-[7px] sm:text-[8px] mt-0.5 uppercase tracking-wider font-bold px-1 sm:px-1.5 py-0.5 rounded relative z-[1]',
            isUp ? 'text-success/70 bg-success/[0.05]' : 'text-danger/70 bg-danger/[0.05]',
          )}
        >
          {timeLabel}
        </span>
      )}
    </button>
  );
};

// Memo with shallow comparison; center cards are always re-rendered (their
// props change on every tick). Small cards are stable as long as their
// relevant props don't change.
const PriceCard = memo(PriceCardImpl, (prev, next) => {
  if (prev.isCenter || next.isCenter) return false;
  return (
    prev.price === next.price &&
    prev.direction === next.direction &&
    prev.selected === next.selected &&
    prev.result === next.result &&
    prev.disabled === next.disabled &&
    prev.timeLabel === next.timeLabel &&
    prev.onClick === next.onClick &&
    prev.onSelect === next.onSelect
  );
});

export default PriceCard;

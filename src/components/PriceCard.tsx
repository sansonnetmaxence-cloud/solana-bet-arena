import { useState, useEffect, useRef } from 'react';
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
  activeBets?: { price: number; direction: 'up' | 'down'; timeframe: number; startPrice: number; amount: number }[];
  countdown?: number;
  selectedPrice?: number | null;
  selectedDirection?: 'up' | 'down' | null;
}

const PriceCard = ({
  price,
  direction,
  isCenter = false,
  currentPrice,
  previousPrice,
  priceHistory = [],
  onClick,
  selected = false,
  result,
  disabled = false,
  timeLabel,
  activeBet,
  activeBets = [],
  countdown,
  selectedPrice,
  selectedDirection,
}: PriceCardProps) => {
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const [priceTrend, setPriceTrend] = useState<'up' | 'down'>('up');
  const [bounce, setBounce] = useState(false);
  const prevPriceRef = useRef(currentPrice);

  useEffect(() => {
    if (!isCenter || currentPrice == null || prevPriceRef.current == null) {
      prevPriceRef.current = currentPrice;
      return;
    }
    if (currentPrice > prevPriceRef.current) {
      setPriceFlash('up');
      setPriceTrend('up');
      setBounce(true);
    } else if (currentPrice < prevPriceRef.current) {
      setPriceFlash('down');
      setPriceTrend('down');
      setBounce(true);
    }
    prevPriceRef.current = currentPrice;
    const t1 = setTimeout(() => setPriceFlash(null), 800);
    const t2 = setTimeout(() => setBounce(false), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [currentPrice, isCenter]);

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
        'relative flex flex-col rounded-2xl border-2 bg-card mx-4 shrink-0 transition-all duration-700 ease-out overflow-hidden',
        hasBet
          ? 'w-[22rem] h-[28rem] md:w-[30rem] md:h-[36rem] scale-105'
          : 'w-80 h-[24rem] md:w-[26rem] md:h-[30rem]',
        hasBet && betDir === 'up' && 'border-success/60',
        hasBet && betDir === 'down' && 'border-danger/60',
        !hasBet && 'border-primary/40',
        'animate-float'
      )}
        style={{
          boxShadow: hasBet
            ? betDir === 'up'
              ? '0 0 40px hsl(160 100% 51% / 0.15), 0 0 80px hsl(160 100% 51% / 0.05), inset 0 1px 0 hsl(160 100% 51% / 0.1)'
              : '0 0 40px hsl(0 100% 63% / 0.15), 0 0 80px hsl(0 100% 63% / 0.05), inset 0 1px 0 hsl(0 100% 63% / 0.1)'
            : '0 0 30px hsl(160 100% 51% / 0.08), inset 0 1px 0 hsl(160 100% 51% / 0.06)',
        }}
      >
        {/* Top bar — pair label + live badge */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 z-[1]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="text-[9px] font-black text-primary">S</span>
            </div>
            <span className="font-display text-sm md:text-base text-foreground/90 font-bold tracking-wide">SOL / USD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
            <span className="font-display text-[9px] text-danger font-bold uppercase tracking-widest">Live</span>
          </div>
        </div>

        {/* Timer section when bet is active */}
        {hasBet && countdown != null && countdown > 0 && (
          <div className={cn(
            'mx-4 rounded-lg px-4 py-3 flex items-center justify-between z-[1] animate-in fade-in slide-in-from-top-2 duration-500',
            betDir === 'up' ? 'bg-success/8 border border-success/20' : 'bg-danger/8 border border-danger/20',
          )}>
            <div className="flex flex-col">
              <span className="font-display text-[9px] text-muted-foreground uppercase tracking-widest">Time left</span>
              <span className={cn(
                'font-display text-3xl md:text-4xl font-black tabular-nums leading-tight',
                betDir === 'up' ? 'text-success' : 'text-danger',
              )}>
                {formatCountdown(countdown)}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-display text-[9px] text-muted-foreground uppercase tracking-widest">Target</span>
              <span className={cn(
                'font-display text-lg md:text-xl font-black tabular-nums',
                betDir === 'up' ? 'text-success' : 'text-danger',
              )}>
                ${activeBet.price.toFixed(2)}
              </span>
              <span className={cn(
                'font-display text-[10px] font-bold mt-0.5',
                betDir === 'up' ? 'text-success/70' : 'text-danger/70',
              )}>
                {betDir === 'up' ? '▲ UP' : '▼ DOWN'} • {activeBet.amount} SOL
              </span>
            </div>
          </div>
        )}

        {/* Main price display */}
        <div className="flex flex-col items-center justify-center flex-1 z-[1] py-2">
          <div className={cn(
            'transition-all duration-300',
            bounce && 'scale-105',
            priceFlash === 'up' && 'animate-price-up',
            priceFlash === 'down' && 'animate-price-down',
          )}>
            <span className={cn(
              'font-display font-black transition-colors duration-300 leading-none',
              hasBet ? 'text-5xl md:text-6xl' : 'text-6xl md:text-8xl',
              priceTrend === 'up' ? 'text-success' : 'text-danger',
            )}
              style={{
                textShadow: priceTrend === 'up'
                  ? '0 0 30px hsl(160 100% 51% / 0.4)'
                  : '0 0 30px hsl(0 100% 63% / 0.4)',
              }}
            >
              ${currentPrice?.toFixed(2) ?? '---'}
            </span>
          </div>

          {/* Price change indicator when bet active */}
          {hasBet && priceDelta != null && (
            <div className={cn(
              'mt-2 px-3 py-1 rounded-full text-xs font-display font-bold flex items-center gap-1',
              priceDeltaPositive
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-danger/10 text-danger border border-danger/20',
            )}>
              <span>{priceDeltaPositive ? '▲' : '▼'}</span>
              <span className="tabular-nums">{priceDeltaPositive ? '+' : ''}{priceDelta.toFixed(2)}</span>
            </div>
          )}

          {/* Selected price display (without quick bet) */}
          {!hasBet && selectedPrice != null && selectedDirection && (
            <div className={cn(
              'mt-3 px-4 py-2 rounded-xl border flex flex-col items-center animate-in fade-in zoom-in duration-300',
              selectedDirection === 'up'
                ? 'bg-success/8 border-success/25 text-success'
                : 'bg-danger/8 border-danger/25 text-danger',
            )}>
              <span className="text-[9px] uppercase tracking-widest font-bold opacity-70">Selected</span>
              <span className="font-display text-xl font-black tabular-nums">
                ${selectedPrice.toFixed(2)}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {selectedDirection === 'up' ? '▲ UP' : '▼ DOWN'}
              </span>
            </div>
          )}

          {/* Trend arrows */}
          {!hasBet && !selectedPrice && priceFlash === 'up' && (
            <span className="text-success text-sm font-display mt-1 animate-fade-arrow-up">▲</span>
          )}
          {!hasBet && !selectedPrice && priceFlash === 'down' && (
            <span className="text-danger text-sm font-display mt-1 animate-fade-arrow-down">▼</span>
          )}

          {/* Active bets count */}
          {activeBets.length > 1 && (
            <div className="mt-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-display font-bold uppercase tracking-widest">
              {activeBets.length} Active Bets
            </div>
          )}
        </div>

        {/* Chart at bottom — full width */}
        <div className="relative w-full z-[1]">
          <div className="absolute bottom-full left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none z-10" />
          <MiniChart data={priceHistory} width={hasBet ? 480 : 416} height={hasBet ? 160 : 140} />
        </div>

        {/* Subtle inner glow overlay */}
        <div className={cn(
          'absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-700',
          hasBet ? 'opacity-100' : 'opacity-0',
        )}
          style={{
            background: hasBet
              ? betDir === 'up'
                ? 'radial-gradient(ellipse at 50% 30%, hsl(160 100% 51% / 0.04) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at 50% 30%, hsl(0 100% 63% / 0.04) 0%, transparent 70%)'
              : 'none',
          }}
        />
      </div>
    );
  }

  const isUp = direction === 'up';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-lg border transition-all duration-300 cursor-pointer font-display',
        timeLabel ? 'w-[90px] h-[90px] md:w-[100px] md:h-[100px]' : 'w-[70px] h-[70px] md:w-[80px] md:h-[80px]',
        isUp
          ? 'border-primary/30 hover:border-primary/70 hover:glow-primary'
          : 'border-danger/30 hover:border-danger/70 hover:glow-red',
        selected && isUp && 'border-primary glow-primary',
        selected && !isUp && 'border-danger glow-red',
        result === 'won' && 'border-success glow-green',
        result === 'lost' && 'border-danger glow-red',
        disabled && 'opacity-40 cursor-not-allowed',
        !selected && !result && 'bg-card/60 hover:bg-card'
      )}
    >
      <span className={cn(
        'text-[8px] uppercase tracking-wider mb-0.5',
        isUp ? 'text-primary/70' : 'text-danger/70'
      )}>
        {isUp ? '▲ UP' : '▼ DOWN'}
      </span>
      <span className={cn(
        timeLabel ? 'text-xs md:text-sm font-bold' : 'text-[10px] md:text-xs font-bold',
        isUp ? 'text-primary' : 'text-danger',
        result === 'won' && 'text-glow-green',
        result === 'lost' && 'text-glow-red'
      )}>
        ${price.toFixed(2)}
      </span>
      {timeLabel && (
        <span className={cn(
          'text-[9px] mt-1 uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm',
          isUp ? 'text-primary/90 bg-primary/10' : 'text-danger/90 bg-danger/10'
        )}>
          {timeLabel}
        </span>
      )}
    </button>
  );
};

export default PriceCard;

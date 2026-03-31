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
  countdown?: number;
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
  countdown,
}: PriceCardProps) => {
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const [bounce, setBounce] = useState(false);
  const prevPriceRef = useRef(currentPrice);

  useEffect(() => {
    if (!isCenter || currentPrice == null || prevPriceRef.current == null) {
      prevPriceRef.current = currentPrice;
      return;
    }
    if (currentPrice > prevPriceRef.current) {
      setPriceFlash('up');
      setBounce(true);
    } else if (currentPrice < prevPriceRef.current) {
      setPriceFlash('down');
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
    return (
      <div className={cn(
        'relative flex flex-col items-center justify-center rounded-2xl border-2 bg-card mx-4 shrink-0 transition-all duration-700 ease-out',
        hasBet
          ? 'w-[22rem] h-[26rem] md:w-[30rem] md:h-[34rem] scale-105'
          : 'w-72 h-[22rem] md:w-96 md:h-[28rem]',
        hasBet && betDir === 'up' && 'border-success/80 glow-green',
        hasBet && betDir === 'down' && 'border-danger/80 glow-red',
        !hasBet && 'border-primary/60 glow-primary',
        'animate-float'
      )}>
        {/* Timer overlay when bet active */}
        {hasBet && countdown != null && countdown > 0 && (
          <div className="animate-in fade-in zoom-in duration-500 mb-2">
            <span className={cn(
              'font-display text-5xl md:text-7xl font-black tabular-nums transition-colors duration-300',
              betDir === 'up' ? 'text-success text-glow-green' : 'text-danger text-glow-red',
            )}>
              {formatCountdown(countdown)}
            </span>
          </div>
        )}

        <span className="font-display text-[10px] md:text-xs text-muted-foreground tracking-widest uppercase mb-2">SOL/USD</span>
        <div className={cn(
          'transition-all duration-300',
          bounce && 'scale-110',
          priceFlash === 'up' && 'animate-price-up',
          priceFlash === 'down' && 'animate-price-down',
        )}>
          <span className={cn(
            'font-display font-black transition-colors duration-300',
            hasBet ? 'text-4xl md:text-5xl' : 'text-5xl md:text-7xl',
            priceFlash === 'up' && 'text-success text-glow-green',
            priceFlash === 'down' && 'text-danger text-glow-red',
            !priceFlash && !hasBet && 'text-primary text-glow-primary',
            !priceFlash && hasBet && betDir === 'up' && 'text-success text-glow-green',
            !priceFlash && hasBet && betDir === 'down' && 'text-danger text-glow-red',
          )}>
            ${currentPrice?.toFixed(2) ?? '---'}
          </span>
        </div>
        {priceFlash === 'up' && (
          <span className="text-success text-xs font-display animate-fade-arrow-up absolute top-16 md:top-20">▲▲▲</span>
        )}
        {priceFlash === 'down' && (
          <span className="text-danger text-xs font-display animate-fade-arrow-down absolute top-16 md:top-20">▼▼▼</span>
        )}

        {/* Target info when bet active */}
        {hasBet && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 mt-1">
            <p className={cn(
              'font-display text-[10px] md:text-xs uppercase tracking-widest font-bold',
              betDir === 'up' ? 'text-success/80' : 'text-danger/80'
            )}>
              {betDir === 'up' ? '▲' : '▼'} Target: ${activeBet.price.toFixed(2)} • {activeBet.amount} SOL
            </p>
          </div>
        )}

        <span className="font-display text-[10px] md:text-xs text-danger mt-1 mb-3 animate-pulse-glow">● LIVE</span>
        <MiniChart data={priceHistory} width={hasBet ? 340 : 280} height={hasBet ? 130 : 110} />
        <div className="absolute inset-0 rounded-2xl scanline pointer-events-none" />
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
          ? 'border-success/30 hover:border-success/70 hover:glow-green'
          : 'border-danger/30 hover:border-danger/70 hover:glow-red',
        selected && isUp && 'border-success glow-green',
        selected && !isUp && 'border-danger glow-red',
        result === 'won' && 'border-success glow-green',
        result === 'lost' && 'border-danger glow-red',
        disabled && 'opacity-40 cursor-not-allowed',
        !selected && !result && 'bg-card/60 hover:bg-card'
      )}
    >
      <span className={cn(
        'text-[8px] uppercase tracking-wider mb-0.5',
        isUp ? 'text-success/70' : 'text-danger/70'
      )}>
        {isUp ? '▲ UP' : '▼ DOWN'}
      </span>
      <span className={cn(
        timeLabel ? 'text-xs md:text-sm font-bold' : 'text-[10px] md:text-xs font-bold',
        isUp ? 'text-success' : 'text-danger',
        result === 'won' && 'text-glow-green',
        result === 'lost' && 'text-glow-red'
      )}>
        ${price.toFixed(2)}
      </span>
      {timeLabel && (
        <span className={cn(
          'text-[9px] mt-1 uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm',
          isUp ? 'text-success/90 bg-success/10' : 'text-danger/90 bg-danger/10'
        )}>
          {timeLabel}
        </span>
      )}
    </button>
  );
};

export default PriceCard;

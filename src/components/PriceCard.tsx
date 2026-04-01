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
        'relative flex flex-col items-center justify-center rounded-2xl border-2 bg-card mx-4 shrink-0 transition-all duration-700 ease-out overflow-hidden',
        hasBet
          ? 'w-[22rem] h-[26rem] md:w-[30rem] md:h-[34rem] scale-105'
          : 'w-72 h-[22rem] md:w-96 md:h-[28rem]',
        hasBet && betDir === 'up' && 'border-success/80 glow-green',
        hasBet && betDir === 'down' && 'border-danger/80 glow-red',
        !hasBet && 'border-primary/60 glow-primary',
        'animate-float'
      )}>
        {/* Timer banner at top when bet active */}
        {hasBet && countdown != null && countdown > 0 && (
          <div className={cn(
            'absolute top-0 left-0 right-0 flex flex-col items-center py-3 z-10 animate-in fade-in slide-in-from-top duration-500',
            betDir === 'up' ? 'bg-success/10 border-b border-success/20' : 'bg-danger/10 border-b border-danger/20',
          )}>
            <span className={cn(
              'font-display text-4xl md:text-5xl font-black tabular-nums',
              betDir === 'up' ? 'text-success text-glow-green' : 'text-danger text-glow-red',
            )}>
              {formatCountdown(countdown)}
            </span>
            <p className={cn(
              'font-display text-[10px] md:text-xs uppercase tracking-widest font-bold mt-1',
              betDir === 'up' ? 'text-success/80' : 'text-danger/80'
            )}>
              {betDir === 'up' ? '▲' : '▼'} Target: ${activeBet.price.toFixed(2)} • {activeBet.amount} SOL
            </p>
          </div>
        )}

        {/* Center content */}
        <div className="flex flex-col items-center justify-center flex-1 z-[1]">
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
            <span className="text-success text-xs font-display animate-fade-arrow-up">▲▲▲</span>
          )}
          {priceFlash === 'down' && (
            <span className="text-danger text-xs font-display animate-fade-arrow-down">▼▼▼</span>
          )}
          <span className="font-display text-[10px] md:text-xs text-danger mt-1 animate-pulse-glow">● LIVE</span>
        </div>

        {/* Chart filling bottom of card */}
        <div className="absolute bottom-0 left-0 right-0">
          <MiniChart data={priceHistory} width={hasBet ? 480 : 384} height={hasBet ? 180 : 160} />
        </div>

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

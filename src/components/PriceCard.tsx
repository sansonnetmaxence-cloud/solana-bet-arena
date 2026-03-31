import { cn } from '@/lib/utils';
import MiniChart from './MiniChart';

type BetResult = 'won' | 'lost' | null;

interface PriceCardProps {
  price: number;
  direction: 'up' | 'down';
  isCenter?: boolean;
  currentPrice?: number;
  priceHistory?: number[];
  onClick?: () => void;
  selected?: boolean;
  result?: BetResult;
  disabled?: boolean;
}

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
}: PriceCardProps) => {
  if (isCenter) {
    return (
      <div className="relative flex flex-col items-center justify-center w-56 h-72 md:w-72 md:h-80 rounded-xl border-2 border-primary/60 bg-card glow-primary animate-float mx-4">
        <span className="font-display text-xs md:text-sm text-muted-foreground tracking-widest uppercase mb-1">SOL/USD</span>
        <span className="font-display text-3xl md:text-5xl font-bold text-primary text-glow-primary">
          ${currentPrice?.toFixed(2) ?? '---'}
        </span>
        <span className="font-display text-[10px] md:text-xs text-muted-foreground mt-1 mb-2 animate-pulse-glow">● LIVE</span>
        <MiniChart data={priceHistory} width={200} height={70} />
        <div className="absolute inset-0 rounded-xl scanline pointer-events-none" />
      </div>
    );
  }

  const isUp = direction === 'up';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-lg border transition-all duration-300 cursor-pointer font-display',
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
        'text-[9px] uppercase tracking-wider mb-0.5',
        isUp ? 'text-success/70' : 'text-danger/70'
      )}>
        {isUp ? '▲ UP' : '▼ DOWN'}
      </span>
      <span className={cn(
        'text-xs md:text-sm font-bold',
        isUp ? 'text-success' : 'text-danger',
        result === 'won' && 'text-glow-green',
        result === 'lost' && 'text-glow-red'
      )}>
        ${price.toFixed(2)}
      </span>
    </button>
  );
};

export default PriceCard;

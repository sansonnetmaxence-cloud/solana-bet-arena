import { cn } from '@/lib/utils';

type BetResult = 'won' | 'lost' | null;

interface PriceCardProps {
  price: number;
  direction: 'up' | 'down';
  isCenter?: boolean;
  currentPrice?: number;
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
  onClick,
  selected = false,
  result,
  disabled = false,
}: PriceCardProps) => {
  if (isCenter) {
    return (
      <div className="relative flex flex-col items-center justify-center w-36 h-36 md:w-44 md:h-44 rounded-lg border-2 border-primary/60 bg-card glow-primary animate-float">
        <span className="font-display text-xs text-muted-foreground tracking-widest uppercase mb-1">SOL/USD</span>
        <span className="font-display text-2xl md:text-3xl font-bold text-primary text-glow-primary">
          ${currentPrice?.toFixed(2) ?? '---'}
        </span>
        <span className="font-display text-[10px] text-muted-foreground mt-1">LIVE</span>
        <div className="absolute inset-0 rounded-lg scanline pointer-events-none" />
      </div>
    );
  }

  const isUp = direction === 'up';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex flex-col items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-lg border transition-all duration-300 cursor-pointer font-display',
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
        'text-[10px] uppercase tracking-wider mb-1',
        isUp ? 'text-success/70' : 'text-danger/70'
      )}>
        {isUp ? '▲ UP' : '▼ DOWN'}
      </span>
      <span className={cn(
        'text-sm md:text-base font-bold',
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

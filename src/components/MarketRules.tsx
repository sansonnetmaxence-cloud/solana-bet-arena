import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const MarketRules = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-2 pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[10px] font-display uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors mx-auto"
      >
        <ShieldCheck className="w-3 h-3" />
        <span>Market Rules</span>
        <span className={cn('transition-transform duration-300 text-[8px]', open && 'rotate-180')}>▼</span>
      </button>

      <div className={cn(
        'grid transition-all duration-400 ease-out',
        open ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'
      )}>
        <div className="overflow-hidden">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground/70 pb-2 font-mono">
            <span>Predict SOL price direction — <span className="text-success">Long</span> / <span className="text-danger">Short</span></span>
            <span className="text-border/40">|</span>
            <span>Timeframes: 30s · 1m · 5m</span>
            <span className="text-border/40">|</span>
            <span>Auto-resolved at expiry via live feed</span>
            <span className="text-border/40">|</span>
            <span className="text-warning/60">Risk disclaimer — trade responsibly</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketRules;

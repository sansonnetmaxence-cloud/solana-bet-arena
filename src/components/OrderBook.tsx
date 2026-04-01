import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

interface OrderBookProps {
  currentPrice: number | null;
}

const OrderBook = ({ currentPrice }: OrderBookProps) => {
  const [open, setOpen] = useState(false);

  const orders = useMemo(() => {
    if (!currentPrice) return { asks: [], bids: [] };
    const base = currentPrice;
    const asks = Array.from({ length: 6 }, (_, i) => {
      const spread = (i + 1) * (0.05 + Math.random() * 0.15);
      const price = base + spread;
      const size = +(Math.random() * 80 + 5).toFixed(1);
      return { price, size };
    }).sort((a, b) => a.price - b.price);

    const bids = Array.from({ length: 6 }, (_, i) => {
      const spread = (i + 1) * (0.05 + Math.random() * 0.15);
      const price = base - spread;
      const size = +(Math.random() * 80 + 5).toFixed(1);
      return { price, size };
    }).sort((a, b) => b.price - a.price);

    const maxSize = Math.max(...asks.map(o => o.size), ...bids.map(o => o.size));
    return {
      asks: asks.map(o => ({ ...o, pct: (o.size / maxSize) * 100 })),
      bids: bids.map(o => ({ ...o, pct: (o.size / maxSize) * 100 })),
    };
  }, [currentPrice]);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-1 pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[10px] font-display uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors mx-auto"
      >
        <BookOpen className="w-3 h-3" />
        <span>Carnet d'ordres</span>
        <span className={cn('transition-transform duration-300 text-[8px]', open && 'rotate-180')}>▼</span>
      </button>

      <div className={cn(
        'grid transition-all duration-400 ease-out',
        open ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'
      )}>
        <div className="overflow-hidden">
          <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-3 max-w-md mx-auto">
            {/* Header */}
            <div className="grid grid-cols-3 text-[9px] uppercase tracking-wider text-muted-foreground/50 mb-2 px-1">
              <span>Prix ($)</span>
              <span className="text-center">Taille</span>
              <span className="text-right">Total</span>
            </div>

            {/* Asks (sells) - reversed so highest is on top */}
            <div className="space-y-[2px] mb-2">
              {[...orders.asks].reverse().map((o, i) => {
                let cumSize = 0;
                for (let j = orders.asks.length - 1; j >= orders.asks.length - 1 - i; j--) {
                  cumSize += orders.asks[j]?.size ?? 0;
                }
                return (
                  <div key={i} className="relative grid grid-cols-3 text-[10px] tabular-nums py-[1px] px-1 rounded">
                    <div
                      className="absolute inset-0 rounded bg-danger/10"
                      style={{ width: `${o.pct}%`, marginLeft: 'auto' }}
                    />
                    <span className="relative text-danger">{o.price.toFixed(2)}</span>
                    <span className="relative text-center text-muted-foreground">{o.size}</span>
                    <span className="relative text-right text-muted-foreground/60">{cumSize.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>

            {/* Spread / current price */}
            <div className="text-center text-xs font-display font-bold text-primary py-1 border-y border-border/20 mb-2">
              {currentPrice ? `$${currentPrice.toFixed(2)}` : '—'}
            </div>

            {/* Bids (buys) */}
            <div className="space-y-[2px]">
              {orders.bids.map((o, i) => {
                let cumSize = 0;
                for (let j = 0; j <= i; j++) cumSize += orders.bids[j].size;
                return (
                  <div key={i} className="relative grid grid-cols-3 text-[10px] tabular-nums py-[1px] px-1 rounded">
                    <div
                      className="absolute inset-0 rounded bg-success/10"
                      style={{ width: `${o.pct}%` }}
                    />
                    <span className="relative text-success">{o.price.toFixed(2)}</span>
                    <span className="relative text-center text-muted-foreground">{o.size}</span>
                    <span className="relative text-right text-muted-foreground/60">{cumSize.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;

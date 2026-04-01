import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

interface OrderBookProps {
  currentPrice: number | null;
}

const OrderBook = ({ currentPrice }: OrderBookProps) => {
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, [open]);

  const orders = useMemo(() => {
    if (!currentPrice) return { asks: [], bids: [] };
    const base = currentPrice;
    const asks = Array.from({ length: 8 }, (_, i) => {
      const spread = (i + 1) * (0.03 + Math.random() * 0.12);
      const price = base + spread;
      const size = +(Math.random() * 120 + 10).toFixed(1);
      return { price, size };
    }).sort((a, b) => a.price - b.price);

    const bids = Array.from({ length: 8 }, (_, i) => {
      const spread = (i + 1) * (0.03 + Math.random() * 0.12);
      const price = base - spread;
      const size = +(Math.random() * 120 + 10).toFixed(1);
      return { price, size };
    }).sort((a, b) => b.price - a.price);

    const maxSize = Math.max(...asks.map(o => o.size), ...bids.map(o => o.size));
    return {
      asks: asks.map(o => ({ ...o, pct: (o.size / maxSize) * 100 })),
      bids: bids.map(o => ({ ...o, pct: (o.size / maxSize) * 100 })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrice, tick]);

  return (
    <div className="border-t border-border/30 bg-card/10 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-xs font-display uppercase tracking-widest text-muted-foreground/70 hover:text-foreground transition-colors w-full"
        >
          <BookOpen className="w-4 h-4 text-primary/60" />
          <span className="font-semibold">Order Book</span>
          <span className={cn('ml-auto transition-transform duration-300 text-[10px]', open && 'rotate-180')}>▼</span>
        </button>

        <div className={cn(
          'grid transition-all duration-500 ease-out',
          open ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'
        )}>
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Bids (buy side) */}
              <div className="rounded-xl border border-border/30 bg-card/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-display uppercase tracking-wider text-success/80 font-semibold">Bids</span>
                  <span className="text-[10px] text-muted-foreground/50 font-mono">{orders.bids.length} orders</span>
                </div>
                <div className="grid grid-cols-3 text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-2 px-1">
                  <span>Price</span>
                  <span className="text-center">Size</span>
                  <span className="text-right">Total</span>
                </div>
                <div className="space-y-[3px]">
                  {orders.bids.map((o, i) => {
                    let cum = 0;
                    for (let j = 0; j <= i; j++) cum += orders.bids[j].size;
                    return (
                      <div key={i} className="relative grid grid-cols-3 text-[11px] tabular-nums py-[3px] px-2 rounded-md hover:bg-success/5 transition-colors">
                        <div
                          className="absolute inset-0 rounded-md bg-success/8 transition-all duration-500"
                          style={{ width: `${o.pct}%` }}
                        />
                        <span className="relative text-success font-medium">${o.price.toFixed(2)}</span>
                        <span className="relative text-center text-muted-foreground">{o.size}</span>
                        <span className="relative text-right text-muted-foreground/50">{cum.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Asks (sell side) */}
              <div className="rounded-xl border border-border/30 bg-card/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-display uppercase tracking-wider text-danger/80 font-semibold">Asks</span>
                  <span className="text-[10px] text-muted-foreground/50 font-mono">{orders.asks.length} orders</span>
                </div>
                <div className="grid grid-cols-3 text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-2 px-1">
                  <span>Price</span>
                  <span className="text-center">Size</span>
                  <span className="text-right">Total</span>
                </div>
                <div className="space-y-[3px]">
                  {orders.asks.map((o, i) => {
                    let cum = 0;
                    for (let j = 0; j <= i; j++) cum += orders.asks[j].size;
                    return (
                      <div key={i} className="relative grid grid-cols-3 text-[11px] tabular-nums py-[3px] px-2 rounded-md hover:bg-danger/5 transition-colors">
                        <div
                          className="absolute inset-0 rounded-md bg-danger/8 transition-all duration-500"
                          style={{ width: `${o.pct}%`, marginLeft: 'auto' }}
                        />
                        <span className="relative text-danger font-medium">${o.price.toFixed(2)}</span>
                        <span className="relative text-center text-muted-foreground">{o.size}</span>
                        <span className="relative text-right text-muted-foreground/50">{cum.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Spread bar */}
            <div className="mt-3 rounded-lg border border-border/20 bg-card/20 px-4 py-2 flex items-center justify-between text-[10px] font-mono text-muted-foreground/60">
              <span>Spread: ${currentPrice ? (orders.asks[0]?.price - orders.bids[0]?.price).toFixed(4) : '—'}</span>
              <span className="text-primary font-display font-bold text-sm">{currentPrice ? `$${currentPrice.toFixed(2)}` : '—'}</span>
              <span>Mid: ${currentPrice?.toFixed(2) ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;

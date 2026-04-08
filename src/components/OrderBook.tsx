import { useState, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

interface OrderBookProps {
  currentPrice: number | null;
}

interface OrderRow {
  price: number;
  size: number;
  pct: number;
}

const AnimatedRow = ({
  order,
  side,
  cumTotal,
  flash,
}: {
  order: OrderRow;
  side: 'bid' | 'ask';
  cumTotal: number;
  flash: boolean;
}) => {
  const isGreen = side === 'bid';
  return (
    <div
      className={cn(
        'relative grid grid-cols-3 text-[11px] tabular-nums py-[3px] px-2 rounded-md transition-all duration-300',
        isGreen ? 'hover:bg-success/5' : 'hover:bg-danger/5',
        flash && (isGreen ? 'animate-flash-green' : 'animate-flash-red'),
      )}
    >
      <div
        className={cn(
          'absolute inset-0 rounded-md transition-all duration-700 ease-out',
          isGreen ? 'bg-success/[0.08]' : 'bg-danger/[0.08]',
        )}
        style={{
          width: `${order.pct}%`,
          ...(side === 'ask' ? { marginLeft: 'auto' } : {}),
        }}
      />
      <span className={cn('relative font-medium', isGreen ? 'text-success' : 'text-danger')}>
        ${order.price.toFixed(2)}
      </span>
      <span className="relative text-center text-muted-foreground transition-all duration-300">
        {order.size}
      </span>
      <span className="relative text-right text-muted-foreground/50 transition-all duration-300">
        {cumTotal.toFixed(1)}
      </span>
    </div>
  );
};

const OrderBook = ({ currentPrice }: OrderBookProps) => {
  const [open, setOpen] = useState(true);
  const [tick, setTick] = useState(0);
  const [flashRows, setFlashRows] = useState<Set<number>>(new Set());
  const prevOrdersRef = useRef<{ asks: OrderRow[]; bids: OrderRow[] } | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(id);
  }, [open]);

  const orders = useMemo(() => {
    if (!currentPrice) return { asks: [] as OrderRow[], bids: [] as OrderRow[] };
    const base = currentPrice;
    const asks = Array.from({ length: 8 }, (_, i) => {
      const spread = (i + 1) * (0.03 + Math.random() * 0.12);
      const price = base + spread;
      const size = +(Math.random() * 120 + 10).toFixed(1);
      return { price, size, pct: 0 };
    }).sort((a, b) => a.price - b.price);

    const bids = Array.from({ length: 8 }, (_, i) => {
      const spread = (i + 1) * (0.03 + Math.random() * 0.12);
      const price = base - spread;
      const size = +(Math.random() * 120 + 10).toFixed(1);
      return { price, size, pct: 0 };
    }).sort((a, b) => b.price - a.price);

    const maxSize = Math.max(...asks.map(o => o.size), ...bids.map(o => o.size));
    return {
      asks: asks.map(o => ({ ...o, pct: (o.size / maxSize) * 100 })),
      bids: bids.map(o => ({ ...o, pct: (o.size / maxSize) * 100 })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrice, tick]);

  // Flash random rows on update
  useEffect(() => {
    if (!prevOrdersRef.current) {
      prevOrdersRef.current = orders;
      return;
    }
    const indices = new Set<number>();
    for (let i = 0; i < 3; i++) indices.add(Math.floor(Math.random() * 8));
    setFlashRows(indices);
    const t = setTimeout(() => setFlashRows(new Set()), 400);
    prevOrdersRef.current = orders;
    return () => clearTimeout(t);
  }, [orders]);

  return (
    <div className="border-t border-border/30 bg-card/10 backdrop-blur-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-xs font-display uppercase tracking-widest text-muted-foreground/70 hover:text-foreground transition-colors w-full"
        >
          <BookOpen className="w-4 h-4 text-primary/60" />
          <span className="font-semibold">Order Book</span>
          {open && (
            <span className="ml-2 w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          )}
          <span className={cn('ml-auto transition-transform duration-300 text-[10px]', open && 'rotate-180')}>▼</span>
        </button>

        <div className={cn(
          'grid transition-all duration-500 ease-out',
          open ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'
        )}>
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Bids */}
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
                      <AnimatedRow key={i} order={o} side="bid" cumTotal={cum} flash={flashRows.has(i)} />
                    );
                  })}
                </div>
              </div>

              {/* Asks */}
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
                      <AnimatedRow key={i} order={o} side="ask" cumTotal={cum} flash={flashRows.has(i)} />
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

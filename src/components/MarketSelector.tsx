import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronDown, Star } from 'lucide-react';
import type { MarketSymbol } from '@/hooks/useCryptoPrice';

interface MarketItem {
  symbol: MarketSymbol | null;
  pair: string;
  name: string;
  icon: string;
  iconBg: string;
  leverage?: string;
  category: 'crypto' | 'stock';
  soon?: boolean;
}

const markets: MarketItem[] = [
  { symbol: 'BTC', pair: 'BTC/USD', name: 'Bitcoin', icon: '₿', iconBg: 'bg-orange-500', leverage: '50x', category: 'crypto' },
  { symbol: 'ETH', pair: 'ETH/USDC', name: 'Ethereum', icon: 'Ξ', iconBg: 'bg-blue-500', leverage: '50x', category: 'crypto' },
  { symbol: 'SOL', pair: 'SOL/USD', name: 'Solana', icon: '◎', iconBg: 'bg-gradient-to-br from-purple-500 to-teal-400', leverage: '25x', category: 'crypto' },
  { symbol: 'XRP', pair: 'XRP/USD', name: 'XRP', icon: '✕', iconBg: 'bg-gray-500', leverage: '25x', category: 'crypto' },
  { symbol: null, pair: 'AAPL/USD', name: 'Apple', icon: '', iconBg: 'bg-muted', category: 'stock', soon: true },
  { symbol: null, pair: 'TSLA/USD', name: 'Tesla', icon: 'T', iconBg: 'bg-muted', category: 'stock', soon: true },
  { symbol: null, pair: 'NVDA/USD', name: 'Nvidia', icon: 'N', iconBg: 'bg-muted', category: 'stock', soon: true },
];

interface MarketSelectorProps {
  selectedMarket: MarketSymbol;
  onMarketChange: (market: MarketSymbol) => void;
}

const MarketSelector = ({ selectedMarket, onMarketChange }: MarketSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = markets.find(m => m.symbol === selectedMarket)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = markets.filter(m =>
    m.pair.toLowerCase().includes(search.toLowerCase()) ||
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const cryptos = filtered.filter(m => m.category === 'crypto');
  const stocks = filtered.filter(m => m.category === 'stock');

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all duration-200',
          'border-border/30 hover:border-border/60 bg-card/60 backdrop-blur-sm',
          open && 'border-primary/40 bg-card/80'
        )}
      >
        <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white', selected.iconBg)}>
          {selected.icon}
        </div>
        <span className="font-display text-xs font-bold text-foreground">{selected.pair}</span>
        {selected.leverage && (
          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
            {selected.leverage}
          </span>
        )}
        <ChevronDown className={cn('w-3 h-3 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-[340px] rounded-xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search */}
          <div className="p-2 border-b border-border/20">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border/20">
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search markets..."
                className="bg-transparent text-xs font-display text-foreground placeholder:text-muted-foreground/50 outline-none w-full"
                autoFocus
              />
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-1.5 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-wider border-b border-border/10">
            <span>Market</span>
            <span className="text-right">Last Price</span>
            <span className="text-right">24h</span>
            <span className="text-right">Volume</span>
          </div>

          <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
            {/* Crypto section */}
            {cryptos.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[8px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                  Crypto Perpetuals
                </div>
                {cryptos.map(m => (
                  <MarketRow
                    key={m.pair}
                    market={m}
                    isSelected={m.symbol === selectedMarket}
                    onClick={() => {
                      if (m.symbol) {
                        onMarketChange(m.symbol);
                        setOpen(false);
                        setSearch('');
                      }
                    }}
                  />
                ))}
              </div>
            )}

            {/* Stocks section */}
            {stocks.length > 0 && (
              <div>
                <div className="px-3 py-1 mt-1 text-[8px] font-mono text-muted-foreground/40 uppercase tracking-widest border-t border-border/10 pt-2">
                  Stock Market
                </div>
                {stocks.map(m => (
                  <MarketRow
                    key={m.pair}
                    market={m}
                    isSelected={false}
                    onClick={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MarketRow = ({ market, isSelected, onClick }: { market: MarketItem; isSelected: boolean; onClick: () => void }) => {
  // Simulated data for display
  const mockData: Record<string, { price: string; change: string; volume: string }> = {
    'BTC/USD': { price: '67,298.0', change: '-1.13', volume: '$783.75M' },
    'ETH/USDC': { price: '2,067.01', change: '-2.89', volume: '$361.81M' },
    'SOL/USD': { price: '79.476', change: '-4.93', volume: '$78.16M' },
    'XRP/USD': { price: '0.5124', change: '+1.24', volume: '$42.3M' },
  };

  const data = mockData[market.pair];
  const changeNum = data ? parseFloat(data.change) : 0;

  return (
    <button
      onClick={onClick}
      disabled={market.soon}
      className={cn(
        'w-full grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-3 py-2 transition-all duration-150',
        isSelected
          ? 'bg-primary/[0.06]'
          : market.soon
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:bg-muted/30 cursor-pointer',
      )}
    >
      {/* Market info */}
      <div className="flex items-center gap-2">
        <Star className={cn('w-3 h-3 flex-shrink-0', isSelected ? 'text-primary/60' : 'text-muted-foreground/20')} />
        <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0', market.iconBg)}>
          {market.icon}
        </div>
        <span className="font-display text-[11px] font-bold text-foreground">{market.symbol ?? market.pair.split('/')[0]}</span>
        {market.leverage && (
          <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-muted/60 text-muted-foreground/70 font-semibold">
            {market.leverage}
          </span>
        )}
        {market.soon && (
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground/40 font-semibold uppercase">
            Soon
          </span>
        )}
      </div>

      {/* Price */}
      <span className="font-mono text-[11px] text-foreground/80 tabular-nums text-right">
        {data?.price ?? '—'}
      </span>

      {/* 24h Change */}
      <span className={cn(
        'font-mono text-[11px] tabular-nums text-right',
        changeNum > 0 ? 'text-success' : changeNum < 0 ? 'text-danger' : 'text-muted-foreground'
      )}>
        {data ? `${data.change}%` : '—'}
      </span>

      {/* Volume */}
      <span className="font-mono text-[10px] text-muted-foreground/60 tabular-nums text-right">
        {data?.volume ?? '—'}
      </span>
    </button>
  );
};

export default MarketSelector;

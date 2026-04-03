import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronDown, Star } from 'lucide-react';
import type { MarketSymbol } from '@/hooks/useCryptoPrice';
import btcLogo from '@/assets/crypto-btc.png';
import ethLogo from '@/assets/crypto-eth.png';
import solLogo from '@/assets/crypto-sol.png';
import xrpLogo from '@/assets/crypto-xrp.png';

interface MarketItem {
  symbol: MarketSymbol | null;
  pair: string;
  name: string;
  logo: string;
  leverage?: string;
  category: 'crypto' | 'stock';
  soon?: boolean;
  binanceSymbol?: string;
  textIcon?: string;
}

const markets: MarketItem[] = [
  { symbol: 'BTC', pair: 'BTC/USD', name: 'Bitcoin', logo: btcLogo, leverage: '50x', category: 'crypto', binanceSymbol: 'BTCUSDT' },
  { symbol: 'ETH', pair: 'ETH/USDC', name: 'Ethereum', logo: ethLogo, leverage: '50x', category: 'crypto', binanceSymbol: 'ETHUSDT' },
  { symbol: 'SOL', pair: 'SOL/USD', name: 'Solana', logo: solLogo, leverage: '25x', category: 'crypto', binanceSymbol: 'SOLUSDT' },
  { symbol: 'XRP', pair: 'XRP/USD', name: 'XRP', logo: xrpLogo, leverage: '25x', category: 'crypto', binanceSymbol: 'XRPUSDT' },
  { symbol: null, pair: 'AAPL/USD', name: 'Apple', logo: '', category: 'stock', soon: true, textIcon: '' },
  { symbol: null, pair: 'TSLA/USD', name: 'Tesla', logo: '', category: 'stock', soon: true, textIcon: 'T' },
  { symbol: null, pair: 'NVDA/USD', name: 'Nvidia', logo: '', category: 'stock', soon: true, textIcon: 'N' },
];

interface LiveData {
  price: number;
  change24h: number;
  volume: string;
}

function formatVolume(vol: number): string {
  if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
  if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
  if (vol >= 1e3) return `$${(vol / 1e3).toFixed(1)}K`;
  return `$${vol.toFixed(0)}`;
}

function formatPrice(price: number): string {
  if (price >= 10000) return price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (price >= 100) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(3);
  return price.toFixed(4);
}

interface MarketSelectorProps {
  selectedMarket: MarketSymbol;
  onMarketChange: (market: MarketSymbol) => void;
}

const MarketSelector = ({ selectedMarket, onMarketChange }: MarketSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [liveData, setLiveData] = useState<Record<string, LiveData>>({});
  const ref = useRef<HTMLDivElement>(null);

  const selected = markets.find(m => m.symbol === selectedMarket)!;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch live 24h ticker data
  const fetchTickers = useCallback(async () => {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT'];
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`);
      if (!res.ok) return;
      const data = await res.json();
      const newData: Record<string, LiveData> = {};
      for (const t of data) {
        const sym = t.symbol.replace('USDT', '');
        newData[sym] = {
          price: parseFloat(t.lastPrice),
          change24h: parseFloat(t.priceChangePercent),
          volume: formatVolume(parseFloat(t.quoteVolume)),
        };
      }
      setLiveData(newData);
    } catch {}
  }, []);

  useEffect(() => {
    fetchTickers();
    const interval = setInterval(fetchTickers, 5000);
    return () => clearInterval(interval);
  }, [fetchTickers]);

  const filtered = markets.filter(m =>
    m.pair.toLowerCase().includes(search.toLowerCase()) ||
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const cryptos = filtered.filter(m => m.category === 'crypto');
  const stocks = filtered.filter(m => m.category === 'stock');

  return (
    <div ref={ref} className="relative z-50">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all duration-200',
          'border-border/30 hover:border-border/60 bg-card/60 backdrop-blur-sm',
          open && 'border-primary/40 bg-card/80'
        )}
      >
        <img src={selected.logo} alt={selected.name} className="w-5 h-5 rounded-full object-contain" />
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
        <div className="absolute top-full left-0 mt-1.5 w-[360px] rounded-xl border border-border/40 bg-card shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', backgroundColor: 'hsl(var(--card) / 0.92)' }}>
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
            {cryptos.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[8px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                  Crypto Perpetuals
                </div>
                {cryptos.map(m => {
                  const data = m.symbol ? liveData[m.symbol] : undefined;
                  return (
                    <MarketRow
                      key={m.pair}
                      market={m}
                      isSelected={m.symbol === selectedMarket}
                      data={data}
                      onClick={() => {
                        if (m.symbol) {
                          onMarketChange(m.symbol);
                          setOpen(false);
                          setSearch('');
                        }
                      }}
                    />
                  );
                })}
              </div>
            )}

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

const MarketRow = ({ market, isSelected, data, onClick }: {
  market: MarketItem;
  isSelected: boolean;
  data?: LiveData;
  onClick: () => void;
}) => {
  const changeNum = data?.change24h ?? 0;

  return (
    <button
      onClick={onClick}
      disabled={market.soon}
      className={cn(
        'w-full grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-3 py-2.5 transition-all duration-150',
        isSelected
          ? 'bg-primary/[0.06]'
          : market.soon
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:bg-muted/30 cursor-pointer',
      )}
    >
      <div className="flex items-center gap-2">
        <Star className={cn('w-3 h-3 flex-shrink-0', isSelected ? 'text-primary/60' : 'text-muted-foreground/20')} />
        {market.logo ? (
          <img src={market.logo} alt={market.name} className="w-6 h-6 rounded-full object-contain flex-shrink-0" loading="lazy" width={24} height={24} />
        ) : (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
            {market.textIcon || market.pair.charAt(0)}
          </div>
        )}
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

      <span className="font-mono text-[11px] text-foreground/80 tabular-nums text-right">
        {data ? formatPrice(data.price) : '—'}
      </span>

      <span className={cn(
        'font-mono text-[11px] tabular-nums text-right',
        changeNum > 0 ? 'text-success' : changeNum < 0 ? 'text-danger' : 'text-muted-foreground'
      )}>
        {data ? `${changeNum > 0 ? '+' : ''}${changeNum.toFixed(2)}%` : '—'}
      </span>

      <span className="font-mono text-[10px] text-muted-foreground/60 tabular-nums text-right">
        {data?.volume ?? '—'}
      </span>
    </button>
  );
};

export default MarketSelector;

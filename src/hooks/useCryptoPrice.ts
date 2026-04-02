import { useState, useEffect, useCallback, useRef } from 'react';

export type MarketSymbol = 'SOL' | 'BTC' | 'ETH' | 'XRP';

const BINANCE_SYMBOLS: Record<MarketSymbol, string> = {
  SOL: 'SOLUSDT',
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  XRP: 'XRPUSDT',
};

const CG_IDS: Record<MarketSymbol, string> = {
  SOL: 'solana',
  BTC: 'bitcoin',
  ETH: 'ethereum',
  XRP: 'ripple',
};

export const useCryptoPrice = (symbol: MarketSymbol) => {
  const [price, setPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const latestPrice = useRef<number | null>(null);
  const lastHistoryTime = useRef(0);
  const symbolRef = useRef(symbol);
  symbolRef.current = symbol;

  const updatePrice = useCallback((newPrice: number) => {
    const prev = latestPrice.current;
    latestPrice.current = newPrice;
    setPreviousPrice(prev);
    setPrice(newPrice);
    setLoading(false);

    const now = Date.now();
    if (now - lastHistoryTime.current > 500) {
      lastHistoryTime.current = now;
      setPriceHistory((h) => {
        const next = [...h, newPrice];
        return next.length > 60 ? next.slice(-60) : next;
      });
    }
  }, []);

  useEffect(() => {
    // Reset on symbol change
    setPrice(null);
    setPreviousPrice(null);
    setPriceHistory([]);
    setLoading(true);
    latestPrice.current = null;
    lastHistoryTime.current = 0;

    let ws: WebSocket | null = null;
    let polling: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const fetchRest = async () => {
      if (cancelled) return;
      try {
        const pair = BINANCE_SYMBOLS[symbolRef.current];
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
        if (!res.ok) throw new Error('Binance REST error');
        const data = await res.json();
        const p = parseFloat(data.price);
        if (!isNaN(p) && !cancelled) updatePrice(p);
      } catch {
        try {
          const cgId = CG_IDS[symbolRef.current];
          const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd`);
          if (res.ok && !cancelled) {
            const data = await res.json();
            const p = data[cgId]?.usd;
            if (p) updatePrice(p);
          }
        } catch {}
      }
    };

    const startPolling = () => {
      if (polling) return;
      fetchRest();
      polling = setInterval(fetchRest, 2000);
    };

    // Try WebSocket
    const pair = BINANCE_SYMBOLS[symbol].toLowerCase();
    try {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair}@trade`);

      const wsTimeout = setTimeout(() => {
        if (ws && ws.readyState !== WebSocket.OPEN) {
          ws.close();
          startPolling();
        }
      }, 3000);

      ws.onopen = () => {
        clearTimeout(wsTimeout);
        if (polling) { clearInterval(polling); polling = null; }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const p = parseFloat(data.p);
          if (!isNaN(p) && !cancelled) updatePrice(p);
        } catch {}
      };

      ws.onerror = () => {};
      ws.onclose = () => {
        if (!cancelled) startPolling();
      };
    } catch {
      startPolling();
    }

    return () => {
      cancelled = true;
      ws?.close();
      if (polling) clearInterval(polling);
    };
  }, [symbol, updatePrice]);

  const priceDirection = price && previousPrice
    ? price > previousPrice ? 'up' : price < previousPrice ? 'down' : 'neutral'
    : 'neutral';

  return { price, previousPrice, loading, priceDirection, priceHistory };
};

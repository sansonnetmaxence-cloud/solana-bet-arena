import { useState, useEffect, useCallback, useRef } from 'react';

export type MarketSymbol = 'SOL' | 'BTC' | 'ETH' | 'XRP';

const BINANCE_SYMBOLS: Record<MarketSymbol, string> = {
  SOL: 'SOLUSDT',
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  XRP: 'XRPUSDT',
};

export const useCryptoPrice = (symbol: MarketSymbol) => {
  const [price, setPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const latestPrice = useRef<number | null>(null);
  const lastHistoryTime = useRef(0);
  const usingWs = useRef(false);

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

  // REST API polling fallback
  const fetchPrice = useCallback(async () => {
    try {
      const pair = BINANCE_SYMBOLS[symbol];
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const p = parseFloat(data.price);
      if (!isNaN(p)) updatePrice(p);
    } catch {
      // If REST also fails, try CoinGecko as second fallback
      try {
        const cgIds: Record<MarketSymbol, string> = {
          SOL: 'solana', BTC: 'bitcoin', ETH: 'ethereum', XRP: 'ripple',
        };
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgIds[symbol]}&vs_currencies=usd`);
        if (res.ok) {
          const data = await res.json();
          const cgId = cgIds[symbol];
          const p = data[cgId]?.usd;
          if (p) updatePrice(p);
        }
      } catch {}
    }
  }, [symbol, updatePrice]);

  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    // Fetch immediately then poll every 2s
    fetchPrice();
    pollingRef.current = setInterval(fetchPrice, 2000);
  }, [fetchPrice]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Try WebSocket first, fall back to REST polling
  const connect = useCallback(() => {
    const pair = BINANCE_SYMBOLS[symbol].toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair}@trade`);
    wsRef.current = ws;

    const wsTimeout = setTimeout(() => {
      // If WS hasn't opened in 3s, fall back to polling
      if (!usingWs.current) {
        ws.close();
        startPolling();
      }
    }, 3000);

    ws.onopen = () => {
      clearTimeout(wsTimeout);
      usingWs.current = true;
      stopPolling();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newPrice = parseFloat(data.p);
        if (!isNaN(newPrice)) updatePrice(newPrice);
      } catch {}
    };

    ws.onerror = () => {};

    ws.onclose = () => {
      clearTimeout(wsTimeout);
      usingWs.current = false;
      startPolling();
    };
  }, [symbol, updatePrice, startPolling, stopPolling]);

  useEffect(() => {
    // Reset state on symbol change
    setPrice(null);
    setPreviousPrice(null);
    setPriceHistory([]);
    setLoading(true);
    latestPrice.current = null;
    lastHistoryTime.current = 0;
    usingWs.current = false;
    stopPolling();
    wsRef.current?.close();

    const t = setTimeout(() => connect(), 50);
    return () => {
      clearTimeout(t);
      wsRef.current?.close();
      stopPolling();
    };
  }, [connect, stopPolling]);

  const priceDirection = price && previousPrice
    ? price > previousPrice ? 'up' : price < previousPrice ? 'down' : 'neutral'
    : 'neutral';

  return { price, previousPrice, loading, priceDirection, priceHistory };
};

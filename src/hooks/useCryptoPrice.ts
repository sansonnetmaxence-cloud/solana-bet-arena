import { useState, useEffect, useCallback, useRef } from 'react';

export type MarketSymbol = 'SOL' | 'BTC' | 'ETH' | 'XRP';

const BINANCE_SYMBOLS: Record<MarketSymbol, string> = {
  SOL: 'solusdt',
  BTC: 'btcusdt',
  ETH: 'ethusdt',
  XRP: 'xrpusdt',
};

const FALLBACK_PRICES: Record<MarketSymbol, number> = {
  SOL: 135,
  BTC: 84000,
  ETH: 3200,
  XRP: 2.1,
};

const PRICE_VOLATILITY: Record<MarketSymbol, number> = {
  SOL: 0.3,
  BTC: 15,
  ETH: 2,
  XRP: 0.003,
};

export const useCryptoPrice = (symbol: MarketSymbol) => {
  const [price, setPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);
  const lastHistoryTime = useRef(0);
  const latestPrice = useRef<number | null>(null);
  const failCountRef = useRef(0);
  const fallbackRef = useRef<NodeJS.Timeout | null>(null);

  const stopFallback = useCallback(() => {
    if (fallbackRef.current) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }
  }, []);

  const startFallback = useCallback(() => {
    if (fallbackRef.current) return;
    let simPrice = FALLBACK_PRICES[symbol] + Math.random() * PRICE_VOLATILITY[symbol] * 10;
    const vol = PRICE_VOLATILITY[symbol];
    const tick = () => {
      const prev = simPrice;
      simPrice += (Math.random() - 0.48) * vol;
      latestPrice.current = simPrice;
      setPreviousPrice(prev);
      setPrice(simPrice);
      setLoading(false);
      setPriceHistory((h) => {
        const next = [...h, simPrice];
        return next.length > 60 ? next.slice(-60) : next;
      });
      fallbackRef.current = setTimeout(tick, 400 + Math.random() * 600);
    };
    tick();
  }, [symbol]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const pair = BINANCE_SYMBOLS[symbol];
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair}@trade`);
    wsRef.current = ws;

    ws.onopen = () => {
      failCountRef.current = 0;
      stopFallback();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newPrice = parseFloat(data.p);
        if (isNaN(newPrice)) return;

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
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    ws.onerror = () => {};

    ws.onclose = () => {
      failCountRef.current += 1;
      if (failCountRef.current >= 1) {
        startFallback();
        return;
      }
      reconnectRef.current = setTimeout(connect, 2000);
    };
  }, [symbol, startFallback, stopFallback]);

  useEffect(() => {
    // Reset state on symbol change
    setPrice(null);
    setPreviousPrice(null);
    setPriceHistory([]);
    setLoading(true);
    latestPrice.current = null;
    lastHistoryTime.current = 0;
    failCountRef.current = 0;
    stopFallback();

    wsRef.current?.close();
    if (reconnectRef.current) clearTimeout(reconnectRef.current);

    // Small delay to let old WS close
    const t = setTimeout(() => connect(), 100);
    return () => {
      clearTimeout(t);
      wsRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      stopFallback();
    };
  }, [connect, stopFallback]);

  const priceDirection = price && previousPrice
    ? price > previousPrice ? 'up' : price < previousPrice ? 'down' : 'neutral'
    : 'neutral';

  return { price, previousPrice, loading, priceDirection, priceHistory };
};

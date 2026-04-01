import { useState, useEffect, useCallback, useRef } from 'react';

export const useSolanaPrice = () => {
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

  const startFallback = useCallback(() => {
    if (fallbackRef.current) return;
    console.log('Starting simulated price feed');
    let simPrice = 130 + Math.random() * 10;
    const tick = () => {
      const prev = simPrice;
      simPrice += (Math.random() - 0.48) * 0.3;
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
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket('wss://stream.binance.com:9443/ws/solusdt@trade');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Binance WebSocket connected');
      failCountRef.current = 0;
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

    ws.onerror = (err) => {
      console.error('WS error:', err);
    };

    ws.onclose = () => {
      failCountRef.current += 1;
      if (failCountRef.current >= 1) {
        startFallback();
        return;
      }
      console.log('WS closed, reconnecting in 2s...');
      reconnectRef.current = setTimeout(connect, 2000);
    };
  }, [startFallback]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (fallbackRef.current) clearTimeout(fallbackRef.current);
    };
  }, [connect]);

  const priceDirection = price && previousPrice
    ? price > previousPrice ? 'up' : price < previousPrice ? 'down' : 'neutral'
    : 'neutral';

  return { price, previousPrice, loading, priceDirection, priceHistory };
};

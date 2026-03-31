import { useState, useEffect, useCallback, useRef } from 'react';

export const useSolanaPrice = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);

  const addToHistory = useCallback((newPrice: number) => {
    setPriceHistory((prev) => {
      const next = [...prev, newPrice];
      return next.length > 60 ? next.slice(-60) : next;
    });
  }, []);

  // Sample history at regular intervals for smoother chart
  const lastHistoryTime = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Binance WebSocket for SOL/USDT real-time trades
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/solusdt@trade');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Binance WebSocket connected');
      setLoading(false);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newPrice = parseFloat(data.p); // trade price
        if (isNaN(newPrice)) return;

        setPrice((prev) => {
          setPreviousPrice(prev);
          return newPrice;
        });

        // Add to history every 500ms max for smooth chart
        const now = Date.now();
        if (now - lastHistoryTime.current > 500) {
          lastHistoryTime.current = now;
          addToHistory(newPrice);
        }

        setLoading(false);
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WS error:', err);
    };

    ws.onclose = () => {
      console.log('WS closed, reconnecting in 2s...');
      reconnectRef.current = setTimeout(connect, 2000);
    };
  }, [addToHistory]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  const priceDirection = price && previousPrice
    ? price > previousPrice ? 'up' : price < previousPrice ? 'down' : 'neutral'
    : 'neutral';

  return { price, previousPrice, loading, priceDirection, priceHistory };
};

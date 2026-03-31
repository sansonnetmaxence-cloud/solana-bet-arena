import { useState, useEffect, useCallback } from 'react';

export const useSolanaPrice = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
      );
      const data = await res.json();
      const newPrice = data.solana.usd;
      setPrice((prev) => {
        setPreviousPrice(prev);
        return newPrice;
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch SOL price:', err);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  const priceDirection = price && previousPrice 
    ? price > previousPrice ? 'up' : price < previousPrice ? 'down' : 'neutral'
    : 'neutral';

  return { price, previousPrice, loading, priceDirection };
};

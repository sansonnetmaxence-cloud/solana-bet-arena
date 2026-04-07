import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MarketSymbol } from '@/hooks/useCryptoPrice';

const STORAGE_KEY = 'market-favorites-by-wallet';

type FavoritesByWallet = Partial<Record<string, MarketSymbol[]>>;

function readStoredFavorites(): FavoritesByWallet {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export const useMarketFavorites = (walletAddress: string | null) => {
  const [favoritesByWallet, setFavoritesByWallet] = useState<FavoritesByWallet>({});

  useEffect(() => {
    setFavoritesByWallet(readStoredFavorites());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesByWallet));
  }, [favoritesByWallet]);

  const favorites = useMemo(() => {
    if (!walletAddress) return [];
    return favoritesByWallet[walletAddress] ?? [];
  }, [favoritesByWallet, walletAddress]);

  const toggleFavorite = useCallback((market: MarketSymbol) => {
    if (!walletAddress) return;

    setFavoritesByWallet((prev) => {
      const current = prev[walletAddress] ?? [];
      const exists = current.includes(market);
      const nextFavorites = exists
        ? current.filter((item) => item !== market)
        : [...current, market];

      return {
        ...prev,
        [walletAddress]: nextFavorites,
      };
    });
  }, [walletAddress]);

  return {
    favorites,
    canFavorite: Boolean(walletAddress),
    toggleFavorite,
  };
};

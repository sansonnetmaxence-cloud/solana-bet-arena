import { useState, useCallback } from 'react';

export type WalletType = 'phantom' | 'solflare' | 'backpack' | 'glow' | 'trust' | 'coinbase';

const MOCK_ADDRESSES: Record<WalletType, string> = {
  phantom: '7xKX...q4Pm',
  solflare: '3mFz...kR9v',
  backpack: 'B4cK...p9Lz',
  glow: 'GL0w...x2Rt',
  trust: 'Tru5...t8Wq',
  coinbase: 'CbW4...l3Zn',
};

export const useWallet = () => {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async (type: WalletType) => {
    setConnecting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setWalletAddress(MOCK_ADDRESSES[type] ?? '7xKX...q4Pm');
    setWalletType(type);
    setConnected(true);
    setConnecting(false);
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setWalletAddress(null);
    setWalletType(null);
  }, []);

  return { connected, walletAddress, walletType, connecting, connect, disconnect };
};

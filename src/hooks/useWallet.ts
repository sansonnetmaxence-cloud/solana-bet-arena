import { useState, useCallback } from 'react';

export type WalletType = 'phantom' | 'solflare';

export const useWallet = () => {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async (type: WalletType) => {
    setConnecting(true);
    // Simulate wallet connection
    await new Promise((r) => setTimeout(r, 1500));
    const mockAddress = type === 'phantom'
      ? '7xKX...q4Pm'
      : '3mFz...kR9v';
    setWalletAddress(mockAddress);
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

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import BettingGrid from '@/components/BettingGrid';
import WalletPanel from '@/components/WalletPanel';
import BetHistory, { type BetRecord } from '@/components/BetHistory';
import { useSolanaPrice } from '@/hooks/useSolanaPrice';
import { useWallet } from '@/hooks/useWallet';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { cn } from '@/lib/utils';

interface ActiveBet {
  price: number;
  direction: 'up' | 'down';
  timeframe: number;
  startPrice: number;
  amount: number;
}

const Index = () => {
  const { price, previousPrice, priceDirection, loading, priceHistory } = useSolanaPrice();
  const [quickBetMode, setQuickBetMode] = useState(false);
  const [quickBetAmount, setQuickBetAmount] = useState(0.1);
  const wallet = useWallet();
  const sfx = useSoundEffects();
  const [activeBet, setActiveBet] = useState<ActiveBet | null>(null);
  const [betResult, setBetResult] = useState<'won' | 'lost' | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'up' | 'down' | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [betHistory, setBetHistory] = useState<BetRecord[]>([]);

  const handleSelectBet = useCallback((targetPrice: number, direction: 'up' | 'down', quickTimeframe?: number) => {
    if (!wallet.connected) return;
    sfx.playClick();

    // Quick bet mode: instantly place the bet
    if (quickBetMode && quickTimeframe != null && price) {
      const bet: ActiveBet = {
        price: targetPrice,
        direction,
        timeframe: quickTimeframe,
        startPrice: price,
        amount: 0.1,
      };
      setActiveBet(bet);
      setCountdown(quickTimeframe * 60);
      setBetResult(null);
      return;
    }

    setSelectedPrice(targetPrice);
    setSelectedDirection(direction);
  }, [wallet.connected, sfx, quickBetMode, price]);

  const handlePlaceBet = useCallback((amount: number, customPrice: number | null, timeframe: number) => {
    if (!price) return;
    const targetPrice = customPrice ?? selectedPrice;
    const direction = customPrice
      ? (customPrice > price ? 'up' : 'down')
      : selectedDirection;

    if (!targetPrice || !direction) return;

    const bet: ActiveBet = {
      price: targetPrice,
      direction,
      timeframe,
      startPrice: price,
      amount,
    };
    setActiveBet(bet);
    sfx.playClick();
    setCountdown(timeframe * 60);
    setBetResult(null);
  }, [price, selectedPrice, selectedDirection, sfx]);

  // Countdown timer
  useEffect(() => {
    if (!activeBet || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          if (price) {
            const won = activeBet.direction === 'up'
              ? price >= activeBet.price
              : price <= activeBet.price;
            const result = won ? 'won' : 'lost';
            setBetResult(result);
            if (won) sfx.playWin(); else sfx.playLose();

            // Record to history
            const record: BetRecord = {
              id: crypto.randomUUID(),
              direction: activeBet.direction,
              targetPrice: activeBet.price,
              startPrice: activeBet.startPrice,
              endPrice: price,
              amount: activeBet.amount,
              timeframe: activeBet.timeframe,
              result,
              timestamp: new Date(),
            };
            setBetHistory(prev => [...prev, record]);

            setTimeout(() => {
              setActiveBet(null);
              setBetResult(null);
              setSelectedPrice(null);
              setSelectedDirection(null);
            }, 4000);
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeBet, price, sfx]);

  const formatCountdown = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background grid-bg relative overflow-x-hidden">
      <div className="absolute inset-0 scanline pointer-events-none z-50" />
      
      <Header priceDirection={priceDirection as 'up' | 'down' | 'neutral'} />

      <div className="flex flex-1 min-h-[calc(100vh-57px)]">
        {/* Main area */}
        <div className={cn(
          'flex-1 flex flex-col items-center justify-center p-4 md:p-8 transition-all duration-500',
          betResult && 'relative'
        )}>
          {activeBet && countdown > 0 && (
            <div className="mb-6 text-center">
              <span className="font-display text-4xl md:text-5xl font-bold text-primary text-glow-primary">
                {formatCountdown(countdown)}
              </span>
              <p className="font-display text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                {activeBet.direction === 'up' ? '▲' : '▼'} Target: ${activeBet.price.toFixed(2)} • {activeBet.amount} SOL
              </p>
            </div>
          )}

          {betResult && (
            <div className={cn(
              'absolute inset-0 flex items-center justify-center z-40 bg-background/70 backdrop-blur-sm',
              'animate-in fade-in duration-500'
            )}>
              <div className={cn(
                'text-center p-8 rounded-xl border-2',
                betResult === 'won'
                  ? 'border-success glow-green'
                  : 'border-danger glow-red'
              )}>
                <span className={cn(
                  'font-display text-5xl md:text-7xl font-black',
                  betResult === 'won' ? 'text-success text-glow-green' : 'text-danger text-glow-red'
                )}>
                  {betResult === 'won' ? 'WIN' : 'LOSS'}
                </span>
                <p className="font-display text-sm text-muted-foreground mt-2 uppercase tracking-widest">
                  {betResult === 'won' ? `+${activeBet?.amount} SOL` : `-${activeBet?.amount} SOL`}
                </p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="font-display text-primary text-glow-primary animate-pulse-glow text-xl uppercase tracking-widest">
              Loading Price Feed...
            </div>
          ) : (
            <BettingGrid
              currentPrice={price}
              previousPrice={previousPrice}
              priceHistory={priceHistory}
              onSelectBet={handleSelectBet}
              activeBet={activeBet}
              betResult={betResult}
              quickBetMode={quickBetMode}
            />
          )}
        </div>

        {/* Right panel */}
        <div className={cn(
          'w-80 border-l border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-500 ease-out overflow-hidden',
          wallet.connected ? 'translate-x-0 opacity-100 max-w-80' : 'translate-x-full opacity-0 max-w-0 border-0'
        )}>
          <WalletPanel
            onPlaceBet={handlePlaceBet}
            activeBet={activeBet}
            connected={wallet.connected}
            walletAddress={wallet.walletAddress}
            walletType={wallet.walletType}
            connecting={wallet.connecting}
            onConnect={wallet.connect}
            onDisconnect={wallet.disconnect}
            quickBetMode={quickBetMode}
            onToggleQuickBet={setQuickBetMode}
          />
        </div>

        {!wallet.connected && (
          <div className="fixed bottom-6 right-6 z-30">
            <WalletPanel
              onPlaceBet={handlePlaceBet}
              activeBet={activeBet}
              connected={wallet.connected}
              walletAddress={wallet.walletAddress}
              walletType={wallet.walletType}
              connecting={wallet.connecting}
              onConnect={wallet.connect}
              onDisconnect={wallet.disconnect}
              quickBetMode={quickBetMode}
              onToggleQuickBet={setQuickBetMode}
            />
          </div>
        )}
      </div>

      {/* Bet History */}
      <div className="border-t border-border/30 bg-card/20 backdrop-blur-sm">
        <BetHistory history={betHistory} />
      </div>
    </div>
  );
};

export default Index;

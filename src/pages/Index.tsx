import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import BettingGrid from '@/components/BettingGrid';
import WalletPanel from '@/components/WalletPanel';
import BetHistory, { type BetRecord } from '@/components/BetHistory';
import LiveFeed from '@/components/LiveFeed';
import { useSolanaPrice } from '@/hooks/useSolanaPrice';
import { useWallet } from '@/hooks/useWallet';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { cn } from '@/lib/utils';

interface ActiveBet {
  id: string;
  price: number;
  direction: 'up' | 'down';
  timeframe: number;
  startPrice: number;
  amount: number;
  countdown: number;
}

const Index = () => {
  const { price, previousPrice, priceDirection, loading, priceHistory } = useSolanaPrice();
  const [quickBetMode] = useState(true);
  const [quickBetAmount, setQuickBetAmount] = useState(0.1);
  const wallet = useWallet();
  const sfx = useSoundEffects();
  const [activeBets, setActiveBets] = useState<ActiveBet[]>([]);
  const [latestResult, setLatestResult] = useState<'won' | 'lost' | null>(null);
  const [latestResultBet, setLatestResultBet] = useState<ActiveBet | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'up' | 'down' | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [betHistory, setBetHistory] = useState<BetRecord[]>([]);

  const handleSelectBet = useCallback((targetPrice: number, direction: 'up' | 'down', quickTimeframe?: number) => {
    if (!wallet.connected) return;
    sfx.playClick();

    if (quickBetMode && quickTimeframe != null && price) {
      const bet: ActiveBet = {
        id: crypto.randomUUID(),
        price: targetPrice,
        direction,
        timeframe: quickTimeframe,
        startPrice: price,
        amount: quickBetAmount,
        countdown: quickTimeframe * 60,
      };
      setActiveBets(prev => [...prev, bet]);
      return;
    }

    setSelectedPrice(targetPrice);
    setSelectedDirection(direction);
  }, [wallet.connected, sfx, quickBetMode, price, quickBetAmount]);

  const handlePlaceBet = useCallback((amount: number, customPrice: number | null, timeframe: number) => {
    if (!price) return;
    const targetPrice = customPrice ?? selectedPrice;
    const direction = customPrice
      ? (customPrice > price ? 'up' : 'down')
      : selectedDirection;

    if (!targetPrice || !direction) return;

    const bet: ActiveBet = {
      id: crypto.randomUUID(),
      price: targetPrice,
      direction,
      timeframe,
      startPrice: price,
      amount,
      countdown: timeframe * 60,
    };
    setActiveBets(prev => [...prev, bet]);
    sfx.playClick();
    setSelectedPrice(null);
    setSelectedDirection(null);
  }, [price, selectedPrice, selectedDirection, sfx]);

  // Countdown timer for all active bets
  useEffect(() => {
    if (activeBets.length === 0) return;
    const timer = setInterval(() => {
      setActiveBets(prev => {
        const updated: ActiveBet[] = [];
        const resolved: ActiveBet[] = [];

        prev.forEach(bet => {
          if (bet.countdown <= 1) {
            resolved.push(bet);
          } else {
            updated.push({ ...bet, countdown: bet.countdown - 1 });
          }
        });

        // Resolve finished bets
        if (resolved.length > 0 && price) {
          resolved.forEach(bet => {
            const won = bet.direction === 'up'
              ? price >= bet.price
              : price <= bet.price;
            const result = won ? 'won' : 'lost';
            if (won) sfx.playWin(); else sfx.playLose();

            setLatestResult(result);
            setLatestResultBet(bet);

            const record: BetRecord = {
              id: crypto.randomUUID(),
              direction: bet.direction,
              targetPrice: bet.price,
              startPrice: bet.startPrice,
              endPrice: price,
              amount: bet.amount,
              timeframe: bet.timeframe,
              result,
              timestamp: new Date(),
            };
            setBetHistory(prev => [...prev, record]);
          });

          setTimeout(() => {
            setLatestResult(null);
            setLatestResultBet(null);
          }, 4000);
        }

        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeBets.length, price, sfx]);

  // First active bet for backward compat display
  const primaryBet = activeBets.length > 0 ? activeBets[0] : null;
  const primaryCountdown = primaryBet?.countdown ?? 0;

  // Grid overlay direction: use the latest bet's direction
  const gridDirection = primaryBet?.direction ?? null;

  return (
    <div className="min-h-screen bg-background grid-bg relative overflow-x-hidden">
      {/* Green grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ease-in-out"
        style={{
          opacity: gridDirection === 'up' ? 1 : 0,
          backgroundImage: 
          'linear-gradient(hsl(160 100% 51% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(160 100% 51% / 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          animation: gridDirection === 'up' ? 'grid-breathe 2s ease-in-out infinite' : 'none',
        }}
      />
      {/* Red grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ease-in-out"
        style={{
          opacity: gridDirection === 'down' ? 1 : 0,
          backgroundImage:
            'linear-gradient(hsl(0 100% 63% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(0 100% 63% / 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          animation: gridDirection === 'down' ? 'grid-breathe 2s ease-in-out infinite' : 'none',
        }}
      />
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ease-in-out"
        style={{
          opacity: primaryBet ? 1 : 0,
          background: gridDirection === 'up'
            ? 'radial-gradient(ellipse at center, hsl(160 100% 51% / 0.1) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at center, hsl(0 100% 63% / 0.1) 0%, transparent 60%)',
        }}
      />
      <div className="absolute inset-0 scanline pointer-events-none z-50" />
      
      <Header priceDirection={priceDirection as 'up' | 'down' | 'neutral'} />

      <div className="flex flex-1 min-h-[calc(100vh-57px)]">
        {/* Main area */}
        <div className={cn(
          'flex-1 flex flex-col items-center justify-center p-4 md:p-8 transition-all duration-500',
          latestResult && 'relative'
        )}>

          {latestResult && latestResultBet && (
            <div className={cn(
              'absolute inset-0 flex items-center justify-center z-40 backdrop-blur-md',
              'animate-in fade-in duration-300'
            )}>
              <div className={cn(
                'text-center p-12 rounded-2xl border-2 animate-result-pop',
                latestResult === 'won'
                  ? 'border-success glow-green bg-success/5'
                  : 'border-danger glow-red bg-danger/5'
              )}>
                <span className={cn(
                  'font-display text-7xl md:text-9xl font-black block animate-result-text',
                  latestResult === 'won' ? 'text-success text-glow-green' : 'text-danger text-glow-red'
                )}>
                  {latestResult === 'won' ? '🏆 WIN' : '💀 LOSS'}
                </span>
                <p className={cn(
                  'font-display text-xl md:text-2xl mt-4 uppercase tracking-widest font-bold animate-result-amount',
                  latestResult === 'won' ? 'text-success' : 'text-danger'
                )}>
                  {latestResult === 'won' ? `+${latestResultBet.amount} SOL` : `-${latestResultBet.amount} SOL`}
                </p>
                {latestResult === 'won' && (
                  <div className="mt-2 text-2xl animate-bounce">🎉🎉🎉</div>
                )}
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
              activeBets={activeBets}
              betResult={latestResult}
              quickBetMode={quickBetMode}
              countdown={primaryCountdown}
              selectedPrice={selectedPrice}
              selectedDirection={selectedDirection}
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
            activeBet={primaryBet}
            connected={wallet.connected}
            walletAddress={wallet.walletAddress}
            walletType={wallet.walletType}
            connecting={wallet.connecting}
            onConnect={wallet.connect}
            onDisconnect={wallet.disconnect}
            quickBetMode={quickBetMode}
            onToggleQuickBet={() => {}}
            quickBetAmount={quickBetAmount}
            onQuickBetAmountChange={setQuickBetAmount}
          />
        </div>

        {!wallet.connected && (
          <div className="fixed bottom-6 right-6 z-30">
            <WalletPanel
              onPlaceBet={handlePlaceBet}
              activeBet={primaryBet}
              connected={wallet.connected}
              walletAddress={wallet.walletAddress}
              walletType={wallet.walletType}
              connecting={wallet.connecting}
              onConnect={wallet.connect}
              onDisconnect={wallet.disconnect}
              quickBetMode={quickBetMode}
              onToggleQuickBet={setQuickBetMode}
              quickBetAmount={quickBetAmount}
              onQuickBetAmountChange={setQuickBetAmount}
            />
          </div>
        )}
      </div>

      {/* Live Feed */}
      <LiveFeed />

      {/* Bet History */}
      <div className="border-t border-border/30 bg-card/20 backdrop-blur-sm">
        <BetHistory history={betHistory} />
      </div>
    </div>
  );
};

export default Index;

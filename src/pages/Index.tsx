import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import BettingGrid from '@/components/BettingGrid';
import TopBar from '@/components/TopBar';
import BetHistory, { type BetRecord } from '@/components/BetHistory';
import LiveFeed from '@/components/LiveFeed';
import WinRain from '@/components/WinRain';
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

interface Notification {
  id: string;
  message: string;
  type: 'win' | 'loss' | 'info';
  timestamp: number;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: 'win' | 'loss' | 'info') => {
    const notif: Notification = { id: crypto.randomUUID(), message, type, timestamp: Date.now() };
    setNotifications(prev => [notif, ...prev].slice(0, 20));
  }, []);

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
      setSelectedPrice(null);
      setSelectedDirection(null);
      addNotification(`Bet placed: ${direction === 'up' ? '▲' : '▼'} $${targetPrice.toFixed(2)} · ${quickBetAmount} SOL`, 'info');
      return;
    }

    setSelectedPrice(targetPrice);
    setSelectedDirection(direction);
  }, [wallet.connected, sfx, quickBetMode, price, quickBetAmount, addNotification]);

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
    addNotification(`Bet placed: ${direction === 'up' ? '▲' : '▼'} $${targetPrice.toFixed(2)} · ${amount} SOL`, 'info');
  }, [price, selectedPrice, selectedDirection, sfx, addNotification]);

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

        if (resolved.length > 0 && price) {
          resolved.forEach(bet => {
            const won = bet.direction === 'up'
              ? price >= bet.price
              : price <= bet.price;
            const result = won ? 'won' : 'lost';
            if (won) sfx.playWin(); else sfx.playLose();

            setLatestResult(result);
            setLatestResultBet(bet);

            addNotification(
              won
                ? `WIN +${bet.amount} SOL on $${bet.price.toFixed(2)}`
                : `LOSS -${bet.amount} SOL on $${bet.price.toFixed(2)}`,
              won ? 'win' : 'loss'
            );

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
  }, [activeBets.length, price, sfx, addNotification]);

  const primaryBet = activeBets.length > 0 ? activeBets[0] : null;
  const primaryCountdown = primaryBet?.countdown ?? 0;
  const gridDirection = primaryBet?.direction ?? null;

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Grid color overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-1500 ease-in-out"
        style={{
          opacity: gridDirection === 'up' ? 0.4 : 0,
          backgroundImage:
            'linear-gradient(hsl(160 100% 51% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(160 100% 51% / 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-1500 ease-in-out"
        style={{
          opacity: gridDirection === 'down' ? 0.4 : 0,
          backgroundImage:
            'linear-gradient(hsl(0 100% 63% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(0 100% 63% / 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <Header priceDirection={priceDirection as 'up' | 'down' | 'neutral'} />

      <TopBar
        connected={wallet.connected}
        walletAddress={wallet.walletAddress}
        walletType={wallet.walletType}
        connecting={wallet.connecting}
        onConnect={wallet.connect}
        onDisconnect={wallet.disconnect}
        quickBetAmount={quickBetAmount}
        onQuickBetAmountChange={setQuickBetAmount}
        notifications={notifications}
      />

      {/* Main area */}
      <div className={cn(
        'flex flex-col items-center justify-center p-4 md:p-8 min-h-[calc(100vh-120px)] transition-all duration-500',
        latestResult && 'relative'
      )}>
        {latestResult && latestResultBet && (
          <div className="absolute inset-0 flex items-center justify-center z-40 backdrop-blur-sm bg-background/60 animate-in fade-in duration-300">
            <div className={cn(
              'text-center p-10 md:p-14 rounded-2xl border animate-result-pop',
              latestResult === 'won'
                ? 'border-success/30 bg-card/90'
                : 'border-danger/30 bg-card/90'
            )}>
              <span className={cn(
                'font-display text-6xl md:text-8xl font-black block',
                latestResult === 'won' ? 'text-success' : 'text-danger'
              )}
                style={{
                  textShadow: latestResult === 'won'
                    ? '0 0 40px hsl(160 100% 51% / 0.3)'
                    : '0 0 40px hsl(0 100% 63% / 0.3)',
                }}
              >
                {latestResult === 'won' ? 'WIN' : 'LOSS'}
              </span>
              <p className={cn(
                'font-display text-2xl md:text-3xl mt-3 font-black tabular-nums',
                latestResult === 'won' ? 'text-success/80' : 'text-danger/80'
              )}>
                {latestResult === 'won' ? `+${latestResultBet.amount}` : `-${latestResultBet.amount}`} SOL
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
            activeBets={activeBets}
            betResult={latestResult}
            quickBetMode={quickBetMode}
            countdown={primaryCountdown}
            selectedPrice={selectedPrice}
            selectedDirection={selectedDirection}
          />
        )}
      </div>

      <LiveFeed />

      <div className="border-t border-border/30 bg-card/20 backdrop-blur-sm">
        <BetHistory history={betHistory} />
      </div>
    </div>
  );
};

export default Index;

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const priceRef = useRef(price);
  useEffect(() => { priceRef.current = price; }, [price]);

  const addNotification = useCallback((message: string, type: 'win' | 'loss' | 'info') => {
    const notif: Notification = { id: crypto.randomUUID(), message, type, timestamp: Date.now() };
    setNotifications(prev => [notif, ...prev].slice(0, 20));
  }, []);

  const sfxRef = useRef(sfx);
  useEffect(() => { sfxRef.current = sfx; }, [sfx]);
  const addNotificationRef = useRef(addNotification);
  useEffect(() => { addNotificationRef.current = addNotification; }, [addNotification]);

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
        const currentPrice = priceRef.current;

        prev.forEach(bet => {
          if (bet.countdown <= 1) {
            resolved.push(bet);
          } else {
            updated.push({ ...bet, countdown: bet.countdown - 1 });
          }
        });

        if (resolved.length > 0 && currentPrice) {
          resolved.forEach(bet => {
            const won = bet.direction === 'up'
              ? currentPrice >= bet.price
              : currentPrice <= bet.price;
            const result = won ? 'won' : 'lost';
            if (won) sfxRef.current.playWin(); else sfxRef.current.playLose();

            setLatestResult(result);
            setLatestResultBet(bet);

            addNotificationRef.current(
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
              endPrice: currentPrice,
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
  }, [activeBets.length]);

  const primaryBet = activeBets.length > 0 ? activeBets[0] : null;
  const primaryCountdown = primaryBet?.countdown ?? 0;
  const gridDirection = primaryBet?.direction ?? null;

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <WinRain active={latestResult === 'won'} />
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
        'flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-120px)] transition-all duration-500',
        latestResult && 'relative'
      )}>
        {latestResult && latestResultBet && (
          <div className="fixed inset-0 flex items-center justify-center z-50 animate-result-backdrop bg-background/70">
            {/* Radial glow behind */}
            <div
              className={cn(
                'absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full animate-result-glow',
                latestResult === 'won' ? 'bg-success/10' : 'bg-danger/10',
              )}
              style={{
                filter: 'blur(80px)',
              }}
            />
            <div className={cn(
              'relative text-center p-8 sm:p-10 md:p-16 rounded-3xl border animate-result-pop',
              latestResult === 'won'
                ? 'border-success/20 bg-card/95 shadow-[0_0_80px_hsl(160_100%_51%/0.15)]'
                : 'border-danger/20 bg-card/95 shadow-[0_0_80px_hsl(0_100%_63%/0.15)]'
            )}>
              <span className={cn(
                'font-display text-5xl sm:text-7xl md:text-9xl font-black block animate-result-text tracking-wider',
                latestResult === 'won' ? 'text-success' : 'text-danger'
              )}
                style={{
                  textShadow: latestResult === 'won'
                    ? '0 0 60px hsl(160 100% 51% / 0.5), 0 0 120px hsl(160 100% 51% / 0.2)'
                    : '0 0 60px hsl(0 100% 63% / 0.5), 0 0 120px hsl(0 100% 63% / 0.2)',
                }}
              >
                {latestResult === 'won' ? 'WIN' : 'LOSS'}
              </span>
              <p className={cn(
                'font-display text-xl sm:text-2xl md:text-4xl mt-4 font-black tabular-nums animate-result-amount',
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

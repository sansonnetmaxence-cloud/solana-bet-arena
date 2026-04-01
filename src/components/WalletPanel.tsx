import { useState } from 'react';
import { cn } from '@/lib/utils';
import { WalletType } from '@/hooks/useWallet';
import { Switch } from '@/components/ui/switch';

interface WalletPanelProps {
  onPlaceBet: (amount: number, customPrice: number | null, timeframe: number) => void;
  activeBet: any;
  connected: boolean;
  walletAddress: string | null;
  walletType: WalletType | null;
  connecting: boolean;
  onConnect: (type: WalletType) => void;
  onDisconnect: () => void;
  quickBetMode: boolean;
  onToggleQuickBet: (val: boolean) => void;
  quickBetAmount: number;
  onQuickBetAmountChange: (val: number) => void;
}

const WalletPanel = ({
  onPlaceBet,
  activeBet,
  connected,
  walletAddress,
  walletType,
  connecting,
  onConnect,
  onDisconnect,
  quickBetMode,
  onToggleQuickBet,
  quickBetAmount,
  onQuickBetAmountChange,
}: WalletPanelProps) => {
  const [amount, setAmount] = useState('0.1');
  const [customPrice, setCustomPrice] = useState('');
  const [timeframe, setTimeframe] = useState(5);

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-8">
        <h3 className="font-display text-lg text-muted-foreground tracking-wider uppercase">
          Connect Wallet to Bet
        </h3>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => onConnect('phantom')}
            disabled={connecting}
            className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-lg bg-secondary/20 border border-secondary/40 text-secondary-foreground font-display text-sm uppercase tracking-wider hover:bg-secondary/30 hover:glow-secondary transition-all disabled:opacity-50"
          >
            {connecting ? '⏳ Connecting...' : '👻 Phantom'}
          </button>
          <button
            onClick={() => onConnect('solflare')}
            disabled={connecting}
            className="flex items-center justify-center gap-3 w-full py-3 px-6 rounded-lg bg-primary/10 border border-primary/40 text-foreground font-display text-sm uppercase tracking-wider hover:bg-primary/20 hover:glow-primary transition-all disabled:opacity-50"
          >
            {connecting ? '⏳ Connecting...' : '☀️ Solflare'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Wallet info */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">{walletType}</span>
          <span className="font-display text-sm text-primary">{walletAddress}</span>
        </div>
        <button
          onClick={onDisconnect}
          className="text-[10px] text-danger/70 uppercase tracking-wider hover:text-danger transition-colors"
        >
          Disconnect
        </button>
      </div>

      <div className="h-px bg-border" />

      {/* Bet Amount */}
      <div>
        <label className="font-display text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">
          Bet Amount (SOL)
        </label>
        <div className="flex gap-2">
          {[0.05, 0.1, 0.5, 1].map((a) => (
            <button
              key={a}
              onClick={() => onQuickBetAmountChange(a)}
              className={cn(
                'flex-1 py-1.5 rounded text-[10px] font-display uppercase border transition-all',
                quickBetAmount === a
                  ? 'border-primary/60 text-primary bg-primary/10 glow-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30'
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <span className="font-display text-[9px] text-primary/70 uppercase tracking-widest">
          ⚡ Click any card to instantly place a bet
        </span>
      </div>

    </div>
  );
    </div>
  );
};

export default WalletPanel;

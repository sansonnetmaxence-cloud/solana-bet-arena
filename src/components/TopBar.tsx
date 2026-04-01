import { useState } from 'react';
import { cn } from '@/lib/utils';
import { WalletType } from '@/hooks/useWallet';

interface Notification {
  id: string;
  message: string;
  type: 'win' | 'loss' | 'info';
  timestamp: number;
}

interface TopBarProps {
  connected: boolean;
  walletAddress: string | null;
  walletType: WalletType | null;
  connecting: boolean;
  onConnect: (type: WalletType) => void;
  onDisconnect: () => void;
  quickBetAmount: number;
  onQuickBetAmountChange: (val: number) => void;
  notifications: Notification[];
}

const TopBar = ({
  connected,
  walletAddress,
  walletType,
  connecting,
  onConnect,
  onDisconnect,
  quickBetAmount,
  onQuickBetAmountChange,
  notifications,
}: TopBarProps) => {
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [walletCurrency, setWalletCurrency] = useState<'SOL' | 'USD'>('SOL');
  const solPrice = 130;
  const balanceSOL = 4.20;
  const balanceDisplay = walletCurrency === 'SOL' ? `${balanceSOL.toFixed(2)}` : `$${(balanceSOL * solPrice).toFixed(2)}`;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 gap-2 sm:gap-0 bg-card/40 backdrop-blur-md border-b border-border/20 relative z-20">
      {/* Row 1 on mobile: Notifications + Wallet */}
      <div className="flex items-center justify-between sm:contents">
        {/* Left — Notifications */}
        <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
          {notifications.length > 0 ? (
            <div className="flex items-center gap-1.5 sm:gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
              <span className={cn(
                'w-1.5 h-1.5 rounded-full shrink-0',
                notifications[0].type === 'win' ? 'bg-success animate-pulse' : notifications[0].type === 'loss' ? 'bg-danger animate-pulse' : 'bg-muted-foreground'
              )} />
              <span className={cn(
                'font-display text-[10px] sm:text-[11px] tracking-wide truncate',
                notifications[0].type === 'win' ? 'text-success' : notifications[0].type === 'loss' ? 'text-danger' : 'text-muted-foreground'
              )}>
                {notifications[0].message}
              </span>
            </div>
          ) : (
            <span className="font-display text-[9px] sm:text-[10px] text-muted-foreground/50 uppercase tracking-widest">No activity</span>
          )}
        </div>

        {/* Right — Wallet (visible on mobile in this row) */}
        <div className="flex items-center gap-1.5 sm:hidden">
          {connected ? (
            <>
              <button
                onClick={() => setWalletCurrency(c => c === 'SOL' ? 'USD' : 'SOL')}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-success/[0.06] border border-success/15 hover:bg-success/[0.1] transition-all cursor-pointer"
              >
                <span className="font-display text-sm font-black text-success tabular-nums">
                  {balanceDisplay}
                </span>
                <span className="font-display text-[8px] text-success/40 font-bold">
                  {walletCurrency === 'SOL' ? 'SOL → $' : '$ → SOL'}
                </span>
              </button>
              <button
                onClick={onDisconnect}
                className="px-2 py-1 rounded-md text-[9px] font-display font-bold uppercase tracking-wider border border-danger/30 text-danger/70 hover:text-danger hover:border-danger/50 hover:bg-danger/5 transition-all"
              >
                ✕
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowWalletMenu(!showWalletMenu)}
              disabled={connecting}
              className="px-3 py-1 rounded-md text-[10px] font-display font-bold uppercase tracking-wider border border-primary/40 text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
            >
              {connecting ? '...' : 'Connect'}
            </button>
          )}
        </div>
      </div>

      {/* Center — Bet Amount (full width on mobile) */}
      <div className="flex items-center justify-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-hide">
        <span className="font-display text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-widest mr-1 hidden md:block">Bet</span>
        {[0.05, 0.1, 0.5, 1].map((a) => (
          <button
            key={a}
            onClick={() => onQuickBetAmountChange(a)}
            className={cn(
              'px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-[11px] font-display font-bold transition-all duration-150 border whitespace-nowrap',
              quickBetAmount === a
                ? 'border-primary/50 text-primary bg-primary/10'
                : 'border-border/30 text-muted-foreground hover:border-primary/30 hover:text-foreground'
            )}
          >
            {a} SOL
          </button>
        ))}
      </div>

      {/* Right — Theme toggle + Wallet (desktop) */}
      <div className="hidden sm:flex flex-1 items-center justify-end gap-3">
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md border border-border/30 hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground"
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        >
          {theme === 'dark' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
        {connected ? (
          <>
            <button
              onClick={() => setWalletCurrency(c => c === 'SOL' ? 'USD' : 'SOL')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-success/[0.06] border border-success/15 hover:bg-success/[0.1] transition-all cursor-pointer"
            >
              <span className="font-display text-base font-black text-success tabular-nums">
                {balanceDisplay}
              </span>
              <span className="font-display text-[9px] text-success/40 font-bold">
                {walletCurrency === 'SOL' ? 'SOL → $' : '$ → SOL'}
              </span>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="font-display text-[11px] text-primary tracking-wide">{walletAddress}</span>
            </div>
            <button
              onClick={onDisconnect}
              className="px-3 py-1 rounded-md text-[10px] font-display font-bold uppercase tracking-wider border border-danger/30 text-danger/70 hover:text-danger hover:border-danger/50 hover:bg-danger/5 transition-all"
            >
              Disconnect
            </button>
          </>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowWalletMenu(!showWalletMenu)}
              disabled={connecting}
              className="px-4 py-1.5 rounded-md text-[11px] font-display font-bold uppercase tracking-wider border border-primary/40 text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        )}
        {showWalletMenu && !connecting && (
          <div className="absolute right-3 sm:right-5 top-full mt-1.5 flex flex-col gap-1 bg-card/95 backdrop-blur-xl border border-border/30 rounded-lg p-1.5 shadow-xl z-50 min-w-[160px] animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => { onConnect('phantom'); setShowWalletMenu(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-[11px] font-display text-foreground hover:bg-primary/10 transition-colors"
            >
              👻 Phantom
            </button>
            <button
              onClick={() => { onConnect('solflare'); setShowWalletMenu(false); }}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-[11px] font-display text-foreground hover:bg-primary/10 transition-colors"
            >
              ☀️ Solflare
            </button>
          </div>
        )}
      </div>

      {/* Mobile wallet menu */}
      {showWalletMenu && !connecting && (
        <div className="sm:hidden absolute right-3 top-full mt-1.5 flex flex-col gap-1 bg-card/95 backdrop-blur-xl border border-border/30 rounded-lg p-1.5 shadow-xl z-50 min-w-[140px] animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={() => { onConnect('phantom'); setShowWalletMenu(false); }}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-[11px] font-display text-foreground hover:bg-primary/10 transition-colors"
          >
            👻 Phantom
          </button>
          <button
            onClick={() => { onConnect('solflare'); setShowWalletMenu(false); }}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-[11px] font-display text-foreground hover:bg-primary/10 transition-colors"
          >
            ☀️ Solflare
          </button>
        </div>
      )}
    </div>
  );
};

export default TopBar;

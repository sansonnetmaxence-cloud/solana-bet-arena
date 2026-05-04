import { cn } from '@/lib/utils';
import type { WalletType } from '@/hooks/useWallet';
import phantomLogo from '@/assets/phantom-logo.png';
import solflareLogo from '@/assets/solflare-logo.png';
import trustLogo from '@/assets/wallets/trust.png';
import coinbaseLogo from '@/assets/wallets/coinbase.png';

interface WalletItem {
  type: WalletType;
  name: string;
  logo: string;
  badge?: 'Recommended' | 'DeFi';
  accent: string;
}

const WALLETS: WalletItem[] = [
  { type: 'phantom', name: 'Phantom', logo: phantomLogo, badge: 'Recommended', accent: '#AB9FF2' },
  { type: 'solflare', name: 'Solflare', logo: solflareLogo, badge: 'Recommended', accent: '#FC7227' },
  { type: 'coinbase', name: 'Coinbase Wallet', logo: coinbaseLogo, badge: 'Recommended', accent: '#1652F0' },
  { type: 'trust', name: 'Trust Wallet', logo: trustLogo, accent: '#3375BB' },
];

interface WalletListProps {
  onSelect: (type: WalletType) => void;
  connecting: boolean;
}

export const WalletList = ({ onSelect, connecting }: WalletListProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      {WALLETS.map((w) => (
        <button
          key={w.type}
          onClick={() => onSelect(w.type)}
          disabled={connecting}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full',
            'bg-card/30 border border-border/30 hover:border-primary/40 hover:bg-primary/5',
            'transition-all group disabled:opacity-50 disabled:pointer-events-none'
          )}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden border"
            style={{
              backgroundColor: `${w.accent}1A`,
              borderColor: `${w.accent}33`,
            }}
          >
            <img
              src={w.logo}
              alt={w.name}
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
              loading="lazy"
            />
          </div>
          <div className="flex-1 flex flex-col items-start">
            <span className="font-display text-[13px] font-semibold text-foreground">{w.name}</span>
            <span className="font-display text-[9px] text-muted-foreground/60">
              {w.type === 'phantom' && 'phantom.app'}
              {w.type === 'solflare' && 'solflare.com'}
              {w.type === 'backpack' && 'backpack.app'}
              {w.type === 'glow' && 'glow.app'}
              {w.type === 'trust' && 'trustwallet.com'}
              {w.type === 'coinbase' && 'coinbase.com/wallet'}
            </span>
          </div>
          {w.badge && (
            <span
              className={cn(
                'font-display text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md border',
                w.badge === 'Recommended'
                  ? 'border-primary/30 text-primary bg-primary/5'
                  : 'border-secondary/40 text-secondary-foreground bg-secondary/10'
              )}
            >
              {w.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

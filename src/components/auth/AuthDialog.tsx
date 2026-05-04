import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useAuthDialog } from '@/hooks/useAuthDialog';
import { useWallet, type WalletType } from '@/hooks/useWallet';
import { EmailAuthStep } from './EmailAuthStep';
import { WalletList } from './WalletList';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AuthDialogProps {
  wallet: ReturnType<typeof useWallet>;
}

export const AuthDialog = ({ wallet }: AuthDialogProps) => {
  const { open, closeDialog } = useAuthDialog();

  const handleEmailSuccess = (email: string) => {
    toast({ title: 'Email verified', description: `Welcome ${email}` });
    closeDialog();
  };

  const handleWalletSelect = async (type: WalletType) => {
    await wallet.connect(type);
    // Persist wallet to marketing_contacts (best-effort)
    try {
      // Use a deterministic mock address based on type — replace with real address once SDK integrated
      await supabase.functions.invoke('collect-marketing-contact', {
        body: {
          walletAddress: `mock-${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
          source: 'wallet_connect',
          marketingConsent: true,
        },
      });
    } catch (e) {
      console.error(e);
    }
    toast({ title: 'Wallet connected', description: type });
    closeDialog();
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && closeDialog()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-50 bg-background/40 backdrop-blur-3xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            // Position below the navbar (~64px) and never overlap it
            'fixed left-1/2 z-50 -translate-x-1/2',
            'top-[72px] sm:top-[80px]',
            // Constrained height so it never goes under the navbar
            'max-h-[calc(100vh-88px)] sm:max-h-[calc(100vh-100px)] overflow-y-auto',
            // Narrower & fully responsive
            'w-[94vw] sm:w-[80vw] md:w-[60vw] lg:w-[42vw] xl:w-[34vw] max-w-[460px]',
            'rounded-2xl border border-primary/20 bg-transparent backdrop-blur-3xl shadow-2xl',
            'p-5 sm:p-6 flex flex-col gap-4',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogPrimitive.Title className="font-display text-xl md:text-2xl font-black text-foreground tracking-tight">
                Connect to start trading
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="font-display text-[11px] text-muted-foreground mt-1 uppercase tracking-widest">
                Email or Solana wallet
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-card/50 transition-colors">
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Email auth */}
          <div className="rounded-xl border border-border/30 bg-card/30 p-4">
            <EmailAuthStep onSuccess={handleEmailSuccess} />
          </div>

          {/* Separator */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/40" />
            <span className="font-display text-[10px] text-muted-foreground/60 uppercase tracking-widest">
              or connect a wallet
            </span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Wallet list */}
          <WalletList onSelect={handleWalletSelect} connecting={wallet.connecting} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

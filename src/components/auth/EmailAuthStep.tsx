import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().trim().toLowerCase().email().max(255);

interface EmailAuthStepProps {
  onSuccess: (email: string) => void;
}

export const EmailAuthStep = ({ onSuccess }: EmailAuthStepProps) => {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<'email' | 'otp'>('email');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    // Mock send (no email backend yet) — UX placeholder. Demo code: 000000
    await new Promise((r) => setTimeout(r, 600));
    setStage('otp');
    setLoading(false);
    toast({ title: 'Code sent', description: 'Use 000000 (demo). Real OTP coming soon.' });
  };

  const handleVerify = async (val: string) => {
    setCode(val);
    if (val.length !== 6) return;
    setLoading(true);
    // Mock verification: accept 000000 OR any 6-digit code in demo mode
    if (val !== '000000' && !/^\d{6}$/.test(val)) {
      toast({ title: 'Invalid code', variant: 'destructive' });
      setLoading(false);
      return;
    }
    // Persist to marketing_contacts
    try {
      await supabase.functions.invoke('collect-marketing-contact', {
        body: { email: parsed(email), source: 'auth_dialog', marketingConsent: true },
      });
    } catch (e) {
      // Non-blocking
      console.error(e);
    }
    onSuccess(email);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {stage === 'email' ? (
        <>
          <label className="font-display text-[10px] text-muted-foreground uppercase tracking-widest">
            Email
          </label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-card/40 border-border/40 font-display text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
            />
            <button
              onClick={handleSendCode}
              disabled={loading || !email}
              className={cn(
                'shrink-0 px-4 rounded-md text-[11px] font-display font-bold uppercase tracking-wider',
                'border border-primary/40 text-primary hover:bg-primary/10 transition-all disabled:opacity-50'
              )}
            >
              {loading ? '...' : 'Send code'}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/60 font-display">
            We&apos;ll send a 6-digit code to verify your email.
          </p>
        </>
      ) : (
        <>
          <label className="font-display text-[10px] text-muted-foreground uppercase tracking-widest">
            Enter the 6-digit code sent to {email}
          </label>
          <div className="flex justify-center py-2">
            <InputOTP maxLength={6} value={code} onChange={handleVerify}>
              <InputOTPGroup>
                <InputOTPSlot index={0} className="h-11 w-11 bg-card/40 border-border/40" />
                <InputOTPSlot index={1} className="h-11 w-11 bg-card/40 border-border/40" />
                <InputOTPSlot index={2} className="h-11 w-11 bg-card/40 border-border/40" />
                <InputOTPSlot index={3} className="h-11 w-11 bg-card/40 border-border/40" />
                <InputOTPSlot index={4} className="h-11 w-11 bg-card/40 border-border/40" />
                <InputOTPSlot index={5} className="h-11 w-11 bg-card/40 border-border/40" />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <button
            onClick={() => {
              setStage('email');
              setCode('');
            }}
            className="text-[10px] text-muted-foreground/70 hover:text-primary font-display uppercase tracking-wider self-center transition-colors"
          >
            ← Use a different email
          </button>
        </>
      )}
    </div>
  );
};

// Helper inlined to avoid recomputing parse
const parsed = (e: string) => emailSchema.parse(e);

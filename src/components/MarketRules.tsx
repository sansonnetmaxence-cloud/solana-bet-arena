import { Info, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const MarketRules = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-border/30 bg-card/20 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-sm font-display uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Règles du Marché</span>
          <div className={cn(
            'ml-auto text-xs transition-transform duration-300',
            open && 'rotate-180'
          )}>▼</div>
        </button>

        <div className={cn(
          'grid transition-all duration-500 ease-out',
          open ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
        )}>
          <div className="overflow-hidden">
            <div className="space-y-4">
              {/* Resolution */}
              <div className="rounded-xl border border-border/40 bg-card/40 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-display text-sm font-bold text-foreground mb-1">Résolution du Pari</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Chaque pari se résout automatiquement à l'expiration du timer choisi (30s, 1min, 5min). 
                      Le prix Solana en temps réel au moment de l'expiration détermine le résultat. 
                      Si le prix atteint ou dépasse votre cible dans la direction choisie, vous <span className="text-success font-semibold">gagnez</span>. 
                      Sinon, vous <span className="text-danger font-semibold">perdez</span> votre mise.
                    </p>
                  </div>
                </div>
              </div>

              {/* Timing */}
              <div className="rounded-xl border border-border/40 bg-card/40 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-display text-sm font-bold text-foreground mb-1">Fenêtre de Trading</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Les paris sont ouverts 24h/24, 7j/7. Le flux de prix Solana est récupéré en temps réel 
                      via l'API CoinGecko. Aucune manipulation de prix n'est possible — les données sont publiques et vérifiables.
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk */}
              <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-display text-sm font-bold text-warning mb-1">Avertissement</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Cette plateforme implique des risques financiers. Ne pariez que ce que vous pouvez vous permettre de perdre. 
                      Les performances passées ne garantissent pas les résultats futurs. Vous êtes seul responsable de vos décisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketRules;

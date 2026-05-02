## Plan : Refonte cartes de prix, fluidité globale, popup wallet & email auth

### 1. Distribution exponentielle des prix sur les cartes (BettingGrid)

**Objectif** : remplacer la distribution linéaire actuelle par 3 tranches structurées, identiques pour toutes les paires (SOL/BTC/ETH/XRP/futures).

Nouvelle logique dans `src/components/BettingGrid.tsx` :

```
Tranche 1 — 10 cartes  → label "30s"   → écart 0.10$ → 2.50$ (courbe expo)
Tranche 2 —  5 cartes  → label "1min"  → écart 2.50$ → 5.00$ (courbe expo)
Tranche 2 —  5 cartes  → label "2min"  → écart 2.50$ → 5.00$ (courbe expo)
Tranche 3 — 10 cartes  → label "5min"  → écart 5.10$ → 50.00$ (courbe expo)
                       Total : 30 cartes UP + 30 cartes DN
```

Le label de timeframe est désormais **déterministe** (lié à l'index/tranche), plus aléatoire. Les écarts suivent `offset = min + (max-min) * ((exp(k*t) - 1) / (exp(k) - 1))` avec t∈[0,1].

Sur mobile : on garde 3 tranches mais réduites (5/3/3/5 = 16 cartes par côté) pour la lisibilité.

### 2. Fluidité visuelle (zéro lag)

Optimisations ciblées :

- **`PriceCard` central** : remplacer les `setState(displayPrice)` à 60fps par une mise à jour DOM directe via `ref.current.textContent` → évite les re-renders React de tout l'arbre à chaque frame (gain massif).
- **`React.memo`** sur la `PriceCard` non-centrale + comparaison custom sur `price/selected/result/timeLabel`.
- **Mémoïsation du `randomTimes`** supprimée (devient déterministe → plus de recalcul).
- **`useMemo` stable** sur les listes `downPrices`/`upPrices` avec dépendance arrondie (`Math.round(basePrice*10)/10`) pour éviter les recalculs à chaque tick de prix.
- **Scroll** : ajout de `will-change: transform`, `contain: layout paint` et `overscroll-behavior: contain` sur les conteneurs UP/DN.
- **Hover** : passage des transitions sur `transform` uniquement (GPU), retrait des transitions sur `box-shadow`/`background` sur les cartes (remplacé par pseudo-élément en opacity).
- **`requestAnimationFrame` du prix** : ne tourne que si l'écart `|target-display| > 0.01`, sinon stop le RAF.
- **`<MiniChart>`** : memoization + throttle des updates (1 update / 250ms suffit pour le ressenti).

### 3. Popup de connexion wallet redesigné

Création de `src/components/auth/AuthDialog.tsx` (basé sur `Dialog` de shadcn déjà présent) :

- **Layout** : `max-w-[600px] w-[90vw] md:w-[50vw]` → moitié d'écran sur desktop, responsive mobile.
- **Backdrop** : override de `DialogOverlay` avec `backdrop-blur-3xl bg-background/40` (équivalent "blur 100%").
- **Sections** (de haut en bas) :
  1. **Header** : logo app + titre "Connect to start trading"
  2. **Email auth** (collecte + magic link 6 chiffres)
     - Input email → bouton "Send code" (style identique aux boutons existants `bg-primary/10 border-primary/40`)
     - Étape 2 : 6 inputs OTP (composant `InputOTP` shadcn déjà présent)
  3. **Séparateur** "or connect a wallet"
  4. **Liste des 6 wallets Solana** (Top 6, avec `.png` officiels téléchargés dans `src/assets/wallets/`) :
     - **Phantom** (badge "Recommandé")
     - **Solflare** (badge "Recommandé")
     - **Backpack** (badge "DeFi")
     - **Glow**
     - **Trust Wallet**
     - **Coinbase Wallet** (badge "Recommandé")
     - Footer : "100+ wallets compatibles Solana supportés"
  5. Boutons aux mêmes couleurs/forme que l'app actuelle (réutilisation des classes de `WalletPanel`).

- **SMS** : skip pour l'instant comme convenu, mais l'UI laisse une place pour un futur onglet "Phone".

### 4. Base de données marketing (Lovable Cloud, RLS stricte)

Activation Lovable Cloud puis migration créant :

```sql
-- Table de collecte opt-in
create table public.marketing_contacts (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  phone text unique,
  wallet_address text,
  source text not null default 'auth_dialog',  -- 'auth_dialog' | 'wallet_connect' | ...
  marketing_consent boolean not null default true,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Rôle admin séparé (pas sur le profil) pour éviter privilege escalation
create type public.app_role as enum ('admin', 'user');
create table public.user_roles (...);
create function public.has_role(...) security definer ...;

-- RLS stricte
alter table public.marketing_contacts enable row level security;
-- INSERT public (pour collecter depuis le dialog auth)
-- SELECT/UPDATE/DELETE : admin uniquement via has_role()
```

Edge function `collect-marketing-contact` :
- Validation Zod (email format, phone E.164, longueurs)
- Rate-limiting in-memory (10 inserts/IP/heure)
- Upsert idempotent sur email/phone
- Pas de log des données sensibles

### 5. Email magic-link (Lovable Emails — gratuit & natif)

Pour l'auth email avec code 6 chiffres :
- Setup email domain via `<lov-open-email-setup>` (étape 1).
- Une fois configuré : scaffold transactional email + edge function `send-otp-email` qui :
  - Génère un code 6 chiffres
  - Le stocke hashé (bcrypt) dans une table `email_otps` avec TTL 10 min
  - Envoie via Lovable Emails (template branded)
- Edge function `verify-otp-email` qui valide et crée la session.

### 6. Détails techniques

| Fichier | Action |
|---|---|
| `src/components/BettingGrid.tsx` | Nouvelle distribution expo + memo |
| `src/components/PriceCard.tsx` | DOM direct pour prix, `React.memo`, RAF conditionnel |
| `src/components/auth/AuthDialog.tsx` | **Nouveau** — popup |
| `src/components/auth/EmailAuthStep.tsx` | **Nouveau** — email + OTP |
| `src/components/auth/WalletList.tsx` | **Nouveau** — liste 6 wallets |
| `src/assets/wallets/*.png` | **Nouveaux** — logos officiels (téléchargés) |
| `src/hooks/useWallet.ts` | Refacto pour exposer le dialog state |
| `src/components/TopBar.tsx` | Bouton "Connect" → ouvre `AuthDialog` |
| `src/components/WalletPanel.tsx` | Supprimé / réduit (remplacé par dialog) |
| Migration SQL | `marketing_contacts` + `user_roles` + RLS |
| Edge functions | `collect-marketing-contact`, `send-otp-email`, `verify-otp-email` |

### Ordre d'exécution

1. Refonte distribution prix + optimisations fluidité (impact visuel immédiat, sans backend)
2. Activation Lovable Cloud + migration DB marketing + edge function de collecte
3. Setup email domain + scaffold OTP email
4. Création AuthDialog + intégration dans TopBar
5. Téléchargement des logos `.png` wallets et finalisation UI

### Note importante

L'**email domain setup** nécessite que tu cliques sur un bouton dans le chat pour configurer le domaine d'envoi (étape obligatoire pour les emails OTP). Je te le proposerai au moment d'attaquer l'étape 3.
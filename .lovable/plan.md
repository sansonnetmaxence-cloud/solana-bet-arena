## Plan : AuthDialog (popup unifié de connexion)

Création d'un popup de connexion centralisé avec collecte email (OTP 6 chiffres) et liste des 6 wallets Solana, déclenché depuis le bouton "Connect Wallet" de la TopBar.

### 1. Assets — logos wallets

Téléchargement et ajout dans `src/assets/wallets/` des logos PNG officiels :
- `phantom.png` (déjà présent → réutilisé via `src/assets/phantom-logo.png`)
- `solflare.png` (déjà présent)
- `backpack.png`
- `glow.png`
- `trust.png`
- `coinbase.png`

Sources : sites officiels / brand kits.

### 2. Nouveau composant `src/components/auth/AuthDialog.tsx`

Structure (basée sur `Dialog` shadcn déjà présent) :

```text
┌───────────────────────────────────────────┐
│  [logo]  Connect to start trading      ✕ │
│                                           │
│  ─── Email ─────────────────────────────  │
│  [ email@domain.com        ] [Send code] │
│  (étape 2 → 6 inputs OTP via InputOTP)   │
│                                           │
│  ────────  or connect a wallet  ────────  │
│                                           │
│  [👻 Phantom]      Recommandé             │
│  [☀️ Solflare]     Recommandé             │
│  [🎒 Backpack]     DeFi                   │
│  [🌙 Glow]                                │
│  [🛡 Trust Wallet]                        │
│  [🔵 Coinbase]     Recommandé             │
│                                           │
│  100+ wallets compatibles Solana          │
└───────────────────────────────────────────┘
```

**Layout** :
- `DialogContent` overridé : `max-w-[640px] w-[92vw] md:w-[50vw]` (moitié écran desktop, responsive mobile).
- `DialogOverlay` overridé : `backdrop-blur-3xl bg-background/40` (blur ~100%).
- Padding généreux : `p-6 md:p-8`, `rounded-2xl`, bordure `border-primary/20`.

**Sections internes** (sous-composants dans le même fichier ou séparés selon taille) :
- `<EmailAuthStep />` — input email + état "code envoyé" + 6 inputs OTP (`InputOTP` shadcn).
- `<WalletList />` — liste des 6 wallets avec badge optionnel ("Recommandé"/"DeFi"), même design que les boutons existants (classes réutilisées de `WalletPanel` / TopBar : `bg-primary/10 border-primary/40`).

### 3. Hook `useAuthDialog`

Petit store local (`useState` exposé via context) :
- `open: boolean`
- `openDialog()`, `closeDialog()`

Placé dans `src/hooks/useAuthDialog.tsx` (Provider monté dans `App.tsx`).

### 4. Intégration TopBar

- Suppression des deux menus déroulants `showWalletMenu` (desktop + mobile) dans `TopBar.tsx`.
- Le bouton "Connect" / "Connect Wallet" appelle `openDialog()` au lieu de toggle le menu.
- `WalletPanel.tsx` : suppression de la branche `!connected` (bouton "Connect Wallet to Bet" remplacé par CTA qui ouvre le dialog).

### 5. Flow Email OTP

**Frontend** :
- Étape 1 : email → `supabase.functions.invoke('send-otp-email', { email })`.
- Étape 2 : 6 chiffres → `supabase.functions.invoke('verify-otp-email', { email, code })`.
- Sur succès : appel à `collect-marketing-contact` (déjà existant) avec `email` + `source: 'auth_dialog'` + `marketing_consent: true`. Toast de succès, fermeture du dialog.

**Backend (à créer)** :
- Migration : table `email_otps` (id, email, code_hash, expires_at, attempts, created_at) + RLS bloquant tout accès direct (service-role only).
- Edge function `send-otp-email` :
  - Génère code 6 chiffres random.
  - Hash bcrypt → upsert dans `email_otps` (TTL 10 min).
  - Envoi via **Lovable Emails** (transactional template `auth-otp-code`) — nécessite domaine email configuré.
- Edge function `verify-otp-email` :
  - Validation code (compare hash, vérifie TTL, max 5 tentatives).
  - Retourne `{ success: true }` (pas de session Supabase Auth puisqu'on est en mode "collecte seule").

### 6. Flow Wallet

- Click sur un wallet → appel `wallet.connect(type)` (extension du hook `useWallet` pour accepter les 6 types).
- Sur succès : appel `collect-marketing-contact` avec `wallet_address` + `source: 'wallet_connect'`.
- Fermeture du dialog.

Extension de `WalletType` :
```ts
export type WalletType = 'phantom' | 'solflare' | 'backpack' | 'glow' | 'trust' | 'coinbase';
```

### 7. Email domain (prérequis OTP)

Pour l'envoi d'emails OTP via Lovable Emails, un domaine d'envoi doit être configuré. Si non configuré au moment de l'implémentation, je proposerai le bouton de setup. **Sans domaine configuré**, l'envoi OTP ne fonctionnera pas — dans ce cas l'UI affichera un message "Email auth coming soon" et seule la connexion wallet sera active (fallback dégradé).

### Fichiers touchés

| Fichier | Action |
|---|---|
| `src/components/auth/AuthDialog.tsx` | **Nouveau** — popup principal |
| `src/components/auth/EmailAuthStep.tsx` | **Nouveau** — étape email + OTP |
| `src/components/auth/WalletList.tsx` | **Nouveau** — liste 6 wallets |
| `src/hooks/useAuthDialog.tsx` | **Nouveau** — context provider |
| `src/hooks/useWallet.ts` | Extension `WalletType` (6 wallets) |
| `src/components/TopBar.tsx` | Bouton Connect → ouvre dialog, suppression menus |
| `src/components/WalletPanel.tsx` | Suppression branche !connected |
| `src/App.tsx` | Wrap avec `AuthDialogProvider` + render `<AuthDialog />` global |
| `src/assets/wallets/*.png` | **Nouveaux** — 4 logos manquants (Backpack, Glow, Trust, Coinbase) |
| Migration SQL | **Nouvelle** — table `email_otps` + RLS service-role |
| `supabase/functions/send-otp-email/` | **Nouvelle** edge function |
| `supabase/functions/verify-otp-email/` | **Nouvelle** edge function |
| `supabase/functions/_shared/transactional-email-templates/auth-otp-code.tsx` | **Nouveau** template email |

### Ordre d'exécution

1. Téléchargement des 4 logos wallets manquants.
2. Création `useAuthDialog` + `AuthDialog` + sous-composants (UI seulement, mock OTP).
3. Intégration TopBar / suppression anciens menus.
4. Vérification statut domaine email → si OK : setup email infra + transactional + edge functions OTP. Sinon : proposer le setup.
5. Migration `email_otps` + branchement des edge functions.
6. Test end-to-end + collecte marketing.

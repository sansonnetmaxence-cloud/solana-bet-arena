/**
 * Exponential price distribution for the betting grid.
 * Returns a list of { offset, timeLabel } items where the offset grows
 * exponentially across each tier. Identical structure for every market.
 *
 *   Tier 1 — 10 cards · "30s"  · 0.10$ → 2.50$
 *   Tier 2 —  5 cards · "1min" · 2.50$ → 5.00$
 *   Tier 2 —  5 cards · "2min" · 2.50$ → 5.00$
 *   Tier 3 — 10 cards · "5min" · 5.10$ → 50.00$
 *
 * Mobile tiers use fewer cards but the same min/max ranges so price ranges
 * stay consistent across viewports.
 */

export interface PriceTierItem {
  offset: number;
  timeLabel: string;
}

interface TierConfig {
  count: number;
  min: number;
  max: number;
  label: string;
  /** curve steepness (k > 0 means "growth accelerates near max") */
  k: number;
}

const DESKTOP_TIERS: TierConfig[] = [
  { count: 10, min: 0.1, max: 2.5, label: '30s', k: 2.2 },
  { count: 5, min: 2.5, max: 5, label: '1min', k: 1.6 },
  { count: 5, min: 2.5, max: 5, label: '2min', k: 1.6 },
  { count: 10, min: 5.1, max: 50, label: '5min', k: 2.6 },
];

const MOBILE_TIERS: TierConfig[] = [
  { count: 5, min: 0.1, max: 2.5, label: '30s', k: 2.2 },
  { count: 3, min: 2.5, max: 5, label: '1min', k: 1.6 },
  { count: 3, min: 2.5, max: 5, label: '2min', k: 1.6 },
  { count: 5, min: 5.1, max: 50, label: '5min', k: 2.6 },
];

const expCurve = (t: number, k: number) =>
  (Math.exp(k * t) - 1) / (Math.exp(k) - 1);

const buildTier = ({ count, min, max, label, k }: TierConfig): PriceTierItem[] =>
  Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0 : i / (count - 1);
    const offset = min + (max - min) * expCurve(t, k);
    return { offset, timeLabel: label };
  });

export const buildPriceTiers = (isMobile = false): PriceTierItem[] => {
  const tiers = isMobile ? MOBILE_TIERS : DESKTOP_TIERS;
  return tiers.flatMap(buildTier);
};

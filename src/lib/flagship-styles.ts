// Flagship look = dark ink + gold. Normal courses stay light (paper). Reuse these classes, don't hardcode new ones.
export const FLAGSHIP_STYLES = {
  stripSection: "isolate",
  darkSection: "theme-ink bg-ink text-ivory",
  heroTitle: "font-display text-4xl font-bold leading-tight text-ivory sm:text-5xl",
  heroSubtitle: "text-base text-ivory/70 sm:text-lg",
  sectionTitle: "font-display text-2xl font-bold sm:text-3xl",
  darkCard:
    "flex h-full flex-col gap-4 rounded-2xl border border-gold-500/40 bg-charcoal p-6 text-ivory transition duration-300 motion-safe:hover:-translate-y-1 hover:border-gold-300 hover:shadow-[0_22px_46px_-30px_rgba(142,103,24,0.6)]",
  cardTitle: "font-display text-xl font-bold leading-snug text-ivory",
  cardTagline: "text-sm text-ivory/70",
  flagshipBadge:
    "inline-flex items-center gap-1 rounded-full border border-gold-300 bg-gold-100 px-2.5 py-0.5 text-xs font-semibold text-ink",
  offerPillDark: "inline-flex rounded-full border border-gold-300 px-2.5 py-0.5 text-xs font-semibold text-gold-100",
  offerPillLight:
    "inline-flex rounded-full border border-gold-300 bg-gold-100/30 px-2 py-0.5 text-xs font-semibold text-gold-700",
  priceDark: "font-display text-2xl font-bold text-ivory",
  mrpStruckDark: "text-sm text-ivory/50 line-through",
  saveDark: "text-xs font-semibold text-gold-100",
  saveLight: "text-xs font-semibold text-gold-700",
  outcomeItem: "flex gap-2 text-sm text-ivory/85",
  toolChip: "rounded-full border border-ivory/15 bg-ivory/5 px-3 py-1 text-xs text-ivory/80",
  countdown: "text-xs font-medium text-gold-100",
  lightCardFlagshipBorder: "border-gold-300",
} as const;

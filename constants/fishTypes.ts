// constants/fishTypes.ts
export const FISH_TYPES = [
  { label: 'Galunggong (Round Scad)', value: 'Galunggong' },
  { label: 'Bangus (Milkfish)', value: 'Bangus' },
  { label: 'Tilapia', value: 'Tilapia' },
  { label: 'Tulingan (Bullet Tuna)', value: 'Tulingan' },
  { label: 'Tuna (Yellow Fin)', value: 'Tuna' },
  { label: 'Lapu-lapu (Grouper)', value: 'Lapu-lapu' },
  { label: 'Hipon (Shrimp)', value: 'Hipon' },
  { label: 'Alimango (Crab)', value: 'Alimango' },
  { label: 'Pusit (Squid)', value: 'Pusit' },
  { label: 'Tanigue (Spanish Mackerel)', value: 'Tanigue' },
  { label: 'Tamban (Sardine)', value: 'Tamban' },
  { label: 'Maya-maya (Red Snapper)', value: 'Maya-maya' },
  { label: 'Dilis (Anchovy)', value: 'Dilis' },
  { label: 'Pampano (Pompano)', value: 'Pampano' },
  { label: 'Katambak (Crimson Snapper)', value: 'Katambak' },
  { label: 'Other', value: 'Other' },
];

export const FRESHNESS_OPTIONS = [
  { label: '🐟 Fresh catch this morning', value: 'Fresh catch this morning' },
  { label: '✅ Fresh catch today', value: 'Fresh catch today' },
  { label: '❄️ Frozen', value: 'Frozen' },
  { label: '🪣 Live seafood', value: 'Live seafood' },
  { label: '📦 Pre-ordered catch', value: 'Pre-ordered catch' },
];

export const FISH_EMOJIS: Record<string, string> = {
  Galunggong: '🐟',
  Bangus: '🐟',
  Tilapia: '🐠',
  Tulingan: '🐡',
  Tuna: '🎣',
  'Lapu-lapu': '🦈',
  Hipon: '🦐',
  Alimango: '🦀',
  Pusit: '🦑',
  Tanigue: '🐟',
  Tamban: '🐟',
  'Maya-maya': '🐠',
  Dilis: '🐟',
  Pampano: '🐠',
  Katambak: '🐠',
  Other: '🐟',
};

// Financial data extracted from Saga Seed Financial Model V2
// All figures in USD unless otherwise noted

export const RAISE_SCENARIOS = [
  { name: '$500K (Lean)', amount: 500000, preMoneyVal: 2000000, dilution: 0.20, teamY1: 4, teamY2: 6, custY1: 8, custY2: 18, arrY1: 1152000, arrY2: 2592000, breakeven: '12-14', runway: 15 },
  { name: '$1M (Base)', amount: 1000000, preMoneyVal: 4000000, dilution: 0.20, teamY1: 5, teamY2: 8, custY1: 15, custY2: 35, arrY1: 2160000, arrY2: 5040000, breakeven: '8-10', runway: 18 },
  { name: '$2M (Growth)', amount: 2000000, preMoneyVal: 8000000, dilution: 0.20, teamY1: 8, teamY2: 12, custY1: 25, custY2: 60, arrY1: 3600000, arrY2: 8640000, breakeven: '6-8', runway: 24, recommended: true },
  { name: '$4M (Scale)', amount: 4000000, preMoneyVal: 12000000, dilution: 0.25, teamY1: 12, teamY2: 18, custY1: 40, custY2: 100, arrY1: 5760000, arrY2: 14400000, breakeven: '5-6', runway: 24 },
];

// 24-month cashflow for $2M scenario
export const CASHFLOW_24M = {
  months: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24'],
  newCustomers: [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  totalCustomers: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 59],
  mrr: [12000, 36000, 60000, 84000, 108000, 132000, 156000, 180000, 204000, 228000, 252000, 276000, 312000, 348000, 384000, 420000, 456000, 492000, 528000, 564000, 600000, 636000, 672000, 708000],
  totalExpenses: [24700, 27300, 29900, 38000, 40600, 49700, 59000, 61600, 70700, 73300, 82400, 85000, 89000, 99300, 103100, 113400, 117200, 121000, 131500, 135300, 145600, 149200, 152800, 156400],
  netCashFlow: [-12700, 8700, 30100, 46000, 67400, 82300, 97000, 118400, 133300, 154700, 169600, 191000, 223000, 248700, 280900, 306600, 338800, 371000, 396500, 428700, 454400, 486800, 519200, 551600],
  cumulativeCash: [1987300, 1996000, 2026100, 2072100, 2139500, 2221800, 2318800, 2437200, 2570500, 2725200, 2894800, 3085800, 3308800, 3557500, 3838400, 4145000, 4483800, 4854800, 5251300, 5680000, 6134400, 6621200, 7140400, 7692000],
};

// Quarterly milestones
export const MILESTONES = [
  { quarter: 'Q1', team: 4, customers: 5, arr: 720000, milestone: 'First 5 paying customers', why: 'Proof of demand' },
  { quarter: 'Q2', team: 6, customers: 12, arr: 1700000, milestone: 'Product-market fit', why: 'Repeatable sales' },
  { quarter: 'Q3', team: 7, customers: 18, arr: 2600000, milestone: 'Compliance milestone', why: 'Expansion ready' },
  { quarter: 'Q4', team: 8, customers: 25, arr: 3600000, milestone: 'Series A conversations', why: 'Strong negotiation' },
  { quarter: 'Y2 Q1', team: 10, customers: 35, arr: 5000000, milestone: 'Series A close', why: 'Scale capital' },
  { quarter: 'Y2 Q2', team: 12, customers: 45, arr: 6500000, milestone: 'Enterprise pilot', why: 'Upmarket validation' },
  { quarter: 'Y2 Q3', team: 15, customers: 55, arr: 7900000, milestone: 'International expansion', why: 'Geographic scale' },
  { quarter: 'Y2 Q4', team: 18, customers: 60, arr: 8600000, milestone: 'Category leader', why: 'Winner-take-most' },
];

// Unit economics
export const UNIT_ECONOMICS = {
  acv: 144000,
  grossMargin: 0.90,
  cac: 12000,
  ltv: 518400,
  ltvCacRatio: 43,
  paybackMonths: 1,
  nrr: 1.10,
};

// Market size
export const MARKET_SIZE = {
  tam: 1073000000,
  sam: 429200000,
  somY3: 10730000,
  somY5: 32190000,
  segments: [
    { name: 'Hedge Funds', firms: 15000, addressable: 0.30, acv: 144000, size: 648000000 },
    { name: 'Family Offices', firms: 8000, addressable: 0.25, acv: 120000, size: 240000000 },
    { name: 'PE/VC Firms', firms: 5000, addressable: 0.20, acv: 100000, size: 100000000 },
    { name: 'Corporate Strategy', firms: 500, addressable: 0.40, acv: 200000, size: 40000000 },
    { name: 'Asset Managers', firms: 500, addressable: 0.50, acv: 180000, size: 45000000 },
  ],
};

// Comparable companies
export const COMPARABLES = [
  { company: 'Recorded Future', category: 'Threat Intel', valuation: '$2.7B', multiple: '~10x ARR' },
  { company: 'Palantir', category: 'Data Intelligence', valuation: '$180B+', multiple: '~25x ARR' },
  { company: 'Bloomberg', category: 'Financial Data', valuation: '$70B+', multiple: '~7x ARR' },
  { company: 'AlphaSense', category: 'Market Intel', valuation: '$4B+', multiple: '~20x ARR' },
  { company: 'Preqin', category: 'Alternative Data', valuation: '$3.5B', multiple: '~12x ARR' },
  { company: 'RavenPack', category: 'News Analytics', valuation: '$500M+', multiple: '~8x ARR' },
];

// Format helpers
export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

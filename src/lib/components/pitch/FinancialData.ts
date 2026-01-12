// AUTO-GENERATED from saga_budget.xlsx
// Run: python scripts/extract-financial-data.py
// All figures in SEK

export const RAISE_INFO = {
  amount: 35000000,
  preMoney: 140000000,
  postMoney: 175000000,
  dilution: 0.2,
  runway: 24,
};

export const CASHFLOW = {
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
  totalCustomers: [0, 0, 0, 0, 1, 2, 3, 5, 7, 9, 12, 15, 18, 22, 26, 30, 35, 40, 45, 51, 57, 63, 70, 77],
  teamSize: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 26, 27, 28, 29, 30, 30, 30],
  monthlyRevenue: [0, 0, 0, 0, 100000, 200000, 300000, 500000, 700000, 900000, 1200000, 1500000, 1800000, 2200000, 2600000, 3000000, 3500000, 4000000, 4500000, 5100000, 5700000, 6300000, 7000000, 7700000],
  arrRunRate: [0, 0, 0, 0, 1200000, 2400000, 3600000, 6000000, 8400000, 10800000, 14400000, 18000000, 21600000, 26400000, 31200000, 36000000, 42000000, 48000000, 54000000, 61200000, 68400000, 75600000, 84000000, 92400000],
  totalExpenses: [793320, 933900, 1074480, 1215060, 1379840, 1544620, 1709400, 1898380, 2087360, 2276340, 2489520, 2702700, 3056460, 3434420, 3812380, 4190340, 4592500, 4854080, 5115660, 5401440, 5687220, 5973000, 6142400, 6311800],
  netCashflow: [-793320, -933900, -1074480, -1215060, -1279840, -1344620, -1409400, -1398380, -1387360, -1376340, -1289520, -1202700, -1256460, -1234420, -1212380, -1190340, -1092500, -854080, -615660, -301440, 12780, 327000, 857600, 1388200],
  cashBalance: [34206680, 33272780, 32198300, 30983240, 29703400, 28358780, 26949380, 25551000, 24163640, 22787300, 21497780, 20295080, 19038620, 17804200, 16591820, 15401480, 14308980, 13454900, 12839240, 12537800, 12550580, 12877580, 13735180, 15123380],
};

export const MILESTONES = {
  y1Customers: 15,
  y1ARR: 18000000,
  y1Team: 15,
  y2Customers: 77,
  y2ARR: 92400000,
  y2Team: 30,
  breakeven: 21,
};

export function formatSEK(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return value.toFixed(0);
  }
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(value) + ' SEK';
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

// Legacy exports for compatibility
export const RAISE_SCENARIOS = [RAISE_INFO];
export const CASHFLOW_24M = CASHFLOW;
export function formatCurrency(value: number, compact = false): string {
  return formatSEK(value, compact);
}

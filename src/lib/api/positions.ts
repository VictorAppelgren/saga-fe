/**
 * Positions API Client
 *
 * Handles position tracking - entries, exits, and portfolio stats.
 */

// Detect server vs client for proper URL resolution
const isServer = typeof window === 'undefined';

// Server-side: Direct to API container | Client-side: Relative path through nginx
const API_BASE = isServer
  ? 'http://apis:8000/api'
  : (import.meta.env.VITE_API_BASE_URL || '/api');


// Types
export interface PositionEntry {
  timestamp: string;
  price: number;
  suggested_by_ai: boolean;
  ai_confidence: string | null;
  notes: string;
}

export interface PositionExit {
  timestamp: string;
  price: number;
  reason: string;  // "target_reached" | "stop_hit" | "manual" | "ai_suggested"
  notes: string;
}

export interface PositionPerformance {
  pnl_pips: number;
  pnl_percent: number;
  duration_days: number;
  outcome: 'win' | 'loss' | 'breakeven';
}

export interface Position {
  position_id: string;
  strategy_id: string;
  username: string;
  asset: string;
  direction: 'long' | 'short';
  stance_at_entry: string | null;
  status: 'open' | 'closed';
  entry: PositionEntry;
  exit: PositionExit | null;
  target_price: number | null;
  stop_loss: number | null;
  performance: PositionPerformance | null;
  entry_snapshot: Record<string, any>;
  exit_snapshot: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioStats {
  open_count: number;
  closed_count: number;
  total_pnl_percent: number;
  win_rate: number;
  signal_accuracy: number;
  wins: number;
  losses: number;
}

export interface ActiveSignal {
  strategy_id: string;
  asset: string;
  signal: {
    status: 'enter' | 'exit' | 'hold';
    confidence: 'high' | 'medium' | 'low' | null;
    reasoning: string | null;
    key_factors: string[];
    detected_at: string | null;
    market_price_at_detection: string | null;
  };
  current_status: string | null;
  stance: string | null;
}


// API Functions

/**
 * Get all positions for a user.
 */
export async function getPositions(
  username: string,
  status: 'open' | 'closed' | 'all' = 'all'
): Promise<{ positions: Position[]; count: number }> {
  const res = await fetch(`${API_BASE}/positions/${username}?status=${status}`);
  if (!res.ok) {
    throw new Error('Failed to load positions');
  }
  return res.json();
}

/**
 * Get portfolio statistics for a user.
 */
export async function getPortfolioStats(username: string): Promise<PortfolioStats> {
  const res = await fetch(`${API_BASE}/positions/${username}/stats`);
  if (!res.ok) {
    throw new Error('Failed to load portfolio stats');
  }
  return res.json();
}

/**
 * Get all active (actionable) signals for a user.
 */
export async function getActiveSignals(
  username: string
): Promise<{ active_signals: ActiveSignal[]; count: number }> {
  const res = await fetch(`${API_BASE}/users/${username}/active-signals`);
  if (!res.ok) {
    throw new Error('Failed to load active signals');
  }
  return res.json();
}

/**
 * Create a new position (enter a trade).
 */
export async function createPosition(
  username: string,
  data: {
    strategy_id: string;
    entry_price: number;
    direction: 'long' | 'short';
    target_price?: number | null;
    stop_loss?: number | null;
    notes?: string;
  }
): Promise<Position> {
  const res = await fetch(`${API_BASE}/positions/${username}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to create position');
  }
  return res.json();
}

/**
 * Close an existing position (exit a trade).
 */
export async function closePosition(
  username: string,
  positionId: string,
  data: {
    exit_price: number;
    exit_reason: 'target_reached' | 'stop_hit' | 'manual' | 'ai_suggested';
    notes?: string;
  }
): Promise<Position> {
  const res = await fetch(`${API_BASE}/positions/${username}/${positionId}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to close position');
  }
  return res.json();
}

/**
 * Get a single position with full details.
 */
export async function getPosition(
  username: string,
  positionId: string
): Promise<Position> {
  const res = await fetch(`${API_BASE}/positions/${username}/${positionId}`);
  if (!res.ok) {
    throw new Error('Failed to load position');
  }
  return res.json();
}

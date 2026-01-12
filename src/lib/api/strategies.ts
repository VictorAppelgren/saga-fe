// Detect server vs client for proper URL resolution
const isServer = typeof window === 'undefined';

// Server-side: Direct to API container | Client-side: Relative path through nginx
const API_BASE = isServer 
  ? 'http://apis:8000/api' 
  : (import.meta.env.VITE_API_BASE_URL || '/api');

// Stance type: directional view on the asset
export type Stance = 'bull' | 'bear' | 'neutral' | null;

// Position status: where in the position lifecycle
export type PositionStatus = 'monitoring' | 'looking_to_enter' | 'in_position' | null;

// Time horizon: swing trading to buy-and-hold (NO intraday)
export type TimeHorizon = 'weeks' | 'months' | 'quarters' | null;

export interface Strategy {
  id: string;
  asset: string;
  target: string;
  updated_at: string;
  has_analysis: boolean;
  is_default: boolean;
  stance: Stance;  // bull, bear, neutral, or null
  position_status: PositionStatus;  // monitoring, looking_to_enter, in_position
  time_horizon: TimeHorizon;  // weeks, months, quarters
}

// Latest analysis structure saved by backend (simplified for FE)
export interface StrategyLatestAnalysis {
  analyzed_at: string | null;
  risk_level?: string;
  opportunity_level?: string;
  // final_analysis is a bag of named sections (executive_summary, position_analysis, etc.)
  final_analysis?: Record<string, string>;
}

// Finding structure for risks and opportunities
export interface Finding {
  headline: string;
  rationale?: string;
  confidence?: string; // "high" | "medium" | "low"
  flow_path?: string;
  evidence?: string;
  added_at?: string;
}

export interface ExplorationFindings {
  risks: Finding[];
  opportunities: Finding[];
}

export interface StrategyDetail {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  is_default: boolean;
  stance: Stance;  // bull, bear, neutral, or null
  position_status: PositionStatus;  // monitoring, looking_to_enter, in_position
  time_horizon: TimeHorizon;  // weeks, months, quarters
  asset: {
    primary: string;
    related: string[];
  };
  user_input: {
    strategy_text: string;
    position_text: string;
    target: string;
  };
  // Deprecated older analysis shape (kept for backward compatibility)
  analysis?: {
    generated_at: string | null;
    executive_summary: string;
    fundamental: string;
    current: string;
    risks: string;
    drivers: string;
    supporting_evidence: string[];
    contradicting_evidence: string[];
  };
  // New analysis container used by the current pipeline
  latest_analysis?: StrategyLatestAnalysis;
  // Exploration findings (risks and opportunities)
  exploration_findings?: ExplorationFindings;
}

export interface CreateStrategyRequest {
  username: string;
  asset_primary: string;
  strategy_text: string;
  position_text: string;
  target: string;
}

export interface UpdateStrategyRequest {
  username: string;
  strategy_text?: string;
  position_text?: string;
  target?: string;
}

export async function listStrategies(username: string): Promise<Strategy[]> {
  const response = await fetch(`${API_BASE}/users/${username}/strategies`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch strategies');
  }
  const data = await response.json();
  return data.strategies || [];
}

export async function getStrategy(username: string, strategyId: string): Promise<StrategyDetail> {
  const response = await fetch(`${API_BASE}/users/${username}/strategies/${strategyId}`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch strategy');
  }
  return response.json();
}

export async function createStrategy(request: CreateStrategyRequest): Promise<StrategyDetail> {
  const { username, ...strategyData } = request;
  const response = await fetch(`${API_BASE}/users/${username}/strategies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      asset: { primary: strategyData.asset_primary },
      user_input: {
        strategy_text: strategyData.strategy_text,
        position_text: strategyData.position_text,
        target: strategyData.target
      }
    })
  });
  if (!response.ok) {
    throw new Error('Failed to create strategy');
  }
  return response.json();
}

export async function updateStrategy(
  strategyId: string,
  request: UpdateStrategyRequest
): Promise<StrategyDetail> {
  const { username, ...updates } = request;
  const response = await fetch(`${API_BASE}/users/${username}/strategies/${strategyId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updates)
  });
  if (!response.ok) {
    throw new Error('Failed to update strategy');
  }
  return response.json();
}

export async function deleteStrategy(username: string, strategyId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/users/${username}/strategies/${strategyId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to delete strategy');
  }
}

// Response from the improve strategy text API
export interface ImproveStrategyTextResponse {
  improved_text: string;
  changes_summary: string;
}

/**
 * Improve the user's strategy thesis text using AI.
 *
 * This embodies Saga's philosophy: AI AMPLIFIES human judgment, doesn't replace it.
 * The improved text preserves the user's voice and core ideas while enhancing
 * clarity, structure, and market context.
 */
export async function improveStrategyText(
  username: string,
  strategyId: string,
  currentText: string,
  asset: string,
  positionText?: string
): Promise<ImproveStrategyTextResponse> {
  const response = await fetch(
    `${API_BASE}/users/${username}/strategies/${strategyId}/improve-text`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        current_text: currentText,
        asset: asset,
        position_text: positionText || null
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to improve strategy text: ${errorText}`);
  }

  return response.json();
}

/**
 * Update strategy stance (directional view).
 *
 * Stance values:
 * - "bull": User believes asset will go UP
 * - "bear": User believes asset will go DOWN
 * - "neutral": Monitoring/no view
 * - null: Not set (treated as neutral)
 *
 * Note: Changing stance triggers re-analysis.
 */
export async function updateStance(
  username: string,
  strategyId: string,
  stance: Stance
): Promise<{ success: boolean; stance: Stance; message: string }> {
  const response = await fetch(
    `${API_BASE}/users/${username}/strategies/${strategyId}/stance`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ stance })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update stance: ${errorText}`);
  }

  return response.json();
}

/**
 * Update strategy position status and time horizon.
 *
 * Position Status reflects where you are in the investment lifecycle:
 * - "monitoring": Watching the asset, gathering intel, no active thesis
 * - "looking_to_enter": Have a thesis, seeking confirmation to pull the trigger
 * - "in_position": Currently holding, monitoring for thesis invalidation
 *
 * Time Horizon (swing trading to buy-and-hold, NO INTRADAY):
 * - "weeks": 1-4 weeks
 * - "months": 1-6 months
 * - "quarters": 6+ months / multi-quarter
 */
export async function updatePositionStatus(
  username: string,
  strategyId: string,
  positionStatus: PositionStatus,
  timeHorizon?: TimeHorizon
): Promise<{ success: boolean; position_status: PositionStatus; time_horizon: TimeHorizon; message: string }> {
  const response = await fetch(
    `${API_BASE}/users/${username}/strategies/${strategyId}/position-status`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        position_status: positionStatus,
        time_horizon: timeHorizon
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update position status: ${errorText}`);
  }

  return response.json();
}

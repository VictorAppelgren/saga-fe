// Detect server vs client for proper URL resolution
const isServer = typeof window === 'undefined';

// Server-side: Direct to API container | Client-side: Relative path through nginx
const API_BASE = isServer 
  ? 'http://apis:8000/api' 
  : (import.meta.env.VITE_API_BASE_URL || '/api');

export interface Strategy {
  id: string;
  asset: string;
  target: string;
  updated_at: string;
  has_analysis: boolean;
  is_default: boolean;
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

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface Strategy {
  id: string;
  asset: string;
  target: string;
  updated_at: string;
  has_analysis: boolean;
  is_default: boolean;
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
  analysis: {
    generated_at: string | null;
    executive_summary: string;
    fundamental: string;
    current: string;
    risks: string;
    drivers: string;
    supporting_evidence: string[];
    contradicting_evidence: string[];
  };
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

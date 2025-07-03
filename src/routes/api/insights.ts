// src/lib/api/insights.ts

import { api } from "./client";

export type Insight = {
  id: string;
  title: string;
  summary: string;
  published_at: string;  // ISO date string
  asset_id?: string;
  domain?: string;
  keywords?: string[];
  content?: string;      // Full insight content if fetched by ID
  // Add other fields your API returns
};

export type InsightsQueryParams = {
  asset_id?: string;
  domain?: string;
  keyword?: string;
  limit?: number;
};

/**
 * Lists insights filtered by optional query params.
 * @param params - Optional filters (asset_id, domain, keyword, limit)
 */
export async function getInsights(params: InsightsQueryParams = {}): Promise<Insight[]> {
  const query = new URLSearchParams();

  if (params.asset_id) query.append('asset_id', params.asset_id);
  if (params.domain) query.append('domain', params.domain);
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.limit) query.append('limit', params.limit.toString());

  const queryString = query.toString();
  const path = queryString ? `/insights?${queryString}` : '/insights';

  return api<Insight[]>(path);
}

/**
 * Returns a specific insight by ID.
 * @param insightId - The ID of the insight
 */
export async function getInsight(insightId: string): Promise<Insight> {
  return api<Insight>(`/insights/${insightId}`);
}
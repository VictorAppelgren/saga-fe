// src/lib/api/strategy.ts

import { api } from "$lib/api/client";

export type Strategy = {
  content: string;               // Markdown content of the strategy
  research_domains: string[];    // Linked research domains
};

/**
 * Fetches the strategy markdown and research domains for the given asset.
 * @param assetId - The ID of the asset
 */
export async function getStrategy(assetId: string): Promise<Strategy> {
  return api<Strategy>(`/strategy/${assetId}`);
}

/**
 * Updates the strategy markdown and research domains for the given asset.
 * @param assetId - The ID of the asset
 * @param strategy - Object containing content and research_domains
 */
export async function updateStrategy(assetId: string, strategy: Strategy): Promise<Strategy> {
  return api<Strategy>(`/strategy/${assetId}`, {
    method: 'PUT',
    body: JSON.stringify(strategy),
  });
}
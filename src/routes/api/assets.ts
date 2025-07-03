// src/lib/api/assets.ts

import { api } from "./client";

export type Asset = {
  id: string;
  name: string;
  symbol: string;
  hasStrategy: boolean;
  hasReport: boolean;
  // Add any other fields returned by your API
};

/**
 * Fetches all assets in the universe with strategy/report availability.
 */
export async function getAssets(): Promise<Asset[]> {
  return api<Asset[]>('/assets');
}
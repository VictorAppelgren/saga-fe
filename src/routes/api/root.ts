// src/lib/api/root.ts

import { api } from "./client";

export type ApiStatus = {
  status: string;      // e.g., "ok"
  service_name: string;
  // add other fields if returned
};

/**
 * Fetches API status and service info from the root endpoint.
 */
export async function getApiStatus(): Promise<ApiStatus> {
  return api<ApiStatus>('/');
}
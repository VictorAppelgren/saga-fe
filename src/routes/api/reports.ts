// src/lib/api/reports.ts

import { api } from "$lib/api/client";

export type ReportSummary = {
  id: string;
  asset_id: string;
  title: string;
  published_at: string;  // ISO date string
  // other summary fields if any
};

export type ReportFormat = 'markdown' | 'html';

/**
 * Lists reports for an asset, newest first.
 * @param assetId - The asset ID to filter reports by
 * @param limit - Number of reports to fetch
 */
export async function getReports(assetId: string, limit?: number): Promise<ReportSummary[]> {
  const query = new URLSearchParams();
  query.append('asset_id', assetId);
  if (limit !== undefined) query.append('limit', limit.toString());

  const queryString = query.toString();
  return api<ReportSummary[]>(`/reports?${queryString}`);
}

/**
 * Returns the latest report for an asset in specified format.
 * @param assetId - The asset ID
 * @param format - 'markdown' or 'html'
 */
export async function getLatestReport(
  assetId: string,
  format: ReportFormat = 'markdown'
): Promise<string> {
  const query = new URLSearchParams({ format });
  const res = await fetch(`${process.env.API_BASE_URL}/reports/latest/${assetId}?${query.toString()}`);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch latest report: ${res.status} ${errorText}`);
  }
  return res.text(); // Return raw markdown or html string
}

/**
 * Returns a specific report by report ID in specified format.
 * @param reportId - The report ID
 * @param format - 'markdown' or 'html'
 */
export async function getReport(
  reportId: string,
  format: ReportFormat = 'markdown'
): Promise<string> {
  const query = new URLSearchParams({ format });
  const res = await fetch(`${process.env.API_BASE_URL}/reports/${reportId}?${query.toString()}`);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch report: ${res.status} ${errorText}`);
  }
  return res.text();
}
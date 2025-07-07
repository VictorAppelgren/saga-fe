// src/lib/api/articles.ts

import { api } from "$lib/api/client";

export type Article = {
  id: string;
  title: string;
  summary: string;
  published_at: string;  // ISO date string
  source: string;        // e.g., "Factiva", "Perigon"
  asset_id?: string;
  domain?: string;
  keywords?: string[];
  content?: string;      // May be included for full article fetch
  // Add other fields your API returns
};

export type ArticlesQueryParams = {
  asset_id?: string;
  domain?: string;
  keyword?: string;
  limit?: number;
};

/**
 * Lists news articles filtered by optional query params.
 * @param params - Optional filters (asset_id, domain, keyword, limit)
 */
export async function getArticles(params: ArticlesQueryParams = {}): Promise<Article[]> {
  // Build query string from params
  const query = new URLSearchParams();

  if (params.asset_id) query.append('asset_id', params.asset_id);
  if (params.domain) query.append('domain', params.domain);
  if (params.keyword) query.append('keyword', params.keyword);
  if (params.limit) query.append('limit', params.limit.toString());

  const queryString = query.toString();
  const path = queryString ? `/articles?${queryString}` : '/articles';

  return api<Article[]>(path);
}

/**
 * Returns a specific news article by ID.
 * @param articleId - The ID of the article
 */
export async function getArticle(articleId: string): Promise<Article> {
  return api<Article>(`/articles/${articleId}`);
}
// src/lib/api/articles.ts

import { api } from "$lib/api/client";

export type Article = {
  id: string;
  title: string;
  summary: string;
  url?: string;
  published_date?: string;
};

export async function getArticles(topic_id: string, limit: number = 10): Promise<Article[]> {
  const response = await api<{articles: Article[]}>(`/articles?topic_id=${topic_id}&limit=${limit}`);
  return response.articles;
}

export async function getArticle(articleId: string): Promise<Article> {
  return api<Article>(`/articles/${articleId}`);
}
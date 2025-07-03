const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-api-base-url.com';

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error: ${res.status} ${errorText}`);
  }

  return res.json() as Promise<T>;
}
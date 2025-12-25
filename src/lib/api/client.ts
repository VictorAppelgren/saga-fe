// Universal API fetch helper for Argos FE
// Usage: api<T>(path: string, options?: RequestInit)

// Detect server vs client for proper URL resolution
const isServer = typeof window === 'undefined';

// Server-side: Direct to API container | Client-side: Relative path through nginx
const API_BASE = isServer 
  ? 'http://apis:8000/api' 
  : (import.meta.env.VITE_API_BASE_URL || '/api');

const API_KEY = isServer
  ? '785fc6c1647ff650b6b611509cc0a8f47009e6b743340503519d433f111fcf12'
  : (import.meta.env.VITE_API_KEY || '');

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
});

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: getHeaders(),
    ...options
  });
  if (!res.ok) {
    let errText;
    try {
      errText = await res.text();
    } catch {
      errText = res.statusText;
    }
    throw new Error(`API error ${res.status}: ${errText}`);
  }
  // Try to parse as JSON, fallback to text
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  } else {
    // @ts-ignore
    return res.text();
  }
}

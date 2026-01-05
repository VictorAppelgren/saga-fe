// Universal API fetch helper for Saga FE
// Usage: api<T>(path, options) for browser
// Usage: apiWithCookies<T>(path, cookies, options) for SSR

// Detect server vs client
const isServer = typeof window === 'undefined';

// Server-side: Direct to API container | Client-side: Relative through nginx
const API_BASE = isServer
  ? 'http://apis:8000/api'
  : (import.meta.env.VITE_API_BASE_URL || '/api');

/**
 * API fetch for BROWSER requests.
 * Uses session cookies automatically (credentials: 'include').
 * NO API keys - authentication via cookies only.
 */
export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
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

/**
 * API fetch for SSR (server-side rendering).
 * Forwards the user's session cookie from the incoming request.
 * NO API keys in frontend code - only cookies.
 *
 * @param path - API endpoint path
 * @param cookies - Cookie header string from incoming request (event.request.headers.get('cookie'))
 * @param options - Fetch options
 */
export async function apiWithCookies<T>(
  path: string,
  cookies: string | null,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>
  };

  // Forward the user's cookies for authentication
  if (cookies) {
    headers['Cookie'] = cookies;
  }

  const res = await fetch(url, {
    ...options,
    headers
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

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  } else {
    // @ts-ignore
    return res.text();
  }
}

// src/lib/auth.ts
// Authentication helper - login endpoint is PUBLIC (no auth required)

// Detect server vs client
const isServer = typeof window === 'undefined';

// Server-side: Direct to API container | Client-side: Relative through nginx
const API_BASE = isServer ? 'http://apis:8000/api' : '/api';

export interface LoginResponse {
  username: string;
  accessible_topics: string[];
  is_admin: boolean;
}

export interface AuthResult {
  user: LoginResponse;
  sessionToken: string | null;
}

export async function authenticate(username: string, password: string): Promise<AuthResult | null> {
  try {
    // Login endpoint is public - no API key or cookies required
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const user = await response.json();

      // Extract session_token from Set-Cookie header (server-side only)
      let sessionToken: string | null = null;
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        const match = setCookie.match(/session_token=([^;]+)/);
        if (match) {
          sessionToken = match[1];
        }
      }

      return { user, sessionToken };
    }
    return null;
  } catch (error) {
    return null;
  }
}

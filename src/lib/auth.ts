// src/lib/auth.ts

// Detect if running server-side (SvelteKit server actions) or client-side (browser)
const isServer = typeof window === 'undefined';

// Server-side: Use direct API container URL (bypasses nginx for internal calls)
// Client-side: Use relative URL (browser goes through NGINX on port 80)
const API_BASE = isServer 
  ? 'http://apis:8000/api'  // Direct to API container in Docker network
  : '/api';                  // Relative path for browser

// Server-side uses process.env, client-side uses import.meta.env
const API_KEY = isServer
  ? (process.env.VITE_API_KEY || '785fc6c1647ff650b6b611509cc0a8f47009e6b743340503519d433f111fcf12')
  : (import.meta.env.VITE_API_KEY || '');

export interface LoginResponse {
  username: string;
  accessible_topics: string[];
  is_admin: boolean;
}

export async function authenticate(username: string, password: string): Promise<LoginResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({ username, password })
    });
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    return null;
  }
}

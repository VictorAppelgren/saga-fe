// src/lib/auth.ts
// Authentication helper - login endpoint is PUBLIC (no auth required)

// Use relative URL - login goes through nginx which doesn't require auth for /api/login
const API_BASE = '/api';

export interface LoginResponse {
  username: string;
  accessible_topics: string[];
  is_admin: boolean;
}

export async function authenticate(username: string, password: string): Promise<LoginResponse | null> {
  try {
    // Login endpoint is public - no API key or cookies required
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      credentials: 'include', // To receive the session cookie
      headers: {
        'Content-Type': 'application/json'
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

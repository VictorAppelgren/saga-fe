// src/lib/auth.ts
const API_BASE = 'http://localhost:8000';

export interface LoginResponse {
  username: string;
  accessible_topics: string[];
}

export async function authenticate(username: string, password: string): Promise<LoginResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

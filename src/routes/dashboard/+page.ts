import type { PageLoad } from './$types';

const API_BASE = '/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export const load: PageLoad = async ({ fetch, data }) => {
  // data comes from +page.server.ts
  if (data.user && data.user.username) {
    try {
      const headers = {
        'X-API-Key': API_KEY
      };
      
      // Fetch both interests and strategies in parallel
      const [interestsRes, strategiesRes] = await Promise.all([
        fetch(`${API_BASE}/interests?username=${data.user.username}`, { headers }),
        fetch(`${API_BASE}/strategies?username=${data.user.username}`, { headers })
      ]);
      
      const interests = interestsRes.ok ? (await interestsRes.json()).interests || [] : [];
      const strategies = strategiesRes.ok ? (await strategiesRes.json()).strategies || [] : [];
      
      return { 
        interests,
        strategies,
        user: data.user 
      };
    } catch (e) {
      console.error('Error loading data:', e);
    }
  }
  
  return { 
    interests: [],
    strategies: [],
    user: data.user || null
  };
};

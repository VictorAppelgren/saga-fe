import type { PageLoad } from './$types';

const API_BASE = '/api';

export const load: PageLoad = async ({ fetch, data }) => {
  // data comes from +page.server.ts
  // SvelteKit's fetch automatically forwards cookies - NO API keys needed
  if (data.user && data.user.username) {
    try {
      // Fetch both interests and strategies in parallel
      // cookies are forwarded automatically by SvelteKit's fetch
      const [interestsRes, strategiesRes] = await Promise.all([
        fetch(`${API_BASE}/interests?username=${data.user.username}`),
        fetch(`${API_BASE}/users/${data.user.username}/strategies`)
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

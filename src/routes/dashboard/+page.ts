import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, data }) => {
  // data comes from +page.server.ts
  if (data.user && data.user.username) {
    try {
      const res = await fetch(`http://localhost:8000/interests?username=${data.user.username}`);
      if (res.ok) {
        const apiData = await res.json();
        return { 
          interests: apiData.interests || [],
          user: data.user 
        };
      }
    } catch (e) {
      console.error('Error loading interests:', e);
    }
  }
  
  return { 
    interests: [],
    user: data.user || null
  };
};

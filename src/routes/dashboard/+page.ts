import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  let assets = [];
  try {
    const res = await fetch('http://0.0.0.0:8000/assets');
    if (res.ok) {
      const data = await res.json();
      assets = data.assets || [];
    }
  } catch (e) {
    // Optionally log error
  }
  return {
    user: 'John Doe',
    assets
  };
};

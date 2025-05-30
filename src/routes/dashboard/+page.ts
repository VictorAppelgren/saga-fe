import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  return {
    user: 'John Doe' // Mock user data
  };
};

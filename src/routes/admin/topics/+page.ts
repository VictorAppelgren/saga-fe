import { redirect } from '@sveltejs/kit';

export async function load({ parent }: any) {
  const data = await parent();
  
  // Check if user is admin
  if (!data.user?.is_admin) {
    throw redirect(302, '/dashboard');
  }
  
  return {};
}

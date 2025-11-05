import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';

export async function load({ parent }: any) {
  const data = await parent();
  
  console.log('Admin page load - user:', data.user);
  console.log('Admin page load - is_admin:', data.user?.is_admin);
  
  // Check if user is admin
  if (!data.user?.is_admin) {
    console.log('Redirecting - not admin');
    throw redirect(302, '/dashboard');
  }
  
  return {};
}

/**
 * Client-side admin page load.
 * Server-side validation happens in +layout.server.ts (validates with backend).
 * This is kept as a fallback for client-side navigation.
 */
export async function load({ parent }: any) {
  // User data comes from +layout.server.ts which validates with backend
  const data = await parent();
  return { user: data.user };
}

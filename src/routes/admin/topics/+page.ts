/**
 * Admin topics page load.
 * Server-side validation happens in parent +layout.server.ts.
 */
export async function load({ parent }: any) {
  const data = await parent();
  return { user: data.user };
}

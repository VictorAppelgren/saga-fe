// Pass through server data (user from +layout.server.ts)
export async function load({ data }: any) {
  return {
    ...data,
    interests: []
  };
}

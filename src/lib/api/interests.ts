import { api } from "$lib/api/client";

export type Interest = {
  id: string;
  name: string;
};

export async function getInterests(username: string): Promise<Interest[]> {
  const response = await api<{interests: Interest[]}>(`/interests?username=${username}`);
  return response.interests;
}

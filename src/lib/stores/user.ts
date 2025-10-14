import { writable } from 'svelte/store';

export interface User {
  username: string;
  accessible_topics: string[];
}

export const user = writable<User | null>(null);

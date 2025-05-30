// src/lib/auth.ts
export const USERS: Record<string, string> = {
	admin: 'password123',
	"william": "123",
};

export function authenticate(username: string, password: string): boolean {
	return USERS[username] === password;
}

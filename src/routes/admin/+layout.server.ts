import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { apiWithCookies } from '$lib/api/client';

interface UserInfo {
	username: string;
	is_admin: boolean;
}

/**
 * Server-side admin validation.
 * Validates session with backend AND checks is_admin flag.
 * This prevents cookie manipulation attacks.
 */
export const load: LayoutServerLoad = async ({ request }) => {
	const cookies = request.headers.get('cookie');

	if (!cookies) {
		throw redirect(302, '/login');
	}

	try {
		// Validate session AND get user info from backend (not cookie!)
		const user = await apiWithCookies<UserInfo>('/me', cookies);

		// Server-side admin check - can't be faked
		if (!user.is_admin) {
			throw error(403, 'Admin access required');
		}

		return { user };
	} catch (err: any) {
		// Handle API errors
		if (err.status === 403) {
			throw err; // Re-throw 403 errors
		}
		// Session invalid or expired
		throw redirect(302, '/login');
	}
};

import { fail, redirect } from '@sveltejs/kit';
import { authenticate } from '$lib/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username')?.toString() || '';
		const password = formData.get('password')?.toString() || '';

		const authResult = await authenticate(username, password);
		if (!authResult) {
			return fail(400, { error: 'Invalid credentials' });
		}

		// Forward session_token cookie from backend to browser
		// (SvelteKit server received it, now pass it to the client)
		if (authResult.sessionToken) {
			cookies.set('session_token', authResult.sessionToken, {
				path: '/',
				httpOnly: true,
				secure: false,
				maxAge: 60 * 60 * 24, // 24 hours
				sameSite: 'lax'
			});
		}

		// Also store user data for frontend access
		cookies.set('user', JSON.stringify(authResult.user), {
			path: '/',
			httpOnly: true,
			secure: false,
			maxAge: 60 * 60 * 24
		});

		throw redirect(302, '/dashboard');
	}
};

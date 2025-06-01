import { fail, redirect } from '@sveltejs/kit';
import { authenticate } from '$lib/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username')?.toString() || '';
		const password = formData.get('password')?.toString() || '';

		if (!authenticate(username, password)) {
			return fail(400, { error: 'Invalid credentials' });
		}

		// Store session in cookie (simplified for demo)
		cookies.set('session', username, {
			path: '/',
			httpOnly: true,
			secure: false, // CHANGE IN PRODUCTION
			maxAge: 60 * 60 // 1 hour
		});

		throw redirect(302, '/dashboard');
	}
};

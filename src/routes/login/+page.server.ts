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

		// Store user data in cookie
		cookies.set('user', JSON.stringify(authResult), {
			path: '/',
			httpOnly: true,
			secure: false,
			maxAge: 60 * 60 * 8 // 8 hours
		});

		throw redirect(302, '/dashboard');
	}
};

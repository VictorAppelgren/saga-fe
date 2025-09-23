import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const userCookie = cookies.get('user');
	
	if (!userCookie) {
		throw redirect(302, '/login');
	}

	try {
		const user = JSON.parse(userCookie);
		return { user };
	} catch {
		throw redirect(302, '/login');
	}
};

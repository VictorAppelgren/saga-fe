import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const session = event.cookies.get('session');
	event.locals.user = session ?? null;

	return resolve(event);
};

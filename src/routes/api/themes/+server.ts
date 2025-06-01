import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getThemes, createTheme } from '$lib/server/storage';

export const GET: RequestHandler = async ({ cookies }) => {
    const userId = cookies.get('session');
    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    const themes = await getThemes(userId);
    return json(themes);
};

export const POST: RequestHandler = async ({ request, cookies }) => {
    const userId = cookies.get('session');
    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    const themeData = await request.json();
    const theme = await createTheme(userId, themeData);
    return json(theme);
};

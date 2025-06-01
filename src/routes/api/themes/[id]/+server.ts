import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateTheme, deleteTheme } from '$lib/server/storage';

export const PATCH: RequestHandler = async ({ params, request, cookies }) => {
    const userId = cookies.get('session');
    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    const updates = await request.json();
    const theme = await updateTheme(userId, params.id, updates);
    return json(theme);
};

export const DELETE: RequestHandler = async ({ params, cookies }) => {
    const userId = cookies.get('session');
    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    await deleteTheme(userId, params.id);
    return new Response(null, { status: 204 });
};

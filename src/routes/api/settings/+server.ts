import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSettings, updateSettings } from '$lib/server/storage';

export const GET: RequestHandler = async ({ cookies }) => {
    const userId = cookies.get('session');
    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    const settings = await getSettings(userId);
    return json(settings);
};

export const PATCH: RequestHandler = async ({ request, cookies }) => {
    const userId = cookies.get('session');
    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    const updates = await request.json();
    const settings = await updateSettings(userId, updates);
    return json(settings);
};

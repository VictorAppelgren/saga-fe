import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { readStorage, writeStorage } from '$lib/server/storage';
import type { HistoryEntry, Storage } from '$lib/types/storage';

export async function GET({ cookies }: RequestEvent) {
    const userId = cookies.get('session') || 'william';
    const storage = await readStorage();
    
    // Initialize history array if it doesn't exist
    if (!storage[userId]?.history) {
        if (!storage[userId]) {
            storage[userId] = {
                themes: [],
                settings: {
                    theme: 'light',
                    defaultView: 'history'
                },
                history: []
            };
        } else {
            storage[userId].history = [];
        }
        await writeStorage(storage);
    }

    return json({ entries: storage[userId].history || [] });
}

export async function POST({ request, cookies }: RequestEvent) {
    const userId = cookies.get('session') || 'william';
    const entry = await request.json() as Omit<HistoryEntry, 'timestamp'>;
    const storage = await readStorage();

    // Initialize history array if it doesn't exist
    if (!storage[userId]?.history) {
        if (!storage[userId]) {
            storage[userId] = {
                themes: [],
                settings: {
                    theme: 'light',
                    defaultView: 'history'
                },
                history: []
            };
        } else {
            storage[userId].history = [];
        }
    }

    const newEntry: HistoryEntry = {
        ...entry,
        timestamp: new Date().toISOString()
    };

    storage[userId].history = [newEntry, ...(storage[userId].history || [])];
    await writeStorage(storage);

    return json(newEntry);
}

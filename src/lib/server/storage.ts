import { promises as fs } from 'fs';
import path from 'path';
import type { Storage, Theme, UserSettings } from '$lib/types/storage';

const DB_FILE = path.join(process.cwd(), 'db.json');

// Read storage
export async function readStorage(): Promise<Storage> {
    try {
        const data = await fs.readFile(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty storage
        await writeStorage({});
        return {};
    }
}

// Write storage
export async function writeStorage(storage: Storage): Promise<void> {
    await fs.writeFile(DB_FILE, JSON.stringify(storage, null, 2));
}

// Initialize user if not exists
async function initializeUser(userId: string): Promise<void> {
    const storage = await readStorage();
    if (!storage[userId]) {
        storage[userId] = {
            themes: [],
            settings: {
                theme: 'light',
                defaultView: 'history'
            }
        };
        await writeStorage(storage);
    }
}

// Theme operations
export async function getThemes(userId: string): Promise<Theme[]> {
    await initializeUser(userId);
    const storage = await readStorage();
    return storage[userId].themes;
}

export async function createTheme(userId: string, theme: Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>): Promise<Theme> {
    const storage = await readStorage();
    const newTheme: Theme = {
        ...theme,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    storage[userId].themes.push(newTheme);
    await writeStorage(storage);
    return newTheme;
}

export async function updateTheme(userId: string, themeId: string, updates: Partial<Theme>): Promise<Theme> {
    const storage = await readStorage();
    const themeIndex = storage[userId].themes.findIndex(t => t.id === themeId);
    
    if (themeIndex === -1) {
        throw new Error('Theme not found');
    }

    const updatedTheme = {
        ...storage[userId].themes[themeIndex],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    storage[userId].themes[themeIndex] = updatedTheme;
    await writeStorage(storage);
    return updatedTheme;
}

export async function deleteTheme(userId: string, themeId: string): Promise<void> {
    const storage = await readStorage();
    storage[userId].themes = storage[userId].themes.filter(t => t.id !== themeId);
    await writeStorage(storage);
}

// Settings operations
export async function getSettings(userId: string): Promise<UserSettings> {
    await initializeUser(userId);
    const storage = await readStorage();
    return storage[userId].settings;
}

export async function updateSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    const storage = await readStorage();
    storage[userId].settings = {
        ...storage[userId].settings,
        ...settings
    };
    await writeStorage(storage);
    return storage[userId].settings;
}

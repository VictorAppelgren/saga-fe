import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import crypto from 'crypto';

// Password for investor access - in production, use env variable
const PITCH_PASSWORD = 'xK7m9Np2Qr4s';

// Simple token generation - valid for 24 hours
function generatePitchToken(): string {
	const timestamp = Date.now();
	const random = crypto.randomBytes(16).toString('hex');
	return Buffer.from(`${timestamp}:${random}`).toString('base64');
}

function isValidPitchToken(token: string | undefined): boolean {
	if (!token) return false;
	try {
		const decoded = Buffer.from(token, 'base64').toString('utf-8');
		const [timestamp] = decoded.split(':');
		const tokenTime = parseInt(timestamp, 10);
		const now = Date.now();
		// Token valid for 24 hours
		return now - tokenTime < 24 * 60 * 60 * 1000;
	} catch {
		return false;
	}
}

export const load: PageServerLoad = async ({ cookies }) => {
	const pitchToken = cookies.get('pitch_token');
	return {
		unlocked: isValidPitchToken(pitchToken)
	};
};

export const actions: Actions = {
	verify: async ({ request, cookies }) => {
		const formData = await request.formData();
		const password = formData.get('password')?.toString() || '';

		if (password !== PITCH_PASSWORD) {
			return fail(400, { error: 'Incorrect password' });
		}

		// Set pitch token cookie
		const token = generatePitchToken();
		cookies.set('pitch_token', token, {
			path: '/',
			httpOnly: true,
			secure: false, // Set to true in production with HTTPS
			maxAge: 60 * 60 * 24, // 24 hours
			sameSite: 'lax'
		});

		return { success: true };
	}
};

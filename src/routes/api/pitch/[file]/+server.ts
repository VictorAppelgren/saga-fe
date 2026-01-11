import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Allowed files - whitelist approach for security
const ALLOWED_FILES: Record<string, { path: string; contentType: string }> = {
	'saga_pitch_deck.pdf': {
		path: 'pitch-files/saga_pitch_deck.pdf',
		contentType: 'application/pdf'
	},
	'saga_budget.xlsx': {
		path: 'pitch-files/saga_budget.xlsx',
		contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	}
};

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

export const GET: RequestHandler = async ({ params, cookies }) => {
	const { file } = params;

	// Check pitch token
	const pitchToken = cookies.get('pitch_token');
	if (!isValidPitchToken(pitchToken)) {
		throw error(401, 'Unauthorized - please enter the access code first');
	}

	// Check if file is allowed
	const fileConfig = ALLOWED_FILES[file];
	if (!fileConfig) {
		throw error(404, 'File not found');
	}

	// Resolve file path - files stored outside static directory
	const filePath = join(process.cwd(), fileConfig.path);

	if (!existsSync(filePath)) {
		console.error(`Pitch file not found: ${filePath}`);
		throw error(404, 'File not found');
	}

	try {
		const fileBuffer = readFileSync(filePath);

		return new Response(fileBuffer, {
			headers: {
				'Content-Type': fileConfig.contentType,
				'Content-Disposition': `inline; filename="${file}"`,
				'Cache-Control': 'private, no-cache'
			}
		});
	} catch (err) {
		console.error(`Error reading pitch file: ${err}`);
		throw error(500, 'Error reading file');
	}
};

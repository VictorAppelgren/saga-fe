import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	
	// Performance optimizations
	server: {
		fs: {
			// Only allow serving files from the project root
			strict: true
		},
		watch: {
			// Ignore node_modules and .git to reduce file watching overhead
			ignored: ['**/node_modules/**', '**/.git/**']
		}
	},
	
	optimizeDeps: {
		// Pre-bundle these dependencies for faster cold starts
		include: ['svelte', 'svelte/store']
	},
	
	build: {
		// Faster builds
		target: 'esnext',
		minify: 'esbuild'
	}
});

import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	
	// Performance optimizations
	server: {
		host: true,  // Listen on all network interfaces
		hmr: {
			// Use client port for HMR (fixes WebSocket in production)
			clientPort: 80
		},
		fs: {
			// Only allow serving files from the project root
			strict: true
		},
		watch: {
			// Ignore node_modules and .git to reduce file watching overhead
			ignored: ['**/node_modules/**', '**/.git/**']
		}
	},
	
	// Production preview server settings
	preview: {
		host: true,
		allowedHosts: [
			'localhost',
			'167.172.185.204',
			'sagalabs.world',
			'www.sagalabs.world'
		]
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

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: "./" keeps asset paths relative so the static build works on any host
// (GitHub Pages project sites, Vercel, Netlify, or a plain file server).
export default defineConfig({
	base: './',
	plugins: [react()],
});

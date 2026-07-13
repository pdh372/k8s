import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: "/" (absolute) is required for BrowserRouter: a deep link like
// /k8s/quiz must still resolve assets from the site root, not from ./k8s/.
// Deploy target is Vercel/Netlify/Cloudflare Pages, served from a domain
// root — see vercel.json and public/_redirects for the SPA rewrite config
// those need to serve index.html for unknown paths.
export default defineConfig({
	base: '/',
	plugins: [react()],
});

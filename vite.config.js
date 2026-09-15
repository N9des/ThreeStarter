import { defineConfig } from 'vite';

export default defineConfig({
	root: 'src/',
	publicDir: '../static/',
	base: './',
	server: {
		host: true,
	},
	build: {
		outDir: '../dist',
		emptyOutDir: true,
		sourcemap: true,
	},
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './', // FiveM NUI needs to have local dir reference, so this is mandatory
    server: {
        port: 3000,
    },
    resolve: {
        alias: {
            '@commonTypes': resolve(__dirname, '../src/common/types'),
        },
    },
    build: {
        emptyOutDir: true,
        outDir: './dist',
        assetsDir: './',
        rollupOptions: {
            output: {
                entryFileNames: `[name].js`,
                chunkFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`,
            },
        },
    },
});

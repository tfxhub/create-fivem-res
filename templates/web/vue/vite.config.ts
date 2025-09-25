import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
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

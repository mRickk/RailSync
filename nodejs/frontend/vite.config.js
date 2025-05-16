import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        host: '0.0.0.0', //DOCKER
        watch: {
            usePolling: true,
            interval: 100,
          }
    },
    build: {
        outDir: 'dist',
    },
})

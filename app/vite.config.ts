import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ command, mode, isPreview }) => {
  const isDevServer = command === 'serve' && !isPreview
  const target = isDevServer
    ? loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), 'API_PROXY_TARGET')
        .API_PROXY_TARGET?.trim() || 'http://127.0.0.1:8000'
    : undefined

  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: {
      host: '127.0.0.1',
      port: 8444,
      strictPort: true,
      proxy: target ? {
        '/api': {
          target,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
          timeout: 130000,
          proxyTimeout: 130000,
        },
      } : undefined,
    },
  }
})

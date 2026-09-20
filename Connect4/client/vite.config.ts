import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// The game server (Express + Socket.IO). In development Vite proxies to it so the
// browser only ever talks to one origin - no CORS headaches, same URLs as production.
const SERVER_URL = 'http://localhost:3001';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/socket.io': { target: SERVER_URL, ws: true },
      '/api': { target: SERVER_URL },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});

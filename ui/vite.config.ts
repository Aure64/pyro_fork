import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1024,
  },
  server: {
    proxy: {
      '/gql': 'http://127.0.0.1:2020',
    },
  },
});

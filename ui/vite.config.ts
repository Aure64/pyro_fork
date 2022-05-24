import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
  },
  server: {
    proxy: {
      '/gql': 'http://localhost:2020',
    },
  },
});
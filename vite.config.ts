import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "/detecteur-parking/", // 🔥 Assure-toi que c'est bien le bon nom de repo GitHub
});

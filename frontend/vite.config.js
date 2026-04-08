import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('recharts')) return 'charts';
          if (id.includes('@mui') || id.includes('dayjs') || id.includes('date-fns')) return 'date-ui';
          if (id.includes('@radix-ui')) return 'radix-ui';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('@tanstack/react-query')) return 'query';
          if (id.includes('axios')) return 'network';
        },
      },
    },
  },
})

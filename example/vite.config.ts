import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import jsx from '@vitejs/plugin-vue-jsx'
import { join } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), jsx()],
  server: {
    host: true,
  },
  resolve: {
    alias: [
      // {
      //   find: 'vue3-zoom-pan-pinch',
      //   replacement: join(__dirname, '..', 'components', 'src'),
      // },
      {
        find: /^@vue3-zoom-pan-pinch\/(.+)$/,
        replacement: join(__dirname, '..', '$1', 'src'),
      },
    ],
  },
})

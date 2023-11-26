import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// import path from 'path';
import { join, resolve } from 'node:path';

export default defineConfig(
  {
    build: {
      lib: {
        // Could also be a dictionary or array of multiple entry points
        entry: resolve(__dirname, 'src/index.ts'),
        fileName: (format) => {
          return `${format}/[name].js`;
        },
      },
      minify: false,
      rollupOptions: {
        // 确保外部化处理那些你不想打包进库的依赖
        external: ['vue'],
        // input: ['src/index.ts'],
        output: [
          {
            format: 'es',
            // 不用打包成.es.js,这里我们想把它打包成.js
            entryFileNames: '[name].js',
            // 让打包目录和我们目录对应
            preserveModules: true,
            // 配置打包根目录
            dir: 'dist/es',
            preserveModulesRoot: 'src',
          },
          {
            format: 'cjs',
            entryFileNames: '[name].js',
            // 让打包目录和我们目录对应
            preserveModules: true,
            // 配置打包根目录
            dir: 'dist/cjs',
            preserveModulesRoot: 'src',
          },
        ],
      },
    },
    plugins: [
      vue(),
    ],
    resolve: {
      alias: [
        {
          find: /^@vue3-zoom-pan-pinch\/(.+)$/,
          replacement: join(__dirname, '..', '$1', 'src'),
        },
      ],
    },
  },
);

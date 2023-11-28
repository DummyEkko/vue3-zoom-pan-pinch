import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// import path from 'path';
import { join, resolve } from 'node:path';
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'

export default defineConfig(
  {
    build: {
      lib: {
        // Could also be a dictionary or array of multiple entry points
        entry: resolve(__dirname, 'src/index.ts'),
        // fileName: (format) => {
        //   return `${format}/[name].js`;
        // },
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
            preserveModules: false,
            // 配置打包根目录
            dir: 'dist/es',
            preserveModulesRoot: 'src',
          },
          // {
          //   format: 'cjs',
          //   entryFileNames: '[name].js',
          //   // 让打包目录和我们目录对应
          //   // preserveModules: true,
          //   // 配置打包根目录
          //   dir: 'dist/cjs',
          //   preserveModulesRoot: 'src',
          // },
        ],
      },
    },
    plugins: [
      vue(),
      vueJsx(),
      dts({
        rollupTypes: true,
        //指定使用的tsconfig.json为我们整个项目根目录下掉,如果不配置,你也可以在components下新建tsconfig.json
        tsconfigPath: '../tsconfig.components.json',
        // outDir: 'dist',
      }),
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

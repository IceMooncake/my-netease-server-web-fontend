import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import unpluginComponents from 'unplugin-vue-components/vite'
import unpluginAutoImport from 'unplugin-auto-import/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    unpluginComponents({
      dts: 'src/components.d.ts',
    }),
    unpluginAutoImport({
      imports: ['vue', 'vue-router'], // 哪些公共的需要自动引入
      dts: 'src/auto-imports.d.ts', // 生成.d.ts文件，解决ts报错的问题
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})

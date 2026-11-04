import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PAGE=index (밝은 버전) | dark (어두운 버전). build.mjs runs both.
const page = process.env.PAGE || 'index'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: `build/${page}`,
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: { input: `${page}.html`, output: { inlineDynamicImports: true } },
  },
})

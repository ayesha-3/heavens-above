import { defineConfig } from 'vite'

export default defineConfig({
  root: 'public', //  replace 'client' with the actual folder where index.html is
  build: {
    outDir: '../dist', // build output folder
  },
})

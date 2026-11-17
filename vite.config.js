import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works under any path (e.g. GitHub Pages' /<repo>/).
export default defineConfig({ base: './', plugins: [react()] })

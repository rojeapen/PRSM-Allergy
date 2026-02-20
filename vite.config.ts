import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'



const root = resolve(__dirname, 'src')
const outDir = resolve(__dirname, 'dist')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  root,
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        fundraisers: resolve(root, 'Fundraisers', 'index.html'),
        events: resolve(root, 'Events', 'index.html'),
        team: resolve(root, 'Team', 'index.html'),
        login: resolve(root, 'Auth', 'Login', 'index.html'),
        signup: resolve(root, 'Auth', 'Signup', 'index.html'),
        dashboard: resolve(root, 'Dashboard', 'index.html'),
        dashboardFundraisers: resolve(root, 'Dashboard', 'Fundraisers', 'index.html'),
        dashboardEvents: resolve(root, 'Dashboard', 'Events', 'index.html'),
        dashboardTeam: resolve(root, 'Dashboard', 'Team', 'index.html'),
        dashboardArticles: resolve(root, 'Dashboard', 'Articles', 'index.html'),
        articles: resolve(root, 'Articles', 'index.html'),
        articleDetail: resolve(root, 'Articles', 'detail.html'),
        eventDetail: resolve(root, 'Events', 'detail.html'),
      }
    }
  }
})

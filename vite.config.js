import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login2.html'),
        register: resolve(__dirname, 'register3.html'),
        dashboard: resolve(__dirname, 'dashboard4.html'),
        profile: resolve(__dirname, 'profile.html'),
        view_reports: resolve(__dirname, 'view_reports.html'),
        add_reports: resolve(__dirname, 'add-reports.html'),
      },
    },
  },
})

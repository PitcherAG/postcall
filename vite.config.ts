import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import appJson from './public/app.json'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig((config) => {
  const mode = config.mode
  return {
    define: {
      VITE_APP_NAME: JSON.stringify(appJson.name),
      VITE_APP_VERSION: JSON.stringify(appJson.version),
    },
    base: mode === 'production' ? '' : '/' + appJson.name,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [react()],
  }
})

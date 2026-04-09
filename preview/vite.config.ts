import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import fs from 'node:fs'
import { buildThemeData, themeDataPlugin } from './plugins/theme-data'
import { themePagesPlugin } from './plugins/theme-pages'
import { mdCharsetPlugin } from './plugins/md-charset'

const themes = buildThemeData()
const DESIGN_MD_DIR = path.resolve(process.cwd(), '../design-md')

export default defineConfig({
  plugins: [
    vue(),
    themeDataPlugin(themes),
    themePagesPlugin(themes),
    mdCharsetPlugin(),
    // Dev server: mount design-md/ at the /design-md/ path
    {
      name: 'serve-design-md',
      configureServer(server) {
        server.middlewares.use('/design-md', (req, res, next) => {
          const filePath = path.join(DESIGN_MD_DIR, req.url ?? '')
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath)
            if (ext === '.md') {
              res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
            } else if (ext === '.html') {
              res.setHeader('Content-Type', 'text/html; charset=utf-8')
            } else if (ext === '.png') {
              res.setHeader('Content-Type', 'image/png')
            }
            res.end(fs.readFileSync(filePath))
            return
          }
          next()
        })
      },
    },
  ],
  build: {
    outDir: 'dist',
  },
})

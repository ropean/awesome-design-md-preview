import type { Plugin } from 'vite'

/** Dev server only: add UTF-8 charset header to .md file responses */
export function mdCharsetPlugin(): Plugin {
  return {
    name: 'md-charset',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0].endsWith('.md')) {
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
        }
        next()
      })
    },
  }
}

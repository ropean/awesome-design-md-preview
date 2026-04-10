import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import type { ThemeMeta } from './theme-data.js'
import { SITE_TITLE, REPO_ORIGINAL, REPO_PREVIEW } from '../src/constants.js'

const DESIGN_MD_DIR = path.resolve(process.cwd(), '../design-md')
const OUT_DIR = path.resolve(process.cwd(), 'dist')

/** Generate static detail and DESIGN.md pages for each theme, and serve them on demand in the dev server */
export function themePagesPlugin(themes: ThemeMeta[]): Plugin {
  return {
    name: 'theme-pages',

    // dev server: intercept /themes/:id/ and /themes/:id/design/ routes
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''

        const detailMatch = url.match(/^\/themes\/([^/]+)\/?$/)
        if (detailMatch) {
          const theme = themes.find((t) => t.id === detailMatch[1])
          if (theme) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(generateDetailHtml(theme))
            return
          }
        }

        const designMatch = url.match(/^\/themes\/([^/]+)\/design\/?$/)
        if (designMatch) {
          const theme = themes.find((t) => t.id === designMatch[1])
          if (theme) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(generateDesignHtml(theme))
            return
          }
        }

        next()
      })
    },

    // build: emit all static HTML files
    async generateBundle() {
      for (const theme of themes) {
        this.emitFile({
          type: 'asset',
          fileName: `themes/${theme.id}/index.html`,
          source: generateDetailHtml(theme),
        })
        this.emitFile({
          type: 'asset',
          fileName: `themes/${theme.id}/design/index.html`,
          source: generateDesignHtml(theme),
        })
      }
    },

    // build 完成后：把 design-md/ 整个目录复制到 dist/
    closeBundle() {
      if (!fs.existsSync(DESIGN_MD_DIR)) return
      const dest = path.join(OUT_DIR, 'design-md')
      fs.cpSync(DESIGN_MD_DIR, dest, { recursive: true })
      console.log('\n✓ Copied design-md/ → dist/design-md/\n')
    },
  }
}

// ── HTML templates ───────────────────────────────────────────────────────────

function pageShell(opts: {
  title: string
  breadcrumbs: Array<{ label: string; href?: string }>
  content: string
  prevTheme: ThemeMeta['prevTheme']
  nextTheme: ThemeMeta['nextTheme']
}): string {
  const { title, breadcrumbs, content, prevTheme, nextTheme } = opts

  const crumbs = breadcrumbs
    .map((c, i) =>
      i < breadcrumbs.length - 1
        ? `<a href="${c.href ?? '/'}">${c.label}</a><span class="breadcrumb-sep">/</span>`
        : `<span>${c.label}</span>`,
    )
    .join('')

  const prevLink = prevTheme
    ? `<a href="/themes/${prevTheme.id}/" class="theme-nav-link prev">
        <span class="theme-nav-label">${icon('arrow-left', 13)} Previous</span>
        <span class="theme-nav-name">${esc(prevTheme.name)}</span>
      </a>`
    : '<span></span>'

  const nextLink = nextTheme
    ? `<a href="/themes/${nextTheme.id}/" class="theme-nav-link next">
        <span class="theme-nav-label">Next ${icon('arrow-right', 13)}</span>
        <span class="theme-nav-name">${esc(nextTheme.name)}</span>
      </a>`
    : '<span></span>'

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="stylesheet" href="/static-page.css" />
  <script>
    (function(){
      var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
      document.documentElement.setAttribute('data-theme',t);
    })();
  </script>
</head>
<body>

<header class="site-header">
  <a href="/" class="site-logo"><img src="/favicon.svg" alt="" width="32" height="32" aria-hidden="true" style="display:inline-block;vertical-align:middle;margin-right:8px" />${SITE_TITLE}</a>
  <nav class="header-links">
    <a href="${REPO_PREVIEW}" target="_blank" rel="noopener" class="header-link">GitHub ${icon('external-link', 13)}</a>
    <button class="theme-toggle" onclick="(function(){var d=document.documentElement,t=d.getAttribute('data-theme')==='dark'?'light':'dark';d.setAttribute('data-theme',t);localStorage.setItem('theme',t);})()">
      <span class="toggle-icon-sun">${icon('sun', 16)}</span><span class="toggle-icon-moon">${icon('moon', 16)}</span>
    </button>
  </nav>
</header>

<nav class="breadcrumb">${crumbs}</nav>

<main>
  ${content}
</main>

<nav class="theme-nav">
  ${prevLink}
  ${nextLink}
</nav>

<footer class="site-footer">
  <img src="/favicon.svg" alt="" width="16" height="16" aria-hidden="true" style="display:inline-block;vertical-align:middle" />
  <a href="${REPO_PREVIEW}" target="_blank" rel="noopener">awesome-design-md-preview</a>
  <span class="sep">·</span>
  <span class="footer-built">Built on <a href="${REPO_ORIGINAL}" target="_blank" rel="noopener">awesome-design-md</a></span>
</footer>

</body>
</html>`
}

function generateDetailHtml(theme: ThemeMeta): string {
  const controls = `
  <div class="screenshot-controls">
    <div class="sc-group">
      <button class="toggle-btn active" data-mode="light" onclick="switchScreenshot('light')">${icon('sun', 14)} Light</button>
      <a href="${esc(theme.previewUrl)}" target="_blank" rel="noopener" class="sc-link">Light Preview ${icon('external-link', 12)}</a>
    </div>
    <div class="sc-group">
      <button class="toggle-btn" data-mode="dark" onclick="switchScreenshot('dark')">${icon('moon', 14)} Dark</button>
      <a href="${esc(theme.previewDarkUrl)}" target="_blank" rel="noopener" class="sc-link">Dark Preview ${icon('external-link', 12)}</a>
    </div>
    <div class="sc-group sc-group--end">
      <a href="${esc(theme.designPageUrl)}" class="btn btn-primary">Design System ${icon('arrow-right', 14)}</a>
    </div>
  </div>`

  const screenshotBlock = (theme.screenshotUrl || theme.screenshotDarkUrl) ? `
<div class="screenshot-preview">
  ${controls}
  ${theme.screenshotUrl     ? `<img src="${esc(theme.screenshotUrl)}"     alt="${esc(theme.name)} light preview" class="screenshot-img screenshot-light">` : ''}
  ${theme.screenshotDarkUrl ? `<img src="${esc(theme.screenshotDarkUrl)}" alt="${esc(theme.name)} dark preview"  class="screenshot-img screenshot-dark">` : ''}
  ${controls}
</div>
<script>
function switchScreenshot(mode) {
  document.querySelectorAll('.toggle-btn').forEach(function(b){
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('theme', mode);
}
</script>` : ''

  const readme = theme.readmeHtmlDetail.includes('<!--SCREENSHOT_PREVIEW-->')
    ? theme.readmeHtmlDetail.replace('<!--SCREENSHOT_PREVIEW-->', screenshotBlock)
    : theme.readmeHtmlDetail + screenshotBlock

  const disclaimer = theme.category === 'Original' ? `
<div class="disclaimer disclaimer--original">
  ${icon('star', 14)}
  <span>Original design system — created from scratch, not derived from any existing product or brand.</span>
</div>` : `
<div class="disclaimer">
  ${icon('info', 14)}
  <span>Not an official ${esc(theme.name)} design system. A curated starting point for building ${esc(theme.name).toLowerCase()}-like UIs with your AI coding agent.</span>
</div>`

  return pageShell({
    title: `${theme.name} — Design System`,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: theme.name },
    ],
    content: `${disclaimer}<div class="md-content">${readme}</div>`,
    prevTheme: theme.prevTheme,
    nextTheme: theme.nextTheme,
  })
}

function generateDesignHtml(theme: ThemeMeta): string {
  const mdUrl = esc(theme.designMdUrl)
  const fileName = `${esc(theme.id)}-DESIGN.md`

  const btnGroup = (id: string) => `
<div class="btn-group">
  <a href="${mdUrl}" download="${fileName}" class="btn btn-primary btn-group-item">${icon('arrow-down', 14)} Download</a>
  <button class="btn btn-primary btn-group-item btn-group-divider" id="${id}" onclick="copyDesignMd('${mdUrl}','${id}')">${icon('copy', 14)} Copy</button>
</div>`

  const topBar = `
<div class="doc-bar">
  <span class="doc-bar-title"><strong>${esc(theme.name)}</strong> · DESIGN.md</span>
  ${btnGroup('copy-btn-top')}
</div>`

  const bottomBar = `
<div class="doc-bar">
  <div class="doc-bar-actions">
    <button class="btn btn-secondary" onclick="window.scrollTo({top:0,behavior:'smooth'})">${icon('arrow-up', 14)} Back to top</button>
    ${btnGroup('copy-btn-bottom')}
  </div>
</div>`

  const copyScript = `
<script>
function copyDesignMd(url, btnId) {
  var btn = document.getElementById(btnId);
  fetch(url)
    .then(function(r){ return r.text(); })
    .then(function(text){
      return navigator.clipboard.writeText(text);
    })
    .then(function(){
      if (!btn) return;
      var orig = btn.innerHTML;
      btn.innerHTML = '${icon('check', 14)} Copied!';
      btn.disabled = true;
      setTimeout(function(){ btn.innerHTML = orig; btn.disabled = false; }, 2000);
    })
    .catch(function(){ alert('Copy failed — please use Download instead.'); });
}
</script>`

  return pageShell({
    title: `${theme.name} — DESIGN.md`,
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: theme.name, href: `/themes/${theme.id}/` },
      { label: 'DESIGN.md' },
    ],
    content: `${topBar}<div class="md-content">${theme.designHtml}</div>${bottomBar}${copyScript}`,
    prevTheme: theme.prevTheme,
    nextTheme: theme.nextTheme,
  })
}

function icon(name: string, size = 16): string {
  return `<svg class="svg-icon" width="${size}" height="${size}" aria-hidden="true"><use href="/icons.svg#icon-${name}"></use></svg>`
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

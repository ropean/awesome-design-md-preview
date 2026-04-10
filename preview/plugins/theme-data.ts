import type { Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import MarkdownIt from 'markdown-it'
import type { ThemeCard } from '../src/types.js'

const VIRTUAL_ID = 'virtual:theme-data'
const RESOLVED_ID = '\0virtual:theme-data'

/** Full theme data used internally by the plugin — extends ThemeCard with readmeHtml / designHtml / prev / next */
export interface ThemeMeta extends ThemeCard {
  designMdUrl: string           // /design-md/$id/DESIGN.md (local file)
  screenshotUrl: string         // R2 source URL (light)
  screenshotDarkUrl: string     // R2 source URL (dark)
  readmeHtml: string            // for homepage: R2 images replaced with local thumbnails
  readmeHtmlDetail: string      // for detail page: R2 images fully stripped
  designHtml: string
  prevTheme: { id: string; name: string } | null
  nextTheme: { id: string; name: string } | null
}

const DESIGN_MD_DIR = path.resolve(process.cwd(), '../design-md')
const CATEGORIES_PATH = path.resolve(process.cwd(), 'src/data/categories.json')

const md = new MarkdownIt({ html: false, linkify: true, typographer: true })

/** Called once at build time — returns full data for all themes */
export function buildThemeData(): ThemeMeta[] {
  const categories: Record<string, string[]> = JSON.parse(
    fs.readFileSync(CATEGORIES_PATH, 'utf-8'),
  )

  // Build id → category lookup
  const categoryMap = new Map<string, string>()
  for (const [cat, ids] of Object.entries(categories)) {
    for (const id of ids) categoryMap.set(id, cat)
  }

  // Enumerate theme directories, sorted alphabetically
  const themeDirs = fs
    .readdirSync(DESIGN_MD_DIR)
    .filter((d) => {
      try {
        const dirPath = path.join(DESIGN_MD_DIR, d)
        return (
          fs.statSync(dirPath).isDirectory() &&
          fs.existsSync(path.join(dirPath, 'DESIGN.md'))
        )
      } catch {
        return false
      }
    })
    .sort()

  const themes: ThemeMeta[] = themeDirs.map((id) => {
    const readmeRaw = readFile(path.join(DESIGN_MD_DIR, id, 'README.md'))
    const designRaw = readFile(path.join(DESIGN_MD_DIR, id, 'DESIGN.md'))

    const name = extractName(readmeRaw) || id
    const descPara = extractDescParagraph(readmeRaw)
    const description = stripMarkdown(descPara)

    // First letter: use the first alphabetic character in the theme id
    const letter = (id.match(/[a-zA-Z]/)?.[0] ?? id[0]).toUpperCase()

    const THUMB_DIR = path.resolve(process.cwd(), 'public/thumbnails')
    const hasThumbnail = fs.existsSync(path.join(THUMB_DIR, id, 'preview-thumbnail.webp'))
    const isOriginal = /<!--\s*original\s*-->/i.test(readmeRaw)
    const readmeForRender = readmeRaw.replace(/<!--\s*original\s*-->\n?/gi, '')
    const screenshotUrl = extractScreenshotUrl(readmeRaw, false)
    const screenshotDarkUrl = extractScreenshotUrl(readmeRaw, true)

    return {
      id,
      name,
      letter,
      category: categoryMap.get(id) ?? 'Other',
      description,
      descriptionHtml: processLinks(md.render(descPara), id),
      readmeHtml: processLinks(replaceR2Images(md.render(readmeForRender), id), id),
      readmeHtmlDetail: processLinks(stripR2Images(md.render(readmeForRender)), id),
      designHtml: md.render(designRaw),
      previewUrl: `/design-md/${id}/preview.html`,
      previewDarkUrl: `/design-md/${id}/preview-dark.html`,
      designMdUrl: `/design-md/${id}/DESIGN.md`,
      screenshotUrl,
      screenshotDarkUrl,
      designPageUrl: `/themes/${id}/design/`,
      thumbnailUrl: `/thumbnails/${id}/preview-thumbnail.webp`,
      thumbnailDarkUrl: `/thumbnails/${id}/preview-dark-thumbnail.webp`,
      hasThumbnail,
      isOriginal,
      prevTheme: null,
      nextTheme: null,
    }
  })

  // Populate prev / next links
  themes.forEach((t, i) => {
    t.prevTheme = i > 0 ? { id: themes[i - 1].id, name: themes[i - 1].name } : null
    t.nextTheme = i < themes.length - 1 ? { id: themes[i + 1].id, name: themes[i + 1].name } : null
  })

  return themes
}

/** Vite virtual module plugin — exposes a lightweight ThemeCard[] to the Vue SPA */
export function themeDataPlugin(themes: ThemeMeta[]): Plugin {
  return {
    name: 'theme-data',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id !== RESOLVED_ID) return
      // Export only lightweight fields — omit large HTML strings
      const cards: ThemeCard[] = themes.map(
        ({ id, name, letter, category, description, descriptionHtml,
           previewUrl, previewDarkUrl, designPageUrl,
           thumbnailUrl, thumbnailDarkUrl, hasThumbnail, isOriginal, designMdUrl }) => ({
          id, name, letter, category, description, descriptionHtml,
          previewUrl, previewDarkUrl, designPageUrl,
          thumbnailUrl, thumbnailDarkUrl, hasThumbnail, isOriginal, designMdUrl,
        }),
      )
      return `export default ${JSON.stringify(cards)}`
    },
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function readFile(p: string): string {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : ''
}

function extractName(readme: string): string {
  const m = readme.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : ''
}

function extractDescParagraph(readme: string): string {
  const blocks = readme.split(/\n{2,}/)
  for (let i = 1; i < blocks.length; i++) {
    const b = blocks[i].trim()
    if (b && !b.startsWith('#') && !b.startsWith('|') && !b.startsWith('-') && !b.startsWith('!')) {
      return b
    }
  }
  return ''
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim()
}

/** Replace remote screenshot URLs with local thumbnail paths */
function replaceR2Images(html: string, themeId: string): string {
  html = html.replace(
    /src="https:\/\/[^"]+\/preview-dark-screenshot\.(?:png|webp)"/g,
    `src="/thumbnails/${themeId}/preview-dark-thumbnail.webp"`,
  )
  html = html.replace(
    /src="https:\/\/[^"]+\/preview-screenshot\.(?:png|webp)"/g,
    `src="/thumbnails/${themeId}/preview-thumbnail.webp"`,
  )
  return html
}

/** Rewrite links: GitHub MD links → local routes, third-party links → nofollow */
function processLinks(html: string, themeId: string): string {
  // linkify misidentifies plain-text "DESIGN.md" as http://design.md/ — redirect to correct local path
  html = html.replace(/<a href="https?:\/\/design\.md\/?">([^<]+)<\/a>/gi, `<a href="/themes/${themeId}/design/">$1</a>`)
  // GitHub DESIGN.md link → local design page
  html = html.replace(
    /href="https:\/\/github\.com\/VoltAgent\/awesome-design-md\/blob\/main\/design-md\/([^/"]+)\/DESIGN\.md"/g,
    'href="/themes/$1/design/"',
  )
  // GitHub theme directory link → local theme detail page
  html = html.replace(
    /href="https:\/\/github\.com\/VoltAgent\/awesome-design-md\/(?:blob|tree)\/main\/design-md\/([^/"]+)\/?"/g,
    'href="/themes/$1/"',
  )
  // All other external links get nofollow
  html = html.replace(
    /<a href="(https?:\/\/(?!github\.com\/VoltAgent)[^"]+)"/g,
    '<a href="$1" rel="nofollow noopener" target="_blank"',
  )
  return html
}

/**
 * Replace R2 screenshot blocks (including optional preceding h3 heading) with a placeholder.
 * The first occurrence becomes <!--SCREENSHOT_PREVIEW-->; subsequent ones are removed entirely.
 */
function stripR2Images(html: string): string {
  let first = true
  return html.replace(
    /(?:<h3>[^<]*<\/h3>\s*)?<p>\s*(?:<img[^>]*preview(?:-dark)?-screenshot[^>]*>\s*(?:<br[^>]*>\s*)?)+<\/p>/gi,
    () => {
      if (first) { first = false; return '<!--SCREENSHOT_PREVIEW-->' }
      return ''
    },
  )
}

/** Extract the screenshot URL from raw README markdown */
function extractScreenshotUrl(readme: string, dark: boolean): string {
  const pattern = dark
    ? /!\[[^\]]*\]\((https:\/\/[^)]+\/preview-dark-screenshot\.(?:png|webp))\)/
    : /!\[[^\]]*\]\((https:\/\/[^)]+\/preview-screenshot\.(?:png|webp))\)/
  return readme.match(pattern)?.[1] ?? ''
}

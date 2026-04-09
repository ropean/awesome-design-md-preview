# awesome-design-md-preview — Technical Design

> Source repo: [ropean/awesome-design-md-preview](https://github.com/ropean/awesome-design-md-preview)
> Built on top of: [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)

---

## 1. Overview

`awesome-design-md` collects DESIGN.md files from 58 real products, but offers no visual entry point. This preview site adds one — a browsable gallery where each design system gets its own detail page, screenshot toggle, and rendered DESIGN.md viewer.

**What it provides:**

- **Homepage** — card grid with live light/dark thumbnails, fuzzy search, category filter, alphabet index
- **Theme detail page** — rendered README + R2 screenshot toggle (light / dark)
- **DESIGN.md page** — full rendered markdown with top/bottom download bar
- **Thumbnail script** — downloads R2 screenshots and crops to local WebP thumbnails
- **Full dark mode** — persistent across sessions, all pages

---

## 2. Directory Structure

```
awesome-design-md/
├── design-md/                        ← upstream content, not modified
│   └── $theme/
│       ├── README.md
│       ├── DESIGN.md
│       ├── preview.html
│       └── preview-dark.html
│
├── docs/
│   └── preview-plan.md              ← this document
│
└── preview/                         ← Vite + Vue 3 project root
    ├── package.json
    ├── vite.config.ts
    │
    ├── public/
    │   ├── favicon.svg              ← site icon (SVG)
    │   ├── icons.svg                ← Lucide SVG sprite (30 icons)
    │   ├── placeholder.svg          ← thumbnail fallback (400×600)
    │   ├── static-page.css          ← styles for static HTML pages
    │   └── thumbnails/
    │       └── $theme/
    │           ├── preview-thumbnail.webp
    │           └── preview-dark-thumbnail.webp
    │
    ├── scripts/
    │   └── thumbnails.ts            ← thumbnail download + crop script
    │
    ├── plugins/
    │   ├── theme-data.ts            ← Vite plugin: parse all MD at build time
    │   ├── theme-pages.ts           ← Vite plugin: generate static HTML pages
    │   └── md-charset.ts            ← Vite plugin: UTF-8 headers for .md in dev
    │
    └── src/
        ├── main.ts
        ├── App.vue                  ← SiteHeader + router-view + SiteFooter
        ├── constants.ts             ← SITE_TITLE, REPO_ORIGINAL, REPO_PREVIEW
        │
        ├── pages/
        │   └── HomePage.vue
        │
        ├── components/
        │   ├── SiteHeader.vue
        │   ├── SiteFooter.vue
        │   ├── ThemeCard.vue
        │   ├── SearchBar.vue
        │   ├── AlphabetNav.vue
        │   ├── CategoryNav.vue
        │   ├── DarkModeToggle.vue
        │   └── SvgIcon.vue
        │
        └── styles/
            ├── tokens.css           ← CSS variables (Vue SPA)
            └── global.css
```

**Build output (`dist/`):**

```
dist/
├── index.html                       ← Vue SPA entry
├── assets/                          ← Vite-bundled JS/CSS
├── thumbnails/                      ← copied from public/thumbnails/
├── themes/
│   └── $theme/
│       ├── index.html               ← static detail page
│       └── design/
│           └── index.html           ← static DESIGN.md page
└── design-md/                       ← raw MD files (copied at build)
    └── $theme/
        ├── DESIGN.md
        ├── preview.html
        └── preview-dark.html
```

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Build | Vite 8 |
| Framework | Vue 3 + Composition API |
| Language | TypeScript |
| Markdown | markdown-it 14 |
| Fuzzy search | Fuse.js 7 |
| Image processing | sharp 0.34 |
| Fonts | Space Grotesk · Lora · JetBrains Mono (Google Fonts) + Geist (npm) |
| Icons | Lucide (SVG sprite, `public/icons.svg`) |
| Deploy | Cloudflare Pages |

---

## 4. Data Flow

```
Build time (Node.js)
  design-md/$theme/README.md
  design-md/$theme/DESIGN.md
         ↓
  theme-data.ts  (markdown-it render + link rewriting)
         ↓
  virtual module  virtual:theme-data  →  ThemeMeta[]
         ↓
  theme-pages.ts  →  dist/themes/$theme/index.html
                  →  dist/themes/$theme/design/index.html

Runtime (browser)
  Fuse.js index  →  fuzzy search across name + description + category
  Search / Category / Alphabet  →  three-way AND filter
  Dark mode toggle  →  data-theme attribute + localStorage
  ThemeCard  →  lazy-loaded WebP thumbnails, swap on dark mode
```

---

## 5. Module Details

### 5.1 Vite Plugin: `theme-data`

Parses every theme at build time and exposes a typed virtual module.

**`ThemeMeta` interface:**

```ts
interface ThemeMeta {
  id: string               // "airbnb"
  name: string             // "Airbnb"
  letter: string           // "A"
  category: string         // "Enterprise & Consumer"

  description: string      // plain text excerpt for Fuse.js
  descriptionHtml: string  // rendered HTML excerpt

  readmeHtml: string       // README rendered for homepage cards
  readmeHtmlDetail: string // README rendered for detail page (R2 images → placeholder)
  designHtml: string       // DESIGN.md fully rendered

  previewUrl: string       // /design-md/$theme/preview.html
  previewDarkUrl: string   // /design-md/$theme/preview-dark.html
  designMdUrl: string      // /design-md/$theme/DESIGN.md
  designPageUrl: string    // /themes/$theme/design/

  thumbnailUrl: string     // /thumbnails/$theme/preview-thumbnail.webp
  thumbnailDarkUrl: string // /thumbnails/$theme/preview-dark-thumbnail.webp
  hasThumbnail: boolean

  screenshotUrl: string    // R2 URL of light screenshot (for detail page toggle)
  screenshotDarkUrl: string

  prevTheme: { id: string; name: string } | null
  nextTheme: { id: string; name: string } | null
}
```

**Link rewriting rules in `readmeHtml` / `readmeHtmlDetail`:**

| Original | Rewritten to |
|---|---|
| `github.com/.../design-md/$theme/DESIGN.md` | `/themes/$theme/design/` |
| `github.com/.../design-md/$theme/` | `/themes/$theme/` |
| `http://design.md/` (linkify false-positive) | `/themes/$theme/design/` |
| Other external links | preserved + `rel="nofollow noopener" target="_blank"` |

**R2 image handling for `readmeHtmlDetail`:**

The first R2 image block (heading + `<p><img r2-url></p>`) is replaced with `<!--SCREENSHOT_PREVIEW-->`. All remaining R2 images are stripped. The `theme-pages.ts` plugin injects the screenshot toggle block at that placeholder position.

---

### 5.2 Vite Plugin: `theme-pages`

Generates two static HTML files per theme during `generateBundle`, and copies `design-md/` to `dist/` during `closeBundle`.

**Detail page (`/themes/$theme/`):**

1. Sticky header + breadcrumb (Home → Theme name)
2. Rendered README (`readmeHtmlDetail`)
3. Screenshot toggle block injected at `<!--SCREENSHOT_PREVIEW-->`:
   - Light / Dark toggle buttons (with active state)
   - Light Preview ↗ / Dark Preview ↗ external links
   - Design System → button
   - Full-size R2 screenshots, CSS-toggled by `data-theme`
4. Prev / Next theme navigation
5. Footer

**DESIGN.md page (`/themes/$theme/design/`):**

1. Sticky header + breadcrumb (Home → Theme → DESIGN.md)
2. Top doc-bar: `{Name} · DESIGN.md` + Download button
3. Fully rendered DESIGN.md
4. Bottom doc-bar: Back to top button + Download button
5. Prev / Next theme navigation
6. Footer

Both page types share `pageShell()` and reference `/static-page.css` and `/icons.svg`.

---

### 5.3 Vite Plugin: `md-charset`

In dev server only: sets `Content-Type: text/markdown; charset=utf-8` for `.md` responses. Production is handled by Cloudflare Pages `_headers`.

---

### 5.4 Script: `thumbnails`

Standalone script, run manually. Does not run during `vite build`.

```
For each design-md/$theme/README.md:
  1. Extract R2 screenshot URLs (light + dark) via regex
  2. Skip if output exists and --force not set
  3. Download via HTTPS (follows redirects, 30s timeout)
  4. sharp.resize(640, 960, { fit: 'cover', position: 'top', kernel: lanczos3 })
  5. .webp({ quality: 90 })
  6. Write to public/thumbnails/$theme/preview[-dark]-thumbnail.webp
```

Output: 640×960 WebP, quality 90.
Source images are at minimum 640px wide — no upscaling ever occurs.
Thumbnails are committed to the repo; CI does not need to regenerate them.

```bash
pnpm thumbnails              # skip existing
pnpm thumbnails -- --force   # regenerate all
```

---

### 5.5 Homepage (`HomePage.vue`)

**Layout:**

```
SiteHeader (sticky)
├── SearchBar
├── CategoryNav
├── AlphabetNav
└── Card grid (3 → 2 → 1 columns, responsive)
    └── ThemeCard × 58
SiteFooter
```

**Filtering:** search × category × alphabet — three-way AND. All three conditions update simultaneously; alphabet nav highlights only letters present in the current filtered result set.

**ThemeCard:**
- Full card is a clickable `<a>` link → detail page
- Thumbnail swaps light/dark with `useDarkMode()` composable
- Three icon buttons (bottom-right): Light preview, Dark preview, DESIGN.md — each with CSS tooltip
- Lazy-loaded WebP thumbnails; falls back to `placeholder.svg` on error

---

## 6. Dark Mode

All pages use `data-theme="light|dark"` on `<html>`. CSS variables cover both surfaces. Switching persists to `localStorage`; on first visit, `prefers-color-scheme` is used as default.

Vue SPA state is managed by a `useDarkMode()` composable (provide/inject). Static pages use an inline `<script>` in `<head>` to apply the saved theme before first paint, and an `onclick` handler on the toggle button.

---

## 7. Design Tokens

One token set for the Vue SPA (`src/styles/tokens.css`), mirrored in `public/static-page.css` for static pages. Based on the Cursor DESIGN.md color palette.

```css
/* Accent */
--color-accent: #f54e00;

/* Surfaces (light) */
--color-bg:   #f2f1ed;   --color-bg-2: #ebeae5;
--color-bg-3: #e6e5e0;   --color-bg-4: #e1e0db;

/* Text (light) */
--color-text:   #26251e;   --color-text-2: #6b6960;   --color-text-3: #9e9d99;

/* Spacing — 8px grid */
--space-1: 8px;    --space-2: 16px;
--space-3: 24px;   --space-4: 32px;   --space-6: 48px;

/* Radius */
--radius-sm: 4px;   --radius-md: 8px;
--radius-lg: 12px;  --radius-pill: 9999px;

/* Shadow */
--shadow-sm: 0 1px 3px rgba(38,37,30,.08);
--shadow-md: 0 4px 12px rgba(38,37,30,.10);
```

All spacing and radius values in components must reference these tokens. Magic numbers are not permitted.

---

## 8. SVG Icon System

Icons are served as a single sprite at `/public/icons.svg` (30 Lucide icons). Usage:

```html
<!-- Vue -->
<SvgIcon name="arrow-right" :size="16" />

<!-- Static HTML -->
<svg class="svg-icon" width="16" height="16" aria-hidden="true">
  <use href="/icons.svg#icon-arrow-right"></use>
</svg>
```

The `icon()` helper in `theme-pages.ts` generates the static HTML string.

---

## 9. Commands

```bash
cd preview

pnpm install               # install dependencies
pnpm dev                   # dev server with HMR
pnpm build                 # production build → dist/
pnpm preview               # serve dist/ locally

pnpm thumbnails            # generate missing thumbnails
pnpm thumbnails -- --force # regenerate all thumbnails
```

---

## 10. Key Dependencies

```json
{
  "dependencies": {
    "vue": "^3.x",
    "fuse.js": "^7.x",
    "geist": "^1.x"
  },
  "devDependencies": {
    "vite": "^8.x",
    "@vitejs/plugin-vue": "^6.x",
    "markdown-it": "^14.x",
    "sharp": "^0.34.x",
    "tsx": "^4.x",
    "typescript": "^6.x"
  }
}
```

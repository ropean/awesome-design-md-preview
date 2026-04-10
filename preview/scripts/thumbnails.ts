/**
 * Thumbnail generation script
 *
 * Usage:
 *   pnpm thumbnails   # generate missing thumbnails; prompts if all exist
 *
 * Source images are cached in design-screenshots/{theme-id}/ at the repo root.
 * On normal runs, a cached source skips the download; only the crop is redone
 * if the thumbnail is missing. With --force (via interactive prompt), both the
 * source image and the thumbnail are regenerated.
 */

import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import http from 'node:http'
import readline from 'node:readline'
import sharp from 'sharp'

const DESIGN_MD_DIR   = path.resolve(process.cwd(), '../design-md')
const SCREENSHOTS_DIR = path.resolve(process.cwd(), '../design-screenshots')
const THUMB_DIR       = path.resolve(process.cwd(), 'public/thumbnails')
const THUMB_W = 640
const THUMB_H = 960

interface ThumbTask {
  themeId:  string
  lightUrl: string
  darkUrl:  string
  lightSrc: string   // design-screenshots/{id}/preview-screenshot.webp
  darkSrc:  string   // design-screenshots/{id}/preview-dark-screenshot.webp
  lightOut: string   // public/thumbnails/{id}/preview-thumbnail.webp
  darkOut:  string   // public/thumbnails/{id}/preview-dark-thumbnail.webp
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const tasks = buildTasks()

  console.log(`\nProcessing ${tasks.length} themes…\n`)

  const { done, skipped, failed } = await runTasks(tasks)

  console.log(`\nDone: ${done}  Skipped: ${skipped}  Failed: ${failed}\n`)

  if (skipped > 0 && done === 0 && failed === 0) {
    await promptRegenerate(tasks)
  }
}

// ── Interactive prompt ────────────────────────────────────────────────────

async function promptRegenerate(tasks: ThumbTask[]) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

  const ask = () =>
    new Promise<string>((resolve) => {
      rl.question(
        'All thumbnails already exist. Regenerate?\n  0  — all\n  X  — exit\n  or enter a theme name: ',
        (ans) => resolve(ans.trim()),
      )
    })

  while (true) {
    const ans = await ask()

    if (ans === '0') {
      rl.close()
      console.log()
      const { done, failed } = await runTasks(tasks, true)
      console.log(`\nRegenerated: ${done}  Failed: ${failed}\n`)
      return
    }

    if (ans.toLowerCase() === 'x' || ans === '') {
      rl.close()
      console.log('Exiting.')
      return
    }

    const task = tasks.find((t) => t.themeId === ans)
    if (!task) {
      console.log(`  Theme "${ans}" not found. Available: ${tasks.map((t) => t.themeId).join(', ')}`)
      continue
    }

    rl.close()
    console.log()
    const { done, failed } = await runTasks([task], true)
    console.log(`\nRegenerated: ${done}  Failed: ${failed}\n`)
    return
  }
}

// ── Build task list ───────────────────────────────────────────────────────

function buildTasks(): ThumbTask[] {
  const tasks: ThumbTask[] = []

  const themeDirs = fs
    .readdirSync(DESIGN_MD_DIR)
    .filter((d) => fs.statSync(path.join(DESIGN_MD_DIR, d)).isDirectory())
    .sort()

  for (const id of themeDirs) {
    const readmePath = path.join(DESIGN_MD_DIR, id, 'README.md')
    if (!fs.existsSync(readmePath)) continue

    const readme = fs.readFileSync(readmePath, 'utf-8')
    const lightUrl = extractUrl(readme, false)
    const darkUrl  = extractUrl(readme, true)

    if (!lightUrl && !darkUrl) {
      console.log(`⚠  ${id}: no screenshot URLs found in README.md`)
      continue
    }

    fs.mkdirSync(path.join(SCREENSHOTS_DIR, id), { recursive: true })
    fs.mkdirSync(path.join(THUMB_DIR, id),        { recursive: true })

    tasks.push({
      themeId:  id,
      lightUrl: lightUrl ?? '',
      darkUrl:  darkUrl  ?? '',
      lightSrc: path.join(SCREENSHOTS_DIR, id, urlFilename(lightUrl)),
      darkSrc:  path.join(SCREENSHOTS_DIR, id, urlFilename(darkUrl)),
      lightOut: path.join(THUMB_DIR, id, 'preview-thumbnail.webp'),
      darkOut:  path.join(THUMB_DIR, id, 'preview-dark-thumbnail.webp'),
    })
  }

  return tasks
}

// ── Run tasks ─────────────────────────────────────────────────────────────

async function runTasks(
  tasks: ThumbTask[],
  force = false,
): Promise<{ done: number; skipped: number; failed: number }> {
  let done = 0, skipped = 0, failed = 0

  for (const task of tasks) {
    const results = await Promise.allSettled([
      processThumb(task.lightUrl, task.lightSrc, task.lightOut, `${task.themeId}/light`, force),
      processThumb(task.darkUrl,  task.darkSrc,  task.darkOut,  `${task.themeId}/dark`,  force),
    ])

    let anyDone = false, anySkip = false, anyFail = false
    for (const r of results) {
      if (r.status === 'fulfilled') {
        if (r.value === 'skipped') anySkip = true
        else anyDone = true
      } else {
        anyFail = true
      }
    }

    if (anyFail) {
      failed++
      const errs = results
        .filter((r) => r.status === 'rejected')
        .map((r) => (r as PromiseRejectedResult).reason?.message ?? r)
        .join(', ')
      console.log(`✗  ${task.themeId}: ${errs}`)
    } else if (anyDone) {
      done++
      console.log(`✓  ${task.themeId}`)
    } else if (anySkip) {
      skipped++
      console.log(`⏭  ${task.themeId} (skipped)`)
    }
  }

  return { done, skipped, failed }
}

// ── Process single thumbnail ──────────────────────────────────────────────

async function processThumb(
  url:     string,
  srcPath: string,
  outPath: string,
  label:   string,
  force:   boolean,
): Promise<'done' | 'skipped'> {
  if (!url) return 'skipped'

  // Source image: ensure cached; re-download only when forcing
  if (force || !fs.existsSync(srcPath)) {
    const buffer = await download(url, label)
    fs.writeFileSync(srcPath, buffer)
  }

  // Thumbnail already exists and not forcing — skip crop
  if (!force && fs.existsSync(outPath)) return 'skipped'

  await sharp(srcPath)
    .resize(THUMB_W, THUMB_H, { fit: 'cover', position: 'top', kernel: sharp.kernel.lanczos3 })
    .webp({ quality: 90 })
    .toFile(outPath)

  return 'done'
}

// ── Download ──────────────────────────────────────────────────────────────

function download(url: string, label: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const req = protocol.get(url, { timeout: 30_000 }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        download(res.headers.location, label).then(resolve).catch(reject)
        return
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${label}`))
        return
      }
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`Timeout downloading ${label}`))
    })
  })
}

// ── URL helpers ───────────────────────────────────────────────────────────

/** Extract the original filename (with extension) from a URL */
function urlFilename(url: string | undefined): string {
  if (!url) return ''
  try { return path.basename(new URL(url).pathname) } catch { return '' }
}

// ── URL extraction ────────────────────────────────────────────────────────

function extractUrl(readme: string, dark: boolean): string | undefined {
  const pattern = dark
    ? /!\[[^\]]*\]\((https:\/\/[^)]+\/preview-dark-screenshot\.(?:png|webp))\)/
    : /!\[[^\]]*\]\((https:\/\/[^)]+\/preview-screenshot\.(?:png|webp))\)/
  return readme.match(pattern)?.[1]
}

// ── Entry ─────────────────────────────────────────────────────────────────
main().catch((err) => {
  console.error(err)
  process.exit(1)
})

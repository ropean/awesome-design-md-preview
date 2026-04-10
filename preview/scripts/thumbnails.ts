/**
 * Thumbnail generation script
 *
 * Usage:
 *   pnpm thumbnails   # generate missing thumbnails; prompts if all exist
 */

import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import http from 'node:http'
import readline from 'node:readline'
import sharp from 'sharp'

const DESIGN_MD_DIR = path.resolve(process.cwd(), '../design-md')
const THUMB_DIR = path.resolve(process.cwd(), 'public/thumbnails')
const THUMB_W = 640
const THUMB_H = 960

interface ThumbTask {
  themeId: string
  lightUrl: string
  darkUrl: string
  lightOut: string
  darkOut: string
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const tasks = buildTasks()

  console.log(`\nProcessing ${tasks.length} themes…\n`)

  const { done, skipped, failed } = await runTasks(tasks, new Set())

  console.log(`\nDone: ${done}  Skipped: ${skipped}  Failed: ${failed}\n`)

  if (skipped > 0 && done === 0 && failed === 0) {
    await promptRegenerate(tasks)
  }
}

// ── Interactive prompt ────────────────────────────────────────────────────

async function promptRegenerate(tasks: ThumbTask[]) {
  const themeIds = new Set(tasks.map((t) => t.themeId))
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
      const { done, failed } = await runTasks(tasks, new Set(), true)
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
      const closest = tasks.map((t) => t.themeId).join(', ')
      console.log(`  Theme "${ans}" not found. Available: ${closest}`)
      continue
    }

    rl.close()
    console.log()
    const { done, failed } = await runTasks([task], new Set(), true)
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
    const darkUrl = extractUrl(readme, true)

    if (!lightUrl && !darkUrl) {
      console.log(`⚠  ${id}: no screenshot URLs found in README.md`)
      continue
    }

    const themeThumbDir = path.join(THUMB_DIR, id)
    fs.mkdirSync(themeThumbDir, { recursive: true })

    tasks.push({
      themeId: id,
      lightUrl: lightUrl ?? '',
      darkUrl: darkUrl ?? '',
      lightOut: path.join(themeThumbDir, 'preview-thumbnail.webp'),
      darkOut: path.join(themeThumbDir, 'preview-dark-thumbnail.webp'),
    })
  }

  return tasks
}

// ── Run tasks ─────────────────────────────────────────────────────────────

async function runTasks(
  tasks: ThumbTask[],
  _unused: Set<never>,
  force = false,
): Promise<{ done: number; skipped: number; failed: number }> {
  let done = 0, skipped = 0, failed = 0

  for (const task of tasks) {
    const results = await Promise.allSettled([
      processThumb(task.lightUrl, task.lightOut, `${task.themeId}/light`, force),
      processThumb(task.darkUrl, task.darkOut, `${task.themeId}/dark`, force),
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
  url: string,
  outPath: string,
  label: string,
  force: boolean,
): Promise<'done' | 'skipped'> {
  if (!url) return 'skipped'

  if (!force && fs.existsSync(outPath)) {
    return 'skipped'
  }

  const buffer = await download(url, label)
  await sharp(buffer)
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
      // Follow redirects
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

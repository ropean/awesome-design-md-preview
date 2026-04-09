/**
 * Sync design-md/ from upstream VoltAgent/awesome-design-md
 *
 * Usage:
 *   pnpm sync-upstream              # sync all changes
 *   pnpm sync-upstream -- --dry-run # preview changes without applying
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'

const UPSTREAM = 'https://github.com/VoltAgent/awesome-design-md.git'
const LOCAL_DIR = path.resolve(process.cwd(), '../design-md')
const DRY_RUN = process.argv.includes('--dry-run')


// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  if (DRY_RUN) console.log('\n[dry-run] No files will be written.\n')

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'awesome-design-md-sync-'))

  try {
    // Sparse clone: only download design-md/, skip blobs until checked out
    console.log('Fetching upstream (sparse clone)...')
    run(`git clone --depth=1 --filter=blob:none --sparse --quiet "${UPSTREAM}" "${tmpDir}"`)
    run(`git sparse-checkout set design-md`, tmpDir)
    run(`git checkout`, tmpDir)
    console.log('Done.\n')

    const srcDir = path.join(tmpDir, 'design-md')
    const results = sync(srcDir, LOCAL_DIR)
    report(results)

  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

// ── Sync ──────────────────────────────────────────────────────────────────

interface SyncResult {
  added:     string[]
  updated:   string[]
  unchanged: string[]
}

function sync(srcDir: string, destDir: string): SyncResult {
  const result: SyncResult = { added: [], updated: [], unchanged: [] }

  const themes = fs.readdirSync(srcDir).filter((d) =>
    fs.statSync(path.join(srcDir, d)).isDirectory()
  )

  for (const theme of themes) {
    const srcTheme  = path.join(srcDir, theme)
    const destTheme = path.join(destDir, theme)

    if (!fs.existsSync(destTheme)) {
      if (!DRY_RUN) fs.mkdirSync(destTheme, { recursive: true })
    }

    const files = walkDir(srcTheme)
    for (const rel of files) {
      const srcFile  = path.join(srcTheme, rel)
      const destFile = path.join(destTheme, rel)
      const label = path.join(theme, rel)

      if (!fs.existsSync(destFile)) {
        if (!DRY_RUN) {
          fs.mkdirSync(path.dirname(destFile), { recursive: true })
          fs.copyFileSync(srcFile, destFile)
        }
        result.added.push(label)
      } else if (!sameContent(srcFile, destFile)) {
        if (!DRY_RUN) fs.copyFileSync(srcFile, destFile)
        result.updated.push(label)
      } else {
        result.unchanged.push(label)
      }
    }
  }

  return result
}

// ── Report ────────────────────────────────────────────────────────────────

function report(r: SyncResult) {
  if (r.added.length) {
    console.log(`✚  Added (${r.added.length}):`)
    r.added.forEach((f) => console.log(`   ${f}`))
  }

  if (r.updated.length) {
    console.log(`\n↑  Updated (${r.updated.length}):`)
    r.updated.forEach((f) => console.log(`   ${f}`))
  }

  console.log(`\n✓  Unchanged: ${r.unchanged.length} files`)

  if (DRY_RUN && (r.added.length || r.updated.length)) {
    console.log('\nRun without --dry-run to apply these changes.')
  }

  console.log()
}

// ── Helpers ───────────────────────────────────────────────────────────────

function run(cmd: string, cwd?: string) {
  execSync(cmd, { cwd, stdio: 'pipe' })
}

function walkDir(dir: string, base = ''): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name
    if (e.isDirectory()) files.push(...walkDir(path.join(dir, e.name), rel))
    else files.push(rel)
  }
  return files
}

function sameContent(a: string, b: string): boolean {
  const hash = (f: string) =>
    crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex')
  return hash(a) === hash(b)
}

// ── Entry ─────────────────────────────────────────────────────────────────
main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})

export const SITE_TITLE = 'Awesome DESIGN.md Preview'

export const REPO_ORIGINAL = 'https://github.com/VoltAgent/awesome-design-md'
export const REPO_PREVIEW   = 'https://github.com/ropean/awesome-design-md-preview'

/** Canonical download filename for a theme's DESIGN.md — e.g. "airtable-DESIGN.md" */
export function designMdFileName(id: string): string {
  return `${id}-DESIGN.md`
}

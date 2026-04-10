/** Lightweight theme data exported from virtual:theme-data, used by the homepage */
export interface ThemeCard {
  id: string
  name: string
  letter: string
  category: string
  description: string       // plain text, used for Fuse.js indexing
  descriptionHtml: string   // HTML with rewritten links
  previewUrl: string        // /design-md/$id/preview.html
  previewDarkUrl: string    // /design-md/$id/preview-dark.html
  designPageUrl: string     // /themes/$id/design/
  thumbnailUrl: string
  thumbnailDarkUrl: string
  hasThumbnail: boolean
  isOriginal: boolean        // true if README contains <!-- original -->
  designMdUrl: string        // /design-md/$id/DESIGN.md (for download)
}

# Adding a New Theme

This document describes how to create a new theme for awesome-design-md-preview. Each theme is a directory under `design-md/` containing exactly four files.

---

## Directory Layout

```
design-md/
└── {theme-id}/
    ├── DESIGN.md           ← Design system specification (primary artifact)
    ├── README.md           ← Theme overview with screenshot links
    ├── preview.html        ← Interactive design token catalog (light)
    └── preview-dark.html   ← Interactive design token catalog (dark variant)
```

`{theme-id}` is a lowercase, hyphen-separated identifier (e.g. `aurora`, `dark-forest`, `ocean-depth`). It must be unique across all themes and stable — it is used in URLs and thumbnail paths.

---

## File 1: DESIGN.md

**This is the most important file.** It is the machine-readable specification that AI agents (Claude, Cursor, Stitch, etc.) use to generate UI matching the design system. Every value must be explicit, copy-pasteable, and unambiguous.

### Required Sections

DESIGN.md must contain these nine sections in order:

---

### Section 1 — Visual Theme & Atmosphere

Describe the design language as a coherent mental model. Write it as if explaining the design intent to someone who has never seen it. Cover:

- **Canvas**: What does the background look like? (gradient, solid, texture, image?) Provide the exact CSS value.
- **Surfaces**: How are panels, cards, and containers styled? (glassmorphism, solid, neumorphic, flat?) Include the exact `background`, `backdrop-filter`, and `border` values.
- **Accent system**: What color or gradient signals interactivity? Where is it used and where is it not?
- **Typography personality**: Which fonts and why? What do the letterforms communicate?
- **Key Characteristics**: End with a bulleted list of 6–10 precise, atomic traits — each one a decision a developer can directly implement.

**Quality bar:** After reading Section 1, a developer should be able to recreate the visual atmosphere of the design system without seeing any other section.

---

### Section 2 — Color Palette & Roles

Define every named color with its hex/rgba value and the role it plays. Organize by function, not hue. Use sub-headings for each group:

- **Background** (gradient stops, solid fills, tiling patterns)
- **Surfaces** (default, hover, active, selected states — with exact opacity values)
- **Text** (primary, secondary, muted/tertiary, on-accent)
- **Accent** (gradient start, gradient end, midpoint, glow/shadow color, subtle tint)
- **Borders** (default, active/focused, decorative)
- **Interactive States** (hover delta, active delta, focus ring spec)

For every token: provide the name, the CSS value, the Tailwind equivalent if applicable, and a one-sentence description of when to use it.

**Example format:**
```
- **Surface Default** (`rgba(255, 255, 255, 0.05)`): Resting card background. The background shows through at 95% — this is intentional.
- **Surface Hover** (`rgba(255, 255, 255, 0.10)`): Applied on `:hover` — the card appears to brighten as the cursor approaches.
```

---

### Section 3 — Typography Rules

#### Font Family
List each font family, its role (display, body, mono), and its fallback stack. Explain *why* this font was chosen — one sentence per font.

#### Hierarchy Table
Provide a table with these columns: Role, Font, Size (px + rem), Weight, Line Height, Letter Spacing, Notes.

Include at minimum: Hero, Display, Heading 1, Heading 2, Heading 3, UI Label, Body, Body Small, Caption, Code.

#### Principles
3–6 rules governing how typography behaves in this system:
- Gradient text treatment (if used): exact CSS
- Weight restraint: which weights are permitted
- Tracking rules: when negative/positive tracking applies
- Hierarchy signals: how color and size work together

---

### Section 4 — Component Stylings

Define the exact CSS for each interactive component. Sub-headings per component type. Cover all relevant states: default, hover, active, focus, disabled.

**Required components:**

**Buttons**
- Primary / CTA button (background, text, padding, border-radius, hover, active, focus)
- Secondary / Ghost button
- Link button / text link

**Cards & Containers**
- Default card (background, border, border-radius, backdrop-filter, box-shadow)
- Hovered card
- Selected / active card

**Inputs & Search**
- Text input (background, text, placeholder color, border, border-radius, focus state)
- Search field (if distinct from text input)

**Navigation**
- Nav bar (background, backdrop-filter, border, height)
- Nav item states (default, hover, active)

**Tags & Badges**
- Background, text, border, border-radius, padding, font spec

**Distinctive Elements**
Document 2–4 signature components that are unique to this design system (e.g. gradient text headings, glow shadows, animated borders, custom scrollbars). Each gets its exact CSS.

---

### Section 5 — Layout Principles

#### Spacing System
- Base unit
- Scale values (list each step)
- Internal padding: compact / default / relaxed
- Gap between cards, sections, and page regions

#### Grid & Container
- Max content width
- Column layout (sidebar width if applicable, content panel behavior)
- How the background relates to the grid (does it span full viewport? is it fixed?)

#### Whitespace Philosophy
2–4 sentences on the intent behind the spacing decisions. Why does this system breathe the way it does?

#### Border Radius Scale
Table of radius values and which components use each one.

---

### Section 6 — Depth & Elevation

A table with columns: Level, Treatment (exact CSS), Use.

Cover at minimum: Canvas (Level 0), 2–3 elevated surface levels, focus/selected glow state, modal overlay.

Follow with a **Shadow Philosophy** paragraph (3–5 sentences) explaining whether this system uses drop-shadows, glows, borders, or another mechanism to signal depth — and why.

---

### Section 7 — Do's and Don'ts

Two lists. Each item is a single, actionable rule. Be specific — avoid vague advice.

**Do** (6–10 items): patterns that must be followed to maintain the design system's integrity.

**Don't** (6–10 items): patterns that break the system, contradict its identity, or produce inconsistent results.

---

### Section 8 — Responsive Behavior

#### Breakpoints
Table: Name, Width, Key Changes at that breakpoint.

Include at minimum: Mobile (<640px), Tablet (640–1024px), Desktop (1024–1280px), Wide (>1280px).

#### Touch Targets
Minimum tap target heights for: primary CTA, navigation links, card items, small controls.

#### Collapsing Strategy
How the following adapt as the viewport narrows:
- Hero / display typography (size progression)
- Sidebar (if present)
- Cards and grid
- Background treatment

#### Image Behavior
Behavior of avatars, hero images, icons — sizes, aspect ratios, treatment on different themes.

---

### Section 9 — Agent Prompt Guide

This section is written *for* AI agents. It must be self-contained — an agent reading only this section should be able to produce correct components.

#### Quick Color Reference
A flat list of the 10–12 most-used values with their exact CSS. No prose — just token name and value.

**Example format:**
```
- Background: linear-gradient(135deg, #2e1065 0%, #4a044e 50%, #1e1b4b 100%)
- Glass surface: rgba(255, 255, 255, 0.05) + backdrop-filter: blur(12px)
- Primary text: #f5f3ff
```

#### Example Component Prompts
5 copy-pasteable prompts, each producing a complete, styled component. Format each as a single quoted string that an agent can use directly. Cover: card, primary button, navigation bar, tag/badge, input field.

#### Iteration Guide
A numbered checklist (6–8 steps) that an agent should follow when building or refining a UI in this design system. Ordered from most foundational to most refinement-level.

---

## File 2: README.md

The README is the public-facing overview shown on the homepage card and the theme detail page. It must follow this exact structure:

```markdown
# {Theme Name} Design System

<!-- original -->

[DESIGN.md](./DESIGN.md) inspired by {one-sentence description of the visual concept}.

## Files

| File | Description |
|------|-------------|
| `DESIGN.md` | Complete design system documentation (N sections) |
| `preview.html` | Interactive design token catalog |
| `preview-dark.html` | {brief description of what distinguishes the dark variant} |

Use [DESIGN.md](./DESIGN.md) as a reference for AI agents (Claude, Cursor, Stitch) to generate UI that matches the {Theme Name} design language.

## Preview

A sample landing page built with DESIGN.md. It shows the actual colors, typography, buttons, cards, spacing, and elevation, all in one page.

### Dark Mode
![{Theme Name} Design System — Dark Mode](https://design-screenshots.ropean.org/{theme-id}/preview-dark-screenshot.webp)

### Light Mode
![{Theme Name} Design System — Light Mode](https://design-screenshots.ropean.org/{theme-id}/preview-screenshot.webp)
```

### Thumbnail URL Format

Screenshots are served from R2 at a fixed URL pattern. **Do not invent or abbreviate the paths.**

| Variant | URL |
|---------|-----|
| Light screenshot | `https://design-screenshots.ropean.org/{theme-id}/preview-screenshot.webp` |
| Dark screenshot | `https://design-screenshots.ropean.org/{theme-id}/preview-dark-screenshot.webp` |

- File format: **WebP** (always `.webp`, never `.png` or `.jpg`)
- `{theme-id}` must exactly match the directory name under `design-md/`
- The thumbnail script reads these URLs from `README.md` by regex and crops them to 640×960 WebP at quality 90 for use as homepage card thumbnails

**Alt text format:** `{Theme Name} Design System — Dark Mode` / `{Theme Name} Design System — Light Mode`
(em dash `—`, not a hyphen `-`)

---

## File 3: preview.html

A single self-contained HTML file. No external dependencies other than Google Fonts. It functions as a live design token catalog — showing colors, typography, buttons, cards, and other components in their light appearance.

Requirements:
- All CSS inline in `<style>` or in a `<style>` tag in `<head>`
- All fonts loaded from Google Fonts via `<link>` in `<head>`
- No JavaScript framework; vanilla JS only if needed (e.g. tab switching)
- Demonstrates at minimum: background/canvas, card surfaces, button variants, typography scale, tags/badges, navigation bar
- Must accurately reflect every value specified in DESIGN.md — discrepancies between preview.html and DESIGN.md are bugs

---

## File 4: preview-dark.html

Same requirements as `preview.html`. The dark variant should either:

- Show a deeper or more saturated dark mode (if the main theme is already dark), or
- Show the true dark mode equivalent (if the main theme is light or neutral)

Describe what distinguishes this variant in the README's Files table.

---

## Checklist Before Submitting

- [ ] `design-md/{theme-id}/` directory created with exactly 4 files
- [ ] `{theme-id}` is lowercase, hyphen-separated, unique, and stable
- [ ] DESIGN.md has all 9 sections with no placeholder text
- [ ] Every CSS value in DESIGN.md is exact — no "approximately" or "similar to"
- [ ] README.md uses the exact screenshot URL format with `.webp` extension
- [ ] README.md alt text uses em dash (`—`) not hyphen (`-`)
- [ ] `preview.html` and `preview-dark.html` match the values in DESIGN.md
- [ ] Run `pnpm thumbnails` from `preview/` to generate local thumbnails after screenshots are uploaded to R2

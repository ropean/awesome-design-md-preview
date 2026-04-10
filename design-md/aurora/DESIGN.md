# Design System Inspiration: Aurora

## 1. Visual Theme & Atmosphere

Aurora is the digital manifestation of the northern lights — an interface that lives inside a starless sky where light is generated from within rather than reflected from above. The canvas is not black but a deep chromatic darkness: a diagonal gradient flowing from **Void Violet** (`#2e1065`) through **Abyss Fuchsia** (`#4a044e`) to **Deep Indigo** (`#1e1b4b`). This three-stop gradient creates a living background that shifts hue as the eye travels across it, mimicking the atmospheric bands of an actual aurora borealis.

Everything floating over this background is glass. Cards, panels, and navigation bars are built from **glassmorphism** — surfaces with `rgba(255, 255, 255, 0.05)` fill and `backdrop-filter: blur(12px)`. They do not hide the aurora behind them; they refract it, adding depth without adding weight. When elements are activated or hovered, the glass brightens slightly (`rgba(255, 255, 255, 0.10)`), suggesting illumination from within.

The accent system is the aurora itself: a **violet-to-fuchsia gradient** (`#a78bfa → #e879f9`) that appears on primary buttons, links, selected states, and focus rings. This gradient is never used on backgrounds — it exists purely as a signal of interactivity. Secondary decorative use on scrollbars and selection highlights reinforces the palette without overusing it.

Typography is clean and geometric. **Space Grotesk** at display sizes brings a subtle cosmic geometry — its slightly quirky letterforms read as intelligent and forward-looking without being aggressive. **Inter** handles body copy with maximum legibility. Text is always light: white-violet at primary, softer violet for secondary, and a medium violet for muted/tertiary content.

**Key Characteristics:**
- Diagonal three-stop background gradient: `#2e1065 → #4a044e → #1e1b4b` — the aurora canvas
- Glassmorphism surfaces: `rgba(255,255,255,0.05)` + `backdrop-filter: blur(12px)` — light refracts, doesn't block
- Violet-to-fuchsia gradient (`#a78bfa → #e879f9`) as the sole interactive accent
- Violet-tinted glow shadows (`rgba(139, 92, 246, 0.30)`) — light emits, doesn't cast
- Near-invisible white borders (`rgba(255,255,255,0.10)`) — containment without weight
- Space Grotesk for display headlines, Inter for body — geometric clarity over decorative warmth
- Pill-shaped interactive elements (`border-radius: 999px` for tags, `8–12px` for buttons)
- All text in the violet-50 / violet-100 / violet-300 luminance range — nothing harsh white

## 2. Color Palette & Roles

### Background Gradient
- **Void Violet** (`#2e1065`): Gradient start — deepest violet, the darkest point of the sky.
- **Abyss Fuchsia** (`#4a044e`): Gradient midpoint — adds warmth and chromatic richness.
- **Deep Indigo** (`#1e1b4b`): Gradient end — cools the palette, creates atmospheric depth.
- CSS: `background: linear-gradient(135deg, #2e1065 0%, #4a044e 50%, #1e1b4b 100%)`

### Glass Surfaces
- **Glass 05** (`rgba(255, 255, 255, 0.05)`): Default card and panel surface. Nearly invisible — the aurora shows through.
- **Glass 10** (`rgba(255, 255, 255, 0.10)`): Hover state for interactive glass surfaces.
- **Glass 20** (`rgba(255, 255, 255, 0.20)`): Active/pressed state, raised panels.
- **Glass Active** (`rgba(167, 139, 250, 0.15) → rgba(232, 121, 249, 0.15)`): Selected card gradient tint.

### Text
- **Aurora White** (`#f5f3ff`): Primary text (Tailwind violet-50). Not pure white — carries a faint violet warmth.
- **Aurora Pale** (`#ede9fe`): Secondary text (violet-100). Clearly readable, slightly receded.
- **Aurora Mist** (`#c4b5fd`): Tertiary / muted text (violet-300). Used for metadata, timestamps, placeholders.
- **Text on Gradient** (`#ffffff`): Text placed directly on the violet-fuchsia gradient button.

### Accent (The Aurora Light)
- **Violet Light** (`#a78bfa`): Accent start — violet-400. Used as gradient origin, icon color, link default.
- **Fuchsia Light** (`#e879f9`): Accent end — fuchsia-400. Gradient terminus, energetic highlight.
- **Accent Mid** (`#c084fc`): Midpoint — purple-400. Used for focus rings, single-color accent contexts.
- **Accent Deep** (`rgba(139, 92, 246, 0.30)`): Violet-500 at 30% — glow shadow color.
- **Accent Subtle** (`rgba(167, 139, 250, 0.15)`): Tint background for selected/active states.

### Borders
- **Glass Border** (`rgba(255, 255, 255, 0.10)`): Default border — white at 10% on dark glass.
- **Active Border** (`rgba(167, 139, 250, 0.50)`): Violet at 50% — selected card left-border, focus.
- **Glow Border** (gradient `#a78bfa → #e879f9`): Decorative gradient border on premium containers.

### Interactive States
- **Hover**: surface brightens from Glass 05 → Glass 10
- **Active**: `rgba(167, 139, 250, 0.20)` violet tint + `rgba(167, 139, 250, 0.50)` border
- **Focus ring**: `rgba(192, 132, 252, 0.50)` — 3px outline, 2px offset

## 3. Typography Rules

### Font Family
- **Display / UI**: `Space Grotesk`, fallbacks: `Inter, -apple-system, system-ui, sans-serif`
- **Body**: `Inter`, fallbacks: `-apple-system, system-ui, sans-serif`
- **Monospace**: `JetBrains Mono`, fallbacks: `Fira Code, SF Mono, Consolas, monospace`

Space Grotesk is used for headings, navigation, and UI labels. Its geometric construction and slightly quirky details — particularly the lowercase `a` and `g` — give Aurora a personality that sits between technical and poetic. Inter handles all body copy where maximum legibility over long passages matters.

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Hero | Space Grotesk | 56px (3.50rem) | 700 | 1.07 | -0.02em | Page title, maximum impact |
| Display | Space Grotesk | 40px (2.50rem) | 700 | 1.10 | -0.01em | Section hero headlines |
| Heading 1 | Space Grotesk | 32px (2.00rem) | 600 | 1.20 | -0.01em | Major section headers |
| Heading 2 | Space Grotesk | 24px (1.50rem) | 600 | 1.30 | normal | Sub-section titles |
| Heading 3 | Space Grotesk | 20px (1.25rem) | 600 | 1.40 | normal | Card titles |
| UI Label | Space Grotesk | 14px (0.88rem) | 500 | 1.40 | 0.01em | Nav items, button text, tags |
| Body | Inter | 16px (1.00rem) | 400 | 1.60 | normal | Standard reading text |
| Body Small | Inter | 14px (0.88rem) | 400 | 1.50 | normal | Secondary descriptions |
| Caption | Inter | 12px (0.75rem) | 400 | 1.40 | 0.02em | Metadata, timestamps, badges |
| Code | JetBrains Mono | 14px (0.88rem) | 400 | 1.60 | normal | Inline code, terminal output |

### Principles
- **Gradient headings**: Hero and Display headings use a CSS gradient text treatment — `background: linear-gradient(90deg, #a78bfa, #e879f9); -webkit-background-clip: text; color: transparent`. This reserves the aurora gradient for titles that anchor each section.
- **Weight restraint**: Only 400 (body), 500 (labels), 600 (headings), and 700 (hero). No 300 or 800+.
- **Negative tracking at large sizes only**: `-0.02em` at hero, `-0.01em` at display/heading. Body copy runs at `normal` tracking.
- **Luminous hierarchy**: Text color carries more hierarchy signal than weight does. Primary → Secondary → Muted progression uses violet-50 → violet-100 → violet-300.

## 4. Component Stylings

### Buttons

**Primary (Gradient CTA)**
- Background: `linear-gradient(135deg, #a78bfa, #e879f9)` (violet to fuchsia)
- Text: `#ffffff`
- Padding: 10px 24px
- Border-radius: 8px
- Border: none
- Hover: gradient brightens, `box-shadow: 0 4px 20px rgba(139, 92, 246, 0.50)`
- Active: gradient darkens slightly, scale(0.98)
- Focus: `outline: 3px solid rgba(192, 132, 252, 0.50)`, `outline-offset: 2px`

**Ghost / Secondary**
- Background: `rgba(255, 255, 255, 0.05)`
- Text: `#ede9fe` (violet-100)
- Border: `1px solid rgba(255, 255, 255, 0.15)`
- Border-radius: 8px
- Hover: background → `rgba(255, 255, 255, 0.10)`, border → `rgba(255, 255, 255, 0.25)`

**Link Button**
- Background: transparent
- Text: `#a78bfa` (violet-400)
- Hover: text → `#e879f9` (fuchsia-400), underline appears
- No border or padding

### Cards & Containers

**Default Glass Card**
- Background: `rgba(255, 255, 255, 0.05)`
- Border: `1px solid rgba(255, 255, 255, 0.10)`
- Border-radius: 12px
- Backdrop-filter: `blur(12px)`
- Box-shadow: `0 8px 32px rgba(0, 0, 0, 0.30)`

**Interactive Glass Card (hover)**
- Background: `rgba(255, 255, 255, 0.10)`
- Box-shadow: `0 8px 32px rgba(139, 92, 246, 0.30)` — violet glow intensifies

**Selected Card**
- Background: `linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(232, 121, 249, 0.15))`
- Border-left: `3px solid rgba(167, 139, 250, 0.60)`
- Box-shadow: `0 8px 32px rgba(139, 92, 246, 0.35)`

### Inputs & Search

- Background: `rgba(255, 255, 255, 0.05)`
- Text: `#f5f3ff`
- Placeholder: `#c4b5fd` (violet-300)
- Border: `1px solid rgba(255, 255, 255, 0.15)`
- Border-radius: 8px (rectangular fields) or `999px` (search pill)
- Focus border: `1px solid rgba(167, 139, 250, 0.60)`
- Focus shadow: `0 0 0 3px rgba(192, 132, 252, 0.25)`
- Backdrop-filter: `blur(8px)`

### Navigation

- Background: `rgba(255, 255, 255, 0.05)`
- Backdrop-filter: `blur(16px) saturate(150%)`
- Border-bottom: `1px solid rgba(255, 255, 255, 0.08)`
- Text: `#f5f3ff`
- Height: 64px
- Logo / title: gradient text `#a78bfa → #e879f9`

### Tags & Badges

- Background: `rgba(167, 139, 250, 0.15)` (default) or `rgba(232, 121, 249, 0.15)` (accent)
- Text: `#c4b5fd` (default) or `#e879f9` (accent)
- Border: `1px solid rgba(167, 139, 250, 0.25)`
- Border-radius: `999px` (full pill)
- Padding: 3px 10px
- Font: 12px Space Grotesk weight 500

### Distinctive Elements

**Gradient Text Heading**
- `background: linear-gradient(90deg, #a78bfa 0%, #e879f9 100%)`
- `-webkit-background-clip: text; -webkit-text-fill-color: transparent`
- Applied to hero and display headings for maximum aurora impact

**Glow Shadow**
- `box-shadow: 0 0 20px rgba(139, 92, 246, 0.20)` — ambient violet glow on selected/focus states
- Not used on default resting elements — reserved to signal elevation or selection

**Scrollbar**
- Thumb: `rgba(139, 92, 246, 0.40)` (violet)
- Thumb hover: `rgba(167, 139, 250, 0.65)` (lighter violet)
- Track: transparent

## 5. Layout Principles

### Spacing System
- Base unit: 8px
- Component scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px
- Internal component padding: 16px (compact), 20px (default), 24px (relaxed)
- Card gap: 12px (dense list) or 16px (grid)
- Section gap: 48px–64px

### Grid & Container
- Max content width: 1280px
- Sidebar: fixed 280–320px
- Content panel: fluid, takes remaining space
- The background gradient spans the full viewport — it is the canvas, not a section

### Whitespace Philosophy
- **Glass breathes**: Glass cards need space around them to show the aurora background they're floating over. Minimum 16px gap between glass surfaces.
- **Depth through layers**: Multiple glass layers at different blur/opacity levels create perceived z-depth without shadows.
- **Gradient canvas is always visible**: Layout never covers the entire viewport with opaque surfaces. The background aurora is always partially visible somewhere on screen.

### Border Radius Scale
- **4px**: Smallest — badges, inner chips
- **8px**: Standard — buttons, inputs, smaller cards
- **12px**: Card default — the dominant Aurora shape
- **16px**: Large panels, modals
- **999px**: Pills — tags, search bar, scrollbar thumb

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Canvas (Level 0) | Aurora gradient background | Page canvas — always visible |
| Glass 1 | `rgba(255,255,255,0.05)` + blur(12px) | Default cards, panels, nav |
| Glass 2 | `rgba(255,255,255,0.10)` + blur(12px) | Hovered cards, raised containers |
| Glass 3 | `rgba(255,255,255,0.20)` + blur(16px) | Active panels, dropdowns |
| Glow | Glass 2 + `box-shadow: 0 8px 32px rgba(139,92,246,0.30)` | Selected items, focus states |
| Overlay | `rgba(0,0,0,0.60)` scrim | Modal backdrop |

**Shadow Philosophy**: Aurora does not cast shadows — it emits light. Instead of dark drop-shadows, elevated elements gain a violet glow (`box-shadow` in rgba violet). This reinforces the luminescence metaphor: selected cards don't cast shadows downward, they glow outward. The glow is always in the `rgba(139, 92, 246, …)` violet family, never gray or black.

## 7. Do's and Don'ts

### Do
- Use the `135deg` background gradient direction consistently — diagonal matches the aurora angle
- Apply `backdrop-filter: blur(12px)` on all glass surfaces — without blur, the glass effect collapses
- Use violet glow (`rgba(139, 92, 246, 0.30)`) for elevation signals instead of dark shadows
- Keep gradient text (violet → fuchsia) reserved for headings and key accent text only
- Use pill shapes (`999px`) for tags and secondary UI elements — softness contrasts the dark canvas
- Maintain the glass hierarchy: resting at 5% opacity, hover at 10%, active at 20%
- Use `#c4b5fd` (violet-300) for placeholder and muted text — it reads as "dark" against the aurora without being harsh

### Don't
- Don't use opaque backgrounds for cards — glass is the identity; opacity destroys it
- Don't introduce warm colors (orange, yellow, green) — the entire palette lives in the violet/fuchsia/indigo family
- Don't apply the gradient to body text — gradient text is for headings only, not paragraphs
- Don't use pure white (`#ffffff`) for text — use `#f5f3ff` (violet-50) for warmth consistency
- Don't apply hard drop-shadows — they suggest a sun-lit world; Aurora is self-luminous
- Don't use flat solid-color backgrounds for panels — all surfaces should use glass opacity
- Don't use border-radius under 4px — Aurora is never sharp-cornered; all edges have at least minimal softening
- Don't stack more than 3 glass layers — blur compound effects become visually muddy

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <640px | Single column, collapsible sidebar becomes overlay |
| Tablet | 640–1024px | Compressed sidebar (icons only or hidden), 2-column content |
| Desktop | 1024–1280px | Full sidebar + content panel layout |
| Wide | >1280px | Centered max-width container, background aurora visible at edges |

### Touch Targets
- Primary CTA buttons: min 44px height
- Navigation links: 48px touch row height
- Card items: full-width tap targets with generous padding
- Tags/pills: min 28px height

### Collapsing Strategy
- Hero text: 56px → 40px → 32px as viewport narrows; gradient text maintained at all sizes
- Sidebar: persistent at desktop → icon-collapse at tablet → full-overlay at mobile
- Cards: maintain glass effect at all breakpoints — backdrop-filter is applied consistently
- Background gradient: always full-viewport, never cropped or tiled

### Image Behavior
- Avatars: circular, 32–48px, with subtle violet ring border on selected state
- No hero photography — Aurora is abstract; user avatars and icons are the only imagery
- Icons: line-style at 20px, tinted to violet-300 at rest, violet-400 on hover

## 9. Agent Prompt Guide

### Quick Color Reference
- Background: `linear-gradient(135deg, #2e1065 0%, #4a044e 50%, #1e1b4b 100%)`
- Glass surface: `rgba(255, 255, 255, 0.05)` + `backdrop-filter: blur(12px)`
- Glass hover: `rgba(255, 255, 255, 0.10)`
- Primary text: `#f5f3ff` (violet-50)
- Secondary text: `#ede9fe` (violet-100)
- Muted text: `#c4b5fd` (violet-300)
- Accent gradient: `linear-gradient(135deg, #a78bfa, #e879f9)`
- Border: `rgba(255, 255, 255, 0.10)`
- Glow shadow: `0 8px 32px rgba(139, 92, 246, 0.30)`
- Focus ring: `rgba(192, 132, 252, 0.50)`
- Scrollbar: `rgba(139, 92, 246, 0.40)`

### Example Component Prompts
- "Create a glass card: `background: rgba(255,255,255,0.05); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.10); border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.30)`. Title at 20px Space Grotesk weight 600, color `#f5f3ff`. Body at 14px Inter weight 400, color `#ede9fe`."
- "Design a primary button: `background: linear-gradient(135deg, #a78bfa, #e879f9); color: #ffffff; border-radius: 8px; padding: 10px 24px`. Hover: add `box-shadow: 0 4px 20px rgba(139,92,246,0.50)`. Focus: `outline: 3px solid rgba(192,132,252,0.50); outline-offset: 2px`."
- "Build a navigation bar: `background: rgba(255,255,255,0.05); backdrop-filter: blur(16px) saturate(150%); border-bottom: 1px solid rgba(255,255,255,0.08)`. Title uses gradient text: `background: linear-gradient(90deg, #a78bfa, #e879f9); -webkit-background-clip: text; -webkit-text-fill-color: transparent`."
- "Create a tag/badge: `background: rgba(167,139,250,0.15); border: 1px solid rgba(167,139,250,0.25); border-radius: 999px; padding: 3px 10px; color: #c4b5fd; font: 12px Space Grotesk weight 500`."
- "Design a search input: `background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 999px; color: #f5f3ff; backdrop-filter: blur(8px)`. Focus: `border-color: rgba(167,139,250,0.60); box-shadow: 0 0 0 3px rgba(192,132,252,0.25)`."

### Iteration Guide
1. Glass first — every surface must have `backdrop-filter: blur` and rgba opacity; opaque surfaces break the system
2. The gradient (`#a78bfa → #e879f9`) is interactive-only: buttons, links, focus indicators, selected states
3. Gradient text (heading treatment) is display-only: hero titles and section anchors, not body copy
4. Glow instead of shadow — replace any `box-shadow` in gray/black with violet rgba equivalent
5. Three text levels only: `#f5f3ff` (primary), `#ede9fe` (secondary), `#c4b5fd` (muted)
6. All borders at 10–15% white opacity — never solid white, never colored borders at full opacity
7. Pill shapes (`999px`) for small interactive elements; `12px` for cards; `8px` for buttons and inputs
8. The aurora background is always partially visible — never let layout cover the entire canvas

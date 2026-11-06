---
name: Project Workspace System
colors:
  surface: '#faf8ff'
  surface-dim: '#dbd9e0'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3fa'
  surface-container: '#efedf4'
  surface-container-high: '#e9e7ee'
  surface-container-highest: '#e3e1e8'
  on-surface: '#1b1b20'
  on-surface-variant: '#49454f'
  inverse-surface: '#2f3035'
  inverse-on-surface: '#f2f0f7'
  outline: '#7a7580'
  outline-variant: '#cac4d1'
  surface-tint: '#645494'
  primary: '#1b0748'
  on-primary: '#ffffff'
  primary-container: '#30205d'
  on-primary-container: '#9989cc'
  inverse-primary: '#cebdff'
  secondary: '#6a48ba'
  on-secondary: '#ffffff'
  secondary-container: '#a987fd'
  on-secondary-container: '#3d108d'
  tertiary: '#1d0052'
  on-tertiary: '#ffffff'
  tertiary-container: '#321c66'
  on-tertiary-container: '#9b86d6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e8ddff'
  primary-fixed-dim: '#cebdff'
  on-primary-fixed: '#200d4c'
  on-primary-fixed-variant: '#4c3d7a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#522da1'
  tertiary-fixed: '#e8ddff'
  tertiary-fixed-dim: '#cfbdff'
  on-tertiary-fixed: '#210656'
  on-tertiary-fixed-variant: '#4e3a84'
  background: '#faf8ff'
  on-background: '#1b1b20'
  surface-variant: '#e3e1e8'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

This design system drives a focused, modern collaborative workspace tailored for agile teams, product managers, and knowledge workers. It balances the tactile clarity and modularity of Kanban boards with the structured precision of multi-project roadmaps. 

The aesthetic is Modern Functional with an atmospheric touch of refined depth:
- **Clean and Intentional:** Utilitarian clarity governs layout, letting content and workflow states remain front and center without unnecessary visual ornamentation.
- **Approachable Sophistication:** Deep royal violet grounding contrasted with vibrant accent highlights provides a sense of premium craft without distracting from task velocity.
- **Calm Productivity:** Soft lilac-tinted neutral canvas spaces ease visual fatigue over prolonged usage cycles, moving away from harsh pure grey or stark monochrome contrasts.

## Colors

The color palette centers on a disciplined violet architecture that balances authority, focus, and stateful clarity.

### Color Tokens & Roles
- **Primary (`#30205D`):** Deep brand purple. Anchors persistent primary navigation bars, main action targets, active workspace selectors, and key branding moments.
- **Secondary (`#7654C7`):** Vibrant violet accent. Utilized for interactive states, focused focus rings, primary CTA triggers, and active tab indicators.
- **Tertiary (`#4C3882`):** Medium deep purple. Bridges primary depth to hover states and highlighted subheaders.
- **Canvas / Neutral Ground (`#F5F3FA`):** Soft, tinted background providing low eye-strain contrast against pristine surfaces.
- **Surface Pure (`#FFFFFF`):** High-clarity white applied exclusively to floating Kanban cards, sheet modals, side-drawers, and input containers.

### Typography & Text Hierarchy
- **Text Primary (`#1E1638`):** Ultra-deep slate-purple, delivering crisp readability for headers and task names.
- **Text Secondary (`#5A5370`):** Muted slate-purple for metadata, timestamps, input placeholders, and sub-labels.
- **Text Tertiary / Muted (`#958FA5`):** Subtle tone for inactive icons, counter chips, and ghost borders.

### Status System & Badges
- **Backlog:** Background `#ECEAF2`, Text `#5A5370`, Border `#DCD7E6`
- **A fazer (To Do):** Background `#EEF2FF`, Text `#3730A3`, Border `#C7D2FE`
- **Em andamento (In Progress):** Background `#F4EFFE`, Text `#5925DC`, Border `#DDD0FC`
- **Em revisão (In Review):** Background `#FEF6EE`, Text `#B54708`, Border `#F9DBAF`
- **Concluído (Completed):** Background `#ECFDF3`, Text `#027A48`, Border `#A6F4C5`

## Typography

Typography is built entirely around `Inter` to deliver systematic precision across dense data-grids, complex boards, and granular metadata rows.

- **Display & Headlines:** Use tight negative letter-spacing (`-0.01em` to `-0.02em`) with semi-bold to bold weights to establish confidence and distinct visual hierarchy across dashboards.
- **Body:** Standard neutral letter spacing with relaxed proportional line heights ensuring reading comfort across long task descriptions and collaborative comments.
- **Labels & Microcopy:** `label-sm` leverages slight tracking (`+0.02em`) and weight `600` for clear legibility on compact status pills and metric markers.

## Layout & Spacing

The layout utilizes a flexible multi-pane system tailored for workflow states:

- **Structural Layout:** 
  - Collapsible primary navigation rail (fixed at 64px collapsed, 240px expanded).
  - Main workspace viewport operating as a horizontal fluid scroll for Kanban columns (fixed width 304px per column, with `1rem` gap between swimlanes).
  - Detail inspection drawer anchoring dynamically to the right (440px on desktop, full-width overlay on mobile).
- **Responsive Adaptations:**
  - **Desktop (>=1280px):** Multi-column board horizontal scroll, pinned sidebars, dual-pane viewing.
  - **Tablet (768px - 1279px):** Horizontal swipeable column canvas with off-canvas slide-over drawer; gutter set to `1.25rem`.
  - **Mobile (<768px):** Single-column stacked tab switch view or single column snap scroll with a persistent bottom quick-action navigation; gutters at `1rem`.

## Elevation & Depth

Visual hierarchy is articulated through structured surface layers paired with soft ambient violet tinting rather than standard black dropshadows:

- **Level 0 (Flat Surface / Canvas):** Neutral canvas `#F5F3FA` sits beneath all working planes.
- **Level 1 (Card & Column Surface):** White containers `#FFFFFF` bordered with an imperceptible hairline outline (`1px solid #ECE7F6`) and an ultra-diffused ambient shadow: `0 1px 3px rgba(48, 32, 93, 0.04), 0 1px 2px rgba(48, 32, 93, 0.02)`.
- **Level 2 (Hover & Active Drag Cards):** Lifted state during hover or interaction: `0 8px 16px -2px rgba(48, 32, 93, 0.08), 0 4px 6px -2px rgba(48, 32, 93, 0.03)` with border tint adjusting to `#DDD6ED`.
- **Level 3 (Modals, Context Menus, and Drawers):** High-priority overlays: `0 20px 24px -4px rgba(48, 32, 93, 0.12), 0 8px 8px -4px rgba(48, 32, 93, 0.04)` combined with a background scrim of `rgba(30, 22, 56, 0.4)`.

## Shapes

The interface embraces a modern, friendly geometry defined by soft curves that reduce task tension while keeping high structural alignment:

- **Base Radius (`0.5rem` / 8px):** Standard inputs, small badges, and action triggers.
- **Container Radius (`rounded-xl` / `1rem` / 16px):** Standard task cards, column grouping wrappers, popovers, and floating toolbars.
- **Macro Radius (`rounded-2xl` / `1.5rem` / 24px):** Primary app containers, sheet modals, quick capture panels, and dashboard summary widgets.
- **Full Pill (`9999px`):** Status chips, counter badges, and avatar frames.

## Components

### Buttons
- **Primary:** Solid `#30205D` background, text `#FFFFFF`, rounded `0.5rem`. Hover transitions to `#4C3882` with a subtle transform lift. Focus ring is `2px solid #7654C7` with a 2px offset.
- **Secondary:** Surface `#FFFFFF`, border `1px solid #DDD7E9`, text `#1E1638`. Hover state fills with `#F5F3FA`.
- **Ghost/Tertiary:** No border, transparent background, text `#5A5370`. Hover background `#F0EDF7`, text `#1E1638`.

### Cards & Task Items
- **Board Cards:** Built on `#FFFFFF` surfaces with `rounded-xl` (16px), bordered with `1px solid #EAE5F4`. Padding is configured using `space-md` (`0.75rem` internal padding). Cards showcase inline metadata (tags, assignees, subtask counts) with Lucide icon alignments at 14px size.
- **Interactive State:** Hover elevates cards using Level 2 depth and triggers quick-action handles (edit, move, assign).

### Status Badges & Chips
- Designed with full pill geometry (`9999px`), padding `0.25rem 0.625rem`, displaying `label-sm` uppercase-oriented microcopy.
- Always composed of their coordinated background, text, and border triad (e.g., Em andamento: `#F4EFFE` background, `#5925DC` text, `#DDD0FC` border).

### Input Fields & Controls
- **Inputs:** `#FFFFFF` background, border `1px solid #DDD7E9`, `rounded-md` (8px). Text color `#1E1638`, placeholder `#958FA5`. Focus state adopts a crisp `border-color: #7654C7` and `box-shadow: 0 0 0 3px rgba(118, 84, 199, 0.15)`.
- **Checkboxes:** Squared with 4px border radius. In checked state, fills with `#7654C7` with an internal white checkmark icon.

### Kanban Column Containers
- Outer shell background is `#F5F3FA` or `#EFEBF7` tint, `rounded-2xl` corners, with internal scroll padding. Headers feature the column title, task counter chip, and contextual action menus (`lucide-more-horizontal`).
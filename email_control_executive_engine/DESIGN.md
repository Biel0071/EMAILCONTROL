---
name: Email Control Executive Engine
colors:
  surface: '#0f131e'
  surface-dim: '#0f131e'
  surface-bright: '#353945'
  surface-container-lowest: '#0a0e19'
  surface-container-low: '#171b26'
  surface-container: '#1b1f2b'
  surface-container-high: '#262a35'
  surface-container-highest: '#313441'
  on-surface: '#dfe2f2'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dfe2f2'
  inverse-on-surface: '#2c303c'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#b7c8e1'
  on-secondary: '#213145'
  secondary-container: '#3a4a5f'
  on-secondary-container: '#a9bad3'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#e29100'
  on-tertiary-container: '#523200'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0f131e'
  on-background: '#dfe2f2'
  surface-variant: '#313441'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.005em
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.005em
  label-md:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style
This design system defines an authoritative, high-density corporate control center tailored for executive operations, triage automation, and enterprise-grade email management integrated directly with Gmail via secure OAuth.

The brand personality projects austere technical reliability, cryptographic confidence, and calculated efficiency. It serves directors, operations commanders, and corporate teams navigating high-stakes inbound communication. Rather than treating email as a conversational consumer chat, the interface approaches communication flows as an actionable telemetry stream.

The visual style combines **Technical Corporate Realism** and **Subtle Structural Glassmorphism**:
- Deep, obsidian graphite planes with subtle light attenuation.
- Razor-sharp 1px structural dividing lines instead of heavy drop shadows or decorative flourishes.
- Restrained, purposeful feedback cues—green represents verified synchronization, system health, and deliberate completion; controlled alerts (amber and crimson) punctuate the baseline only when an operational bottleneck demands executive intervention.
- Crisp, unadorned surfaces engineered to eliminate fatigue during multi-hour operational shifts.

## Colors
The color architecture establishes an immutable dark-first palette calibrated for sustained analytical focus and instantaneous priority routing.

### Core Canvas & Panels
- **Canvas Base (`#0D1117`)**: The deepest background layer, providing maximum contrast against foreground data.
- **Surface Elevation 1 (`#131722`)**: The baseline container for persistent navigation, sidebars, and application docks.
- **Surface Elevation 2 (`#161B26`)**: Operational cards, message preview lists, and active command panes.
- **Surface Elevation 3 (`#181E2A` & `#1E2638`)**: Hover states, interactive overlays, dropdown menus, and popovers.
- **Borders & Dividers**: Low-intensity precision separators (`#242D3D` for primary division, `#2D384D` for elevated borders and interactive borders on hover).

### Accent & Primary Action
- **Emerald Green / Forest Tech (`#10B981`)**: The master action color. Denotes system integrity, active Google OAuth sync, positive command triggers, and zero-state resolution. Hover states transition to `#059669`; subtle outlines and focus halos leverage `#34D399`.

### Operational Severity & Priority Matrix
- **Crítico (P1)**: Text/Icon `#EF4444`, background `rgba(127, 29, 29, 0.15)`, border `rgba(239, 68, 68, 0.32)`. Reserved strictly for VIP breaches, SLA timeouts, or sync interruptions.
- **Alta (P2)**: Text/Icon `#F59E0B`, background `rgba(120, 53, 15, 0.15)`, border `rgba(245, 158, 11, 0.30)`. Dictates impending deadlines, board-level inquiries, and priority contracts.
- **Média / Pendente (P3)**: Text/Icon `#EAB308`, background `rgba(113, 63, 18, 0.12)`, border `rgba(234, 179, 8, 0.25)`. Acknowledged tasks and cross-functional delegations.
- **Baixa / Informativo (P4)**: Text/Icon `#64748B`, background `rgba(30, 41, 59, 0.35)`, border `rgba(100, 116, 139, 0.20)`. System telemetry, routine logs, newsletters, and informational pings.
- **Resolvido / Sincronizado**: Text/Icon `#10B981`, background `rgba(16, 185, 129, 0.12)`, border `rgba(16, 185, 129, 0.25)`.

## Typography
This design system employs **Inter** across all typographical scales to guarantee geometric stability, high tabular legibility, and neutral character rendering in dense tabular formats.

### Typographical Principles
- **Monospaced Numbering (tnum)**: All numeric metadata (timestamps, inbox counts, unread counters, SLA countdowns) must activate OpenType tabular figures (`font-variant-numeric: tabular-nums`) to prevent optical layout jittering during real-time sync refreshes.
- **Hierarchy via Weight and Tint**: Instead of escalating font sizes, distinction is created via font weight transitions (`400` body vs `600` titles) paired with muted text values (Primary: `#F8FAFC`, Secondary: `#94A3B8`, Tertiary/Metadata: `#64748B`).
- **Caps for Control Tags**: Micro labels and priority markers (`label-sm`) utilize uppercase styling paired with expanded tracking (`letterSpacing: 0.05em`) for immediate peripheral identification.

## Layout & Spacing
The operational architecture is structured as a **3-Pane Orchestration Console** designed for zero-latency triage:

1. **Primary Control Sidebar (Fixed, 260px)**: Anchors workspace navigation categorized under four distinct groups:
   - *Atenção*: Critical inbox, escalations, priority flags.
   - *Inteligência*: Automatic clustering, AI summaries, VIP routing.
   - *Controle*: Rules, routing, automated reply flows, queue health.
   - *Sistema*: OAuth credentials, Gmail API sync quota, audit logs.
2. **Master Topbar (Fixed height, 52px)**: Houses connection telemetry, sync state indicator, latency status, cross-mailbox switcher, and universal command palette trigger (`Cmd + K`).
3. **Operational Feed / Queue Pane (Flexible or 380px–460px)**: Dense listing of prioritized threads.
4. **Execution Inspector (Remaining viewport or dynamic overlay)**: Full thread inspection, sender authentication telemetry, raw headers, and direct response actions.

### Spacing Discipline
The spacing scale is locked to a 4px sub-grid with tight compact rhythm:
- Compact card padding uses `space-md` (12px) to optimize vertical scanning density.
- Section separators in the sidebar use `space-lg` (20px).
- Micro badges and status dots utilize `space-xs` (4px) margins.

## Elevation & Depth
Depth in this design system is achieved through **micro-tonal surface layering and luminous low-contrast contours**, avoiding heavy atmospheric shadows.

- **Level 0 (Canvas Base - `#0D1117`)**: Unreceptive, stationary foundation.
- **Level 1 (Dock & Sidebars - `#131722`)**: Structural frames separated by a 1px vertical border (`#242D3D`).
- **Level 2 (Panels, Rows, and Cards - `#161B26`)**: Encased in a uniform 1px border (`#242D3D`). Hovering shifts the border to `#2D384D` and subtly shifts the surface to `#181E2A`.
- **Level 3 (Modals, Command Palettes, Float Overlays - `#1E2638`)**: Backed by `backdrop-filter: blur(12px)` and bounded by a 1px semi-translucent border (`rgba(255, 255, 255, 0.08)`). Elevated with a precise, low-spread ambient shadow: `0 12px 32px -4px rgba(0, 0, 0, 0.6)`.
- **Focus Rings**: Never rely on default browser outlines. Elements use an inward-facing 1px ring or a 2px outer outline in `rgba(16, 185, 129, 0.45)`.

## Shapes
The shape language follows a disciplined, semi-squared industrial geometry (`roundedness: 1`):
- Standard control elements (inputs, buttons, item cards, tooltips) use **4px border-radius (`0.25rem`)**.
- Flyout panels, dialogs, and large message inspector shells use **8px border-radius (`0.5rem`)**.
- The only rounded-full elements permitted are **Status Indicator Dots** (4px–6px perfect circles) and **Gmail Avatar Badges**. This restraint reinforces the professional, non-playful posture of the tool.

## Components

### Buttons
- **Primary (Execute/Send/Resolve)**: Solid `#10B981` background, `#0B1E17` contrast text, font weight `500`. On hover: `#059669`. Focus: 2px ring `#34D399` with 1px offset.
- **Secondary (Inspect/Filter)**: Surface `#181E2A`, border 1px `#2D384D`, text `#F8FAFC`. On hover: border `#64748B`, background `#1E2638`.
- **Destructive / Override**: Background `rgba(239, 68, 68, 0.1)`, border 1px `rgba(239, 68, 68, 0.3)`, text `#EF4444`. On hover: background `#EF4444`, text `#FFFFFF`.

### Badges & Priority Chips
- Height is locked to 20px for labels, 18px for micro chips.
- Composed of an icon/dot (6px diameter), uppercase text (`label-sm`), and a tinted background containing a 1px perimeter border.
- **Sync Status Badge**: Surface `rgba(16, 185, 129, 0.08)`, border `rgba(16, 185, 129, 0.25)`. Displays a stylized Google/Gmail letter mark, paired with a pulsating green indicator dot and the text `Gmail Conectado ●`.

### Thread & Email List Items
- Packed row density: 44px for compact mode, 60px for analytical mode.
- Left-edge priority stripe: 2px vertical color block indicating severity (P1 Red, P2 Amber, P3 Yellow, P4 Slate).
- Text clamp: Single-line subject line combined with inline snippet in `#64748B`.
- Trailing metadata displays time elapsed in monospaced format (`tnum`).

### Input Fields & Search Bars
- Background: `#131722`. Border: 1px `#242D3D`. Text: `#F8FAFC`, placeholder `#475569`.
- Integrated keyboard shortcut indicators (e.g., `⌘K`, `/`) styled with a 1px border keycap appearance (`#1E2638`).
- Focus state: Border `#10B981`, no expansion or offset.

### Selection Controls (Checkboxes & Toggles)
- Checkbox: 14x14px box, 2px corner radius, `#131722` fill, 1px `#2D384D` border. When checked: `#10B981` fill with an inset charcoal checkmark.
- Toggles: 28x16px track, flat 12px circular pip. Green track active, dark slate inactive.

### Telemetry & Rate-Limit Cards
- Monitored counters (Gmail API quota, Inbound Velocity, Queue SLA) use compact, frameless cards.
- Background: `#161B26`, border: 1px `#242D3D`. Include subtle horizontal progress bars with `#10B981` fills on a `#1E2638` base rail.
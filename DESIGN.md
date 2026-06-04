---
name: PRSM Allergy Foundation
description: A warm, trustworthy, evidence-based identity for an allergy research nonprofit.
colors:
  research-teal: "#01d1d1"
  research-teal-deep: "#008080"
  research-teal-wash: "#01d1d114"
  foundation-blue: "#0A6C95"
  foundation-blue-deep: "#054d6f"
  anchor-navy: "#1a2e3b"
  pale-horizon: "#f6fbfd"
  surface-off-white: "#f9f9f9"
  body-slate: "#425466"
  text-mid: "#555555"
  text-muted: "#666666"
  border-mist: "#dae5ed"
  error-rose: "#ffb3b3"
typography:
  display:
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "2.7rem"
    fontWeight: 700
    lineHeight: 1.1
  headline:
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
  xl: "32px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
components:
  button-primary:
    backgroundColor: "{colors.research-teal-deep}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "12px 40px"
  button-primary-hover:
    backgroundColor: "#006666"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "12px 40px"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "{colors.research-teal-deep}"
    rounded: "{rounded.lg}"
    padding: "10px 38px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.anchor-navy}"
    rounded: "0"
    padding: "8px 12px"
---

# Design System: PRSM Allergy Foundation

## 1. Overview

**Design character: warm, purposeful, trustworthy.**

PRSM Allergy Foundation serves two audiences at once: donors deciding whether to give, and community members looking for awareness, events, and connection. The design has to earn trust quickly and stay human while doing it. The palette is neither clinical nor sentimental; it is clear, optimistic, and grounded in evidence. Every element is deliberate; nothing decorates without earning its place.

The system is light-mode because the experience belongs to someone browsing at home, in warm ambient light, deciding whether to trust an organization with their donation or involvement. Dark surfaces would feel institutional at best, exclusionary at worst. Light surfaces convey openness. Research Teal and Foundation Blue carry the brand: vivid, specific, trustworthy. The dark Anchor Navy footer grounds the page, the weight that says this organization will still be here tomorrow.

What this system explicitly rejects: the generic charity template (three-column identical icon-card grids, large orange CTAs on white, stock-photo smiling-doctors aesthetic, bold "DONATE NOW" hero banners), the hero-metric template (giant number + label + gradient accent), and cold clinical aesthetics (white-on-white with blue accents, hospital-grade sterility). Warmth here comes from restraint and specificity, not decoration.

**Key Characteristics:**
- Evidence-based optimism: color signals precision and progress, not sentiment
- Two-voice color hierarchy: Research Teal for accents and state; Foundation Blue for depth and structure
- Unhurried typography: generous line-heights, clear weight contrast, never compressed
- Conviction on hover: interactive surfaces commit fully, not halfway
- Tonal ambient elevation: shadows carry brand color, surfaces are flat at rest

## 2. Colors: The Research Palette

A light, tonal system anchored by two blue-green voices and grounded in dark Anchor Navy. The palette reads distinctive because of its specificity: the bright cyan-teal (`#01d1d1`) is not the typical muted medical teal, and it lives in deliberate tension with the deeper Foundation Blue.

### Primary
- **Research Teal** (`#01d1d1`): The accent voice. Used for interactive underlines, event date text, focus borders, and progress fills. Its vividness communicates confidence; never used as a flat fill on large surfaces.
- **Research Teal Deep** (`#008080`): The action voice. Used for all filled CTA buttons, success confirmations, and form focus ring color. Classic teal at higher saturation and lower lightness than Research Teal; it has gravity.
- **Research Teal Wash** (`#01d1d114`): The ambient voice. A near-transparent tint used for alternating section backgrounds (events section, fundraiser section). So light it barely reads; just enough to mark a boundary without visual noise.

### Secondary
- **Foundation Blue** (`#0A6C95`): Used in gradients (newsletter background, gallery overlays), as the deeper layer behind Research Teal. Signals institutional trust; the work is serious.
- **Foundation Blue Deep** (`#054d6f`): The gradient endpoint only. Never used as a standalone flat fill.

### Neutral
- **Anchor Navy** (`#1a2e3b`): Footer background, display heading color. The heaviest surface in the system. Its presence grounds the page.
- **Pale Horizon** (`#f6fbfd`): Page background, hero background. A barely-there cool tint toward brand hue; warmer than pure white, cooler than cream.
- **Surface Off-White** (`#f9f9f9`): Card backgrounds, section fillers. One step richer than Pale Horizon.
- **Body Slate** (`#425466`): Hero subtitles, secondary paragraphs. Mid-weight; not display-dark, not muted.
- **Text Mid** (`#555555`): Card body copy, descriptions.
- **Text Muted** (`#666666`): Location metadata, captions.
- **Border Mist** (`#dae5ed`): Button secondary outline, dividers.
- **Error Rose** (`#ffb3b3`): Error messages on dark/colored backgrounds (newsletter section).

**The Two-Voice Rule.** Research Teal and Foundation Blue are the only colors that carry brand identity. All other surfaces are neutrals. A button can be teal. A card cannot be blue just because it is important.

**The Pale Horizon Rule.** The page background is never pure white. Use Pale Horizon (`#f6fbfd`) for any content surface at rest. Pure white is reserved for elevated containers: cards, form inputs, and the footer surface content sits on.

## 3. Typography

**Body Font:** Inter (with Helvetica Neue, Arial, sans-serif fallback)

**Character:** Inter's humanist geometry reads as approachable expertise: precise enough to signal research credibility, open enough to not feel academic. No display typeface counterpart; Inter carries the full range from hero display to label copy.

**The Single Family Rule.** This system uses one typeface. Hierarchy comes entirely from scale and weight contrast, never from pairing. If hierarchy feels flat, the solution is to increase weight or scale contrast, not to introduce a second font.

### Hierarchy
- **Display** (700, 2.7rem, line-height 1.1): Hero headlines only. One per page. The primary landing statement.
- **Headline** (700, 2rem, line-height 1.2): Section titles ("Who We Are", "Upcoming Events", "Support Our Mission"). The structural anchors.
- **Title** (700, 1.75rem, line-height 1.3): Sub-section headings, fundraiser names. Subordinate to Headline, still dominant.
- **Body** (400, 1rem, line-height 1.6): All primary content. Max line length: 65-75ch. Body text never runs full viewport width on desktop.
- **Label** (600, 0.85rem, line-height 1.4, letter-spacing 0.05em): Event dates, category tags, stat labels, navigation. The tracked spacing marks these as metadata.

## 4. Elevation

This system uses **tonal ambient elevation**: shadows are tinted with brand colors, not neutral black. Surfaces are flat at rest; depth appears as a response to state (hover lift, focused input) or to separate a container from its background (hero image frame, modal).

**The Tonal Shadow Rule.** All shadows use rgba-tinted brand navy (`rgba(24, 49, 79, 0.X)`) or brand blue (`rgba(10, 108, 149, 0.X)`). Neutral gray shadows are prohibited; they read as disconnected from the palette.

**The Flat-By-Default Rule.** Components have no shadow at rest unless they are elevated containers. Interactive elements earn their shadow on hover; they do not arrive with one.

### Shadow Vocabulary
- **Ambient resting** (`0 2px 8px rgba(24, 49, 79, 0.08)`): Cards and containers at rest. Barely perceptible; the perception of surface, not a statement.
- **Ambient hover** (`0 8px 16px rgba(10, 108, 149, 0.15)`): Card hover lift. Extended reach, tinted toward primary blue.
- **Hero frame** (`0 8px 32px rgba(24, 49, 79, 0.07)`): Large image containers in hero/gallery. Enough to separate from Pale Horizon background.
- **Focus ring** (`0 0 0 3px rgba(0, 128, 128, 0.1)`): Input and button focus state. Soft teal glow; replaces the browser default outline entirely.

## 5. Components

### Buttons
Confident and purposeful. Hover states fully resolve; never a half-tint. Shape commits to function: filled means primary action, outlined means secondary, ghost means navigation.

- **Shape:** Gently rounded (16px radius). Substantial, not pill-shaped. Desktop padding: 12px 40px.
- **Primary:** Research Teal Deep (`#008080`) fill, white text, 2px border matching fill. Hover: deepens to `#006666`. Transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1).
- **Secondary:** White background, Research Teal Deep text, Border Mist (`#dae5ed`) outline at rest, shifts to `#008080` on hover. Background lifts to `#e6f7f7`.
- **Ghost:** No background, inherits parent text color. On hover: a 2px Research Teal (`#01d1d1`) underline animates left-to-right via `::after` pseudo-element (width: 0% to 100%, 0.3s cubic-bezier(0.4, 0, 0.2, 1)). Used exclusively in navigation.

### Cards / Containers
- **Corner Style:** 8px radius. Predictable, not decorative.
- **Background:** Surface Off-White (`#f9f9f9`) at rest. Pure white for elevated sub-containers inside cards (stat panels, progress bars).
- **Shadow Strategy:** Ambient resting at rest; ambient hover on pointer-enter.
- **Border:** None at rest. Side-stripe borders are prohibited (see Do's and Don'ts).
- **Internal Padding:** 24-32px desktop, 20px mobile.

**The Conviction Hover Rule.** Interactive cards (event tiles) fill completely with Foundation Blue (`#0A6C95`) on hover; all text inverts to white. No half-measures. The transition is 0.3s cubic-bezier(0.4, 0, 0.2, 1) via an absolutely-positioned `::before` pseudo-element, not a background-color change, so the animation feels like a surface covering rather than a color swap.

### Inputs / Fields
- **Style:** 1px solid `#e0e0e0` border, white background, 4px radius, 12px padding.
- **Focus:** Border shifts to `#008080`; focus ring `0 0 0 3px rgba(0, 128, 128, 0.1)` applied. No browser default outline.
- **Placeholder:** Text Muted (`#999999`).
- **Error:** On dark/colored backgrounds, use Error Rose (`#ffb3b3`). On white surfaces, border shifts to a red-tinted color.

### Navigation
- **Desktop:** Sticky white header, 1px bottom border (`#e0e0e0`). Logo and organization name left; navigation ghost buttons right. Current page should carry a permanent Research Teal underline.
- **Mobile:** Hamburger (3 bars, 25px wide, 3px height) transitions to X via CSS transform. Dropdown panel is full-width, white background, 1px bottom border, minimal shadow. Each item is a full-width tap target with 16px padding.
- **Typography:** 500 weight, 1rem. Navigation text is never bold; it serves, not commands.

### Newsletter Section (Signature Component)
A gradient-background band that switches the surface from light to dark for one scroll-section. `linear-gradient(135deg, #0A6C95 0%, #054d6f 100%)`. White text at 90% opacity. No card wrapper, no internal border. Form sits directly on the gradient surface. This is the one moment Research Teal yields to Foundation Blue as the dominant voice; the return to a light surface re-establishes teal's primacy.

## 6. Do's and Don'ts

### Do:
- **Do** use Research Teal (`#01d1d1`) for underlines, borders, metadata, event dates, and accent elements at no more than 10% of any given surface.
- **Do** use Research Teal Deep (`#008080`) as the only filled CTA button fill color. No other color gets a filled primary button.
- **Do** keep all body text at 65-75ch max-width. Never allow paragraphs to run full viewport width on desktop.
- **Do** use Anchor Navy (`#1a2e3b`) for the footer and for display-weight heading text on the darkest surfaces.
- **Do** let interactive cards commit fully on hover: complete Foundation Blue fill, full text inversion to white.
- **Do** tint all shadows with brand navy or brand blue. Never use `rgba(0, 0, 0, 0.X)` shadows.
- **Do** vary section backgrounds (Pale Horizon, Research Teal Wash, white, Foundation Blue gradient) to create vertical rhythm without border-based section separators.
- **Do** honor WCAG AA: 4.5:1 for body text, 3:1 for large text and interactive controls. Check contrast before shipping any new color pairing.
- **Do** respect `prefers-reduced-motion`: wrap all non-essential transitions and animations in a media query.

### Don't:
- **Don't** use side-stripe borders (`border-left` or `border-right` greater than 1px as a colored accent on cards, callouts, or list items). The current codebase uses this pattern on about-cards and event-cards; it should be replaced with background tints or no decoration as components are updated.
- **Don't** build the generic charity template: no three-column identical icon-card grids, no stock-photo smiling-doctors layout, no bold "DONATE NOW" billboard hero, no predictable three-feature row with icons.
- **Don't** use the hero-metric template: no giant statistic + small label + gradient accent block.
- **Don't** use neutral gray shadows (`rgba(0, 0, 0, 0.X)`). All shadows are tonal.
- **Don't** use pure white (`#ffffff`) or pure black (`#000000`) as base page colors. Use Pale Horizon for backgrounds; use Anchor Navy for the deepest text.
- **Don't** introduce a second typeface. If hierarchy feels insufficient, increase weight or scale contrast within Inter.
- **Don't** use gradient text (`background-clip: text` with a gradient fill). Use a solid color; emphasis through weight or scale.
- **Don't** animate CSS layout properties (width, height, padding, margin). Animate `transform` and `opacity` only.
- **Don't** use glassmorphism (backdrop-filter + semi-transparent cards) as decoration. If it appears, it must serve a specific functional purpose.

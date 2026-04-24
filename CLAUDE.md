# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running locally

No build step. Serve the repo root with any static file server:

```bash
python3 -m http.server 8080
# or
npx serve .
```

Then open `http://localhost:8080`.

## Deploying

Push to `main` — GitHub Actions (`.github/workflows/deploy.yml`) deploys automatically to GitHub Pages.

## Architecture

This is a **zero-build static site**: React 18, ReactDOM, and Babel Standalone are all loaded via CDN in `index.html`. JSX is transpiled in the browser at runtime.

Two files contain all the code:

- **`index.html`** — global CSS (custom properties, typography, animations, utility classes), CDN script tags, the `TWEAK_DEFAULTS` config object, `applyTweaks()`, and the root `App` component that composes sections.
- **`components.jsx`** — every section component. Loaded as `type="text/babel"` and exports all components to `window` at the bottom.

### CSS design tokens

All colors and radii are CSS custom properties on `:root` in `index.html`:

| Variable | Value | Usage |
|---|---|---|
| `--bg` | `#07071c` | Page background |
| `--surface` | `#0d0d24` | Card / section backgrounds |
| `--cyan` | `#2de8d4` | Primary accent (overrideable via TweaksPanel) |
| `--gold` | `#f0b040` | Secondary accent |
| `--muted` | `#6464a0` | Subdued text |
| `--text` | `#eeeef8` | Main text |

### Scroll animations

Every section uses the `useInView` hook (IntersectionObserver) + the `.reveal` / `.reveal.visible` CSS classes defined in `index.html`. Adding `transitionDelay` on individual elements staggers the entrance.

### TweaksPanel (edit mode)

`TweaksPanel` is a hidden overlay activated by a `postMessage` from a parent iframe (`__activate_edit_mode`). It lets an external embedding tool tweak accent color and hero background. The editable defaults live in `index.html` between the `/*EDITMODE-BEGIN*/` and `/*EDITMODE-END*/` markers — that's the only part an external tool writes.

### Content source

`uploads/landing_content_RU.md` is the copywriting reference. The actual rendered copy lives inline in `components.jsx` (data arrays: `CONVOS`, `COMPARE`, `SERVICES`, `ROADMAP`, `RESULTS`, `FAQS`).

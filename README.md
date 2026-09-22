# mandipsapkota.com.np

Personal site of Mandip Sapkota, full stack and mobile app developer in Nepal.
A single page built with Astro and plain CSS, with an optional voice and chat
assistant, plus the web prototype of the Veil game served from `/play/veil/`.

## Stack

- Astro 4, static output, no UI framework
- Plain CSS with custom properties, light and dark themes
- Source Serif 4 and Source Sans 3 from Google Fonts
- Inline SVG icons (`src/components/Icon.astro`), no icon font
- CSS 3D layer stack in the About section (`src/components/StackScene.astro`), no 3D library
- Images optimised at build time through `astro:assets`
- Contact form delivered by Web3Forms
- Assistant: OmniDimension agent embedded as a sandboxed iframe (see `docs/ai-assistant.md`)

## Working on it

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:4321`. `npm run build` writes the
static site to `dist/`.

Content lives in `src/data/`:

| File | What it holds |
| --- | --- |
| `site.ts` | Name, role, location, contact details, social links, navigation |
| `experience.ts` | Work history, education, certifications, languages |
| `projects.ts` | Project cards (covers in `src/assets/work`), their live links, and the undeployed coursework list |
| `skills.ts` | The toolkit groups |

The CV is served from `public/cv/Mandip-Sapkota-CV.pdf`. Project cards link
only to live projects; source code is not linked from the site.

Veil lives in `public/play/veil` (game files) and `src/pages/play/veil.astro`
(its page). It is a copy of the prototype in the separate `veil` project.

## Assistant

Set `PUBLIC_OMNIDIM_WIDGET_KEY` in `.env` (copy `.env.example`) to render the
assistant. Without it the site builds without any of the assistant UI. When
the content in `src/data/` changes, the agent prompt in
`docs/agent/prompt.json` should change with it.

## Deploying

Pushing to `main` deploys: a Cloudflare Worker named `portfoliowebsite` builds
the repo and serves `dist/`. The details, including the stale cache trap, are
in `docs/ai-assistant.md`.

## Checking the site in a real browser

`tools/browser-check.mjs` drives a headless Chromium (Edge by default, or the
path in `BROWSER_EXE`) over the DevTools protocol: it opens a URL at an emulated
viewport, runs one of the scripts in `tools/checks/` inside the page, reports
console errors and horizontal overflow, and saves a screenshot.

```bash
node tools/browser-check.mjs http://localhost:4321/ 1440 900 0 out/desktop tools/checks/interactions.js
node tools/browser-check.mjs http://localhost:4321/ 390 844 1 out/phone tools/checks/mobile-menu.js
```

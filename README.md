# mandipsapkota.com.np

Personal site of Mandip Sapkota, frontend and mobile app developer in Nepal.
A single page built with Astro and plain CSS, with an optional voice and chat
assistant.

## Stack

- Astro 4, static output, no UI framework
- Plain CSS with custom properties, light and dark themes
- Source Serif 4 and Source Sans 3 from Google Fonts
- Inline SVG icons (`src/components/Icon.astro`), no icon font
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
| `projects.ts` | Case studies (with screenshots in `src/assets/work`) and smaller projects |
| `skills.ts` | The toolkit groups |

The CV is served from `public/cv/Mandip-Sapkota-CV.pdf`.

## Assistant

Set `PUBLIC_OMNIDIM_WIDGET_KEY` in `.env` (copy `.env.example`) to render the
assistant. Without it the site builds without any of the assistant UI. When
the content in `src/data/` changes, the agent prompt in
`docs/agent/prompt.json` should change with it.

## Deploying

Pushing to `main` deploys: a Cloudflare Worker named `portfoliowebsite` builds
the repo and serves `dist/`. The details, including the stale cache trap, are
in `docs/ai-assistant.md`.

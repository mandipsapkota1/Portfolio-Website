# AI assistant (OmniDimension)

A portfolio concierge embedded on the site. It answers questions about
Mandip's background, stack and projects, answers general questions too, and
captures enquiries so they land in his inbox.

- **Agent:** `Mandip Sapkota Portfolio Assistant`, id `252073`
- **Model:** `gpt-4.1-mini`, temperature `0.4`
- **Voice:** ElevenLabs `AGTpoPSOpNvf1FxnDhdR` ("Patrick, Natural Conversation")
- **Dashboard:** https://www.omnidim.io
- **Prompt source of truth:** `docs/agent/prompt.json` (ten sections). The
  previous prompt is kept in `docs/agent/backup-2026-09-22-before-redesign.json`
  because agent versioning is not included in the current OmniDimension plan.

## How it is wired

| File | Role |
| --- | --- |
| `src/lib/omnidim.js` | Reads the key, derives both surface URLs. Build time only. |
| `src/components/AiAgent.astro` | Floating launcher, panel and all scoped styles. |
| `src/scripts/ai-agent.js` | Open/close, lazy mount, focus, placement rules. |
| `src/layouts/BaseLayout.astro` | Mounts `<AiAgent />` after the page slot. |
| `src/components/Assistant.astro` | The "Ask my assistant" section under the hero, with sample questions. |
| `src/components/Contact.astro` | "Chat with my assistant" and "Call it" buttons. |
| `src/components/Projects.astro` | "Try the assistant" button on the portfolio project card. |

Anything with a `data-ai-open` attribute opens the panel, so new entry points
need no changes to the script. `data-ai-open="voice"` opens straight into a
call; any other value (or none) opens chat.

### Why an iframe and not the embed script

The dashboard hands out a `<script>` snippet. We use the underlying iframe
(`widget_config.iframeUrl`) instead, for two reasons:

1. **Security.** A third party `<script>` executes on our origin with full
   access to the DOM, cookies and storage. A cross origin iframe cannot touch
   any of it.
2. **Design.** The script injects its own floating button with its own
   position and styling. The iframe lets the launcher and panel be built from
   this site's own tokens (`--surface`, `--accent`, `--font-sans`) so it matches
   both the light and the dark theme.

### Two surfaces: chat and voice

OmniDimension serves **two widgets off the same key**:

| Surface | URL | Panel tab |
| --- | --- | --- |
| Text chat | `https://www.omnidim.io/chat-widget?secret=KEY` | Chat (default) |
| Live voice call | `https://www.omnidim.io/voice-widget?secret=KEY` | Voice call |

The dashboard's **Widget Type** setting only decides which one *their loader
script* picks. Since we embed the iframes ourselves, both are offered and the
visitor chooses. Both stay mounted once used, so switching tabs does not
discard an in progress conversation.

### Voice needs microphone permission granted twice

This is the part that fails silently if you miss it.

1. **The iframe's `allow` attribute:** `allow="microphone; autoplay; clipboard-write"`. Already set.
2. **The site's `Permissions-Policy` response header,** set by the zone's
   **"Security headers"** Transform Rule in Cloudflare.

That rule used to send `microphone=()`, which disables the microphone for the
page *and every iframe inside it*. A voice call would have failed with no
console error and no visible reason. It now reads:

```
camera=(), microphone=(self "https://www.omnidim.io"), geolocation=(), payment=()
```

Camera, geolocation and payment stay fully locked. To verify from the live
site's console:

```js
document.featurePolicy.allowsFeature('microphone', 'https://www.omnidim.io')  // must be true
```

If you ever move the widget to another host, that origin has to be added here
too, or voice breaks.

### Performance

Both iframes are rendered with **no `src`**. Nothing is requested from
omnidim.io until the visitor opens the panel, and the voice surface is not
requested until they press Voice call. A visitor who only reads the page never
loads it.

### Placement rules

The launcher is fixed bottom right on every section. Over the footer's bottom
line it lifts clear rather than covering the copyright text, it hides while the
small screen menu is open (`body:has(#nav.is-open)`), and a `MutationObserver`
closes the panel if the menu opens. On screens under 600px the panel spans the
viewport width.

## Setup

1. Dashboard, the agent, Deploy / Integrate, **Web Widget**, copy the key.
2. Put it in `.env` (gitignored):
   ```
   PUBLIC_OMNIDIM_WIDGET_KEY=<key>
   ```
3. For production, the same value is set as a **Cloudflare build variable**
   (already done). See the deployment section below.

**With no key set, `AiAgent.astro` and `Assistant.astro` render nothing at
all** and the Contact and Projects entry points disappear. The site builds and
deploys exactly as before, which keeps forks and PR builds working.

## How this site actually deploys

Worth knowing, because the repo contains misleading leftovers.

`mandipsapkota.com.np` is served by the Cloudflare **Worker `portfoliowebsite`**,
which is connected to this GitHub repo and builds itself on every push:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Route | `mandipsapkota.com.np` (the `www` host 301s to the apex) |

So **pushing to `main` is the deploy.** Nothing needs to be run by hand.

**The edge can serve stale HTML after a deploy.** A successful build does not
guarantee the new page is being served: `index.html` has come back
`cf-cache-status: HIT` with the previous build, and a cache busting query
string did not help because the asset Worker's cache key ignores it. If a
deploy looks like it did nothing, purge before debugging anything else:
Caching, Configuration, Custom Purge, Hostname,
`mandipsapkota.com.np, www.mandipsapkota.com.np`.

`PUBLIC_OMNIDIM_WIDGET_KEY` lives in that Worker's **Builds, Variables and
secrets**, not in GitHub secrets. The build happens on Cloudflare, not in
GitHub Actions. A static assets Worker cannot take *runtime* variables; this is
a build time variable, which is what an Astro `import.meta.env` lookup needs.

Two leftovers that are not the deploy path:

- **GitHub Pages.** There is a `_github-pages-challenge` DNS TXT record and
  a `public/CNAME`. Pages does not serve this domain. Do not add a Pages
  workflow; it would create a second pipeline racing Cloudflare.
- **`npm run deploy`** (`astro build && wrangler versions upload`) uploads a
  version but does *not* activate it, so it never changes the live site.

`wrangler.jsonc` must keep `"name": "portfoliowebsite"`.

## Security

The key is **publishable, not secret**. It ships inside the built HTML because
the widget is an iframe keyed by it, the same model as a Stripe publishable
key. It cannot be hidden on a static site, and the env var only buys easy
rotation and a clean git history.

The control that actually matters is the **domain allowlist** on the agent in
the dashboard. Restrict it to `mandipsapkota.com.np` and `www.` so the key is
useless anywhere else.

### Cost

Calls bill at **$0.115/min** and this widget is publicly reachable, so a
per session cap is a cost control, not just UX. Currently
`max_call_duration_in_sec: 420` (7 minutes, about $0.80 worst case per
session). Watch the call log for abuse before raising it.

## Editing what the agent knows

The knowledge base is ten `context_breakdown` sections on the agent: Role and
Purpose, Answer Anything Properly, Voice and Style, About Mandip, Skills and
Stack, Education and Experience, Featured Projects, How You Are Built,
Capturing an Enquiry, Accuracy and Conduct. `docs/agent/prompt.json` holds the
exact text that is live.

**The agent is open domain on purpose.** It answers whatever a visitor asks,
in Nepali, English or Hindi, rather than deflecting anything that is not about
Mandip. Web search (DuckDuckGo) is enabled so it can handle current
information. The limits that remain are about truthfulness: no invented
clients or credentials, no quoted rates, no committed dates, and it may only
claim Mandip works in a technology that is actually listed (Python is not).

**The content mirrors the site, so it goes stale when the site changes.** The
site's facts live in `src/data/` (`experience.ts`, `projects.ts`, `skills.ts`,
`site.ts`). After editing any of them, update the matching section in
`docs/agent/prompt.json` and push it with `updateAgent`. Send `name`,
`welcome_message` and `context_breakdown` in one call, then `getAgent` to
confirm what persisted.

### What the API will not change

`widget_config` (the title, background and text colour of the bar the widget
draws inside the iframe) is read only through the API. Change it in the
dashboard under Deploy, Web Widget. The values that match the redesigned site
are title `Mandip Sapkota Portfolio Assistant`, background `#8a1c34`, text
`#ffffff`. After changing them, set `omnidimFrameBg` in `src/lib/omnidim.js`
to the same background so the panel does not flash a different colour while
the iframe loads. The conversation area itself is a fixed light theme that
OmniDimension does not expose.

## Enquiry capture

On call completion an email goes to `info@mandipsapkota.com.np` with a summary,
sentiment, and extracted fields: `visitor_name`, `visitor_email`,
`visitor_phone`, `enquiry_type`, `project_summary`, `timeline_and_budget`,
`follow_up_needed`.

Full transcripts are **not** included in the email, only the summary. Change
this via `post_call_actions.email.include` if you want the whole conversation.

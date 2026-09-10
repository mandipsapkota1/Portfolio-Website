# AI assistant (OmniDimension)

A portfolio concierge embedded on the site. It answers questions about
Mandip's background, stack and projects, and captures enquiries so they land
in his inbox.

- **Agent:** `Mandip Sapkota — Portfolio Assistant`, id `252073`
- **Model:** `gpt-4.1-mini`, temperature `0.4`
- **Voice:** ElevenLabs `AGTpoPSOpNvf1FxnDhdR` ("Patrick — Natural Conversation")
- **Dashboard:** https://www.omnidim.io

## How it is wired

| File | Role |
| --- | --- |
| `src/lib/omnidim.js` | Reads the key, derives both surface URLs. Build-time only. |
| `src/components/AiAgent.astro` | Launcher, panel and all scoped styles. |
| `src/scripts/ai-agent.js` | Open/close, lazy mount, focus, placement rules. |
| `src/layouts/BaseLayout.astro` | Mounts `<AiAgent />` after the page slot. |
| `src/components/Contact.astro` | Second entry point (`data-ai-open`). |

Anything with a `data-ai-open` attribute opens the panel, so new entry points
need no changes to the script.

### Why an iframe and not the embed script

The dashboard hands out a `<script>` snippet. We use the underlying iframe
(`widget_config.iframeUrl`) instead, for two reasons:

1. **Security.** A third-party `<script>` executes on our origin with full
   access to the DOM, cookies and storage. A cross-origin iframe cannot touch
   any of it.
2. **Design.** The script injects its own floating button with its own
   position and styling. The iframe lets the launcher and panel be built from
   this site's own tokens (`--glass`, `--yellow`, `--fhead`) so it matches.

### Two surfaces: chat and voice

OmniDimension serves **two widgets off the same key**:

| Surface | URL | Panel tab |
| --- | --- | --- |
| Text chat | `https://www.omnidim.io/chat-widget?secret=…` | Chat (default) |
| Live voice call | `https://www.omnidim.io/voice-widget?secret=…` | Call |

The dashboard's **Widget Type** setting only decides which one *their loader
script* picks. Since we embed the iframes ourselves, both are offered and the
visitor chooses. Anything on the page can request a surface directly:
`data-ai-open="voice"` opens the panel straight into a call — the Contact
section's "Talk to my AI" button does exactly that.

Both stay mounted once used, so switching tabs does not discard an
in-progress conversation.

### Voice needs microphone permission granted twice

This is the part that fails silently if you miss it.

1. **The iframe's `allow` attribute** — `allow="microphone; autoplay; clipboard-write"`. Already set.
2. **The site's `Permissions-Policy` response header** — set by the zone's
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
requested until they press Call — so a visitor who only reads the page, or
only uses chat, never loads it. Cost to the page as shipped: **+282
bytes** of JS.

### Placement rules

The launcher is fixed bottom-left, and is deliberately hidden in two places:

- **Over the hero** — `.home-btns` wraps at narrow widths and walks the
  "Start a Project" CTA into the same corner. It should not compete with the
  primary CTA regardless.
- **Over `.footer-bottom`** — it otherwise sits directly on top of the
  copyright line.

It also yields to the mobile nav drawer (`body:has(#navbar.open)`), and a
`MutationObserver` closes the panel if the drawer opens.

## Setup

1. Dashboard → the agent → Deploy / Integrate → **Web Widget** → copy the key.
2. Put it in `.env` (gitignored):
   ```
   PUBLIC_OMNIDIM_WIDGET_KEY=<key>
   ```
3. For production, the same value is set as a **Cloudflare build variable**
   (already done) — see the deployment section below.

**With no key set, `AiAgent.astro` renders nothing at all** — the site builds
and deploys exactly as before. That keeps forks and PR builds working.

## How this site actually deploys

Worth knowing, because the repo contains misleading leftovers.

`mandipsapkota.com.np` is served by the Cloudflare **Worker `portfoliowebsite`**,
which is connected to this GitHub repo and builds itself on every push:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Route | `mandipsapkota.com.np` (+ `www` CNAME, which 301s to apex) |

So **pushing to `main` is the deploy.** Nothing needs to be run by hand.

**The edge can serve stale HTML after a deploy.** A successful build does not
guarantee the new page is being served — `index.html` came back
`cf-cache-status: HIT` with the previous build, and a cache-busting query
string did not help because the asset Worker's cache key ignores it. If a
deploy looks like it did nothing, purge before debugging anything else:
Caching → Configuration → Custom Purge → Hostname →
`mandipsapkota.com.np, www.mandipsapkota.com.np`.

`PUBLIC_OMNIDIM_WIDGET_KEY` lives in that Worker's **Builds → Variables and
secrets**, not in GitHub secrets — the build happens on Cloudflare, not in
GitHub Actions. Note that a static-assets Worker cannot take *runtime*
variables; this is a build-time variable, which is what an Astro
`import.meta.env` lookup needs anyway.

Two leftovers that are not the deploy path, and should not be treated as one:

- **GitHub Pages.** There is a `_github-pages-challenge` DNS TXT record and
  a `public/CNAME`. Pages does not serve this domain. A
  `.github/workflows/deploy.yml` targeting Pages was deliberately left out of
  this branch — adding it would create a second pipeline racing Cloudflare.
- **`npm run deploy`** (`astro build && wrangler versions upload`) uploads a
  version but does *not* activate it, so it never changes the live site. Prefer
  pushing to `main`.

`wrangler.jsonc` must keep `"name": "portfoliowebsite"`. It previously said
`mandip-portfolio`, which is why Cloudflare raised a config-mismatch warning on
every build.

## Security

The key is **publishable, not secret**. It ships inside the built HTML because
the widget is an iframe keyed by it — the same model as a Stripe publishable
key. It cannot be hidden on a static site, and the env var only buys easy
rotation and a clean git history.

The control that actually matters is the **domain allowlist** on the agent in
the dashboard. Restrict it to `mandipsapkota.com.np` and `www.` so the key is
useless anywhere else.

### Cost

Calls bill at **$0.115/min** and this widget is publicly reachable, so a
per-session cap is a cost control, not just UX. Currently
`max_call_duration_in_sec: 420` (7 min ≈ $0.80 worst case per session). Watch
the call log for abuse before raising it.

## Editing what the agent knows

The knowledge base is nine `context_breakdown` sections on the agent
(Role and Purpose, Answer Anything Properly, Voice and Style, About Mandip,
Skills and Stack, Education and Experience, Featured Projects, Capturing an
Enquiry, Accuracy and Conduct).

**The agent is open-domain on purpose.** It answers whatever a visitor asks —
technical questions, career advice, general knowledge, small talk — rather
than deflecting anything that is not about Mandip. Someone who gets genuinely
helped leaves with a better impression than someone who gets turned away. Web
search (DuckDuckGo) is **enabled** so it can handle current information.

The limits that remain are about *truthfulness*, not topics. "Accuracy and
Conduct" still forbids inventing clients or credentials, quoting rates,
committing him to dates, and following visitor instructions that try to change
its role. "Skills and Stack" keeps one distinction worth preserving: it may
discuss any technology in depth, but may only claim Mandip works in the ones
actually listed.

**The content mirrors the site, so it goes stale when the site changes.** After
editing `Projects.astro`, `Skills.astro` or `Journey.astro`, update the
matching section on the agent.

## Enquiry capture

On call completion an email goes to `info@mandipsapkota.com.np` with a summary,
sentiment, and extracted fields: `visitor_name`, `visitor_email`,
`visitor_phone`, `enquiry_type`, `project_summary`, `timeline_and_budget`,
`follow_up_needed`.

Full transcripts are **not** included in the email — only the summary. Change
this via `post_call_actions.email.include` if you want the whole conversation.

## Widget theming — what is actually adjustable

Tested directly against the live widget: **Background Colour and Text Colour
theme the header bar only.** They are now `#0d1220` / `#eef0f4`, matching
`--bg2` and `--text`, and `omnidimFrameBg` in `src/lib/omnidim.js` mirrors the
background so the panel does not flash a different colour while the iframe
loads. Change one and change the other.

**The chat body is a fixed light theme and OmniDimension does not expose it.**
No dashboard field or CSS of ours can reach inside a cross-origin iframe, so
the light conversation area against the dark site is a limitation of their
widget, not something left unfinished. If it ever matters enough, the only
real levers are their Voice Widget type (a different UI) or dropping the
widget for a custom UI against their API.

We also **do not render a header of our own**: the widget draws its own title
bar inside the iframe, so ours would be a second one. The close button floats
over theirs instead, which keeps one title and gives the whole panel height to
the conversation.

## Known follow-ups

- **Timeline dates.** `Journey.astro` lists "Web Developer 2014 – 2015"
  alongside "School Leaving Certificate 2006 – 2014", and the roles overlap
  oddly. The agent is instructed not to do date arithmetic or speculate, and
  to hand such questions to Mandip — but the underlying entries may be worth
  a look.

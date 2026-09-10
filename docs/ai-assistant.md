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
| `src/lib/omnidim.js` | Reads the key, derives the iframe URL. Build-time only. |
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

### Performance

The iframe is rendered with **no `src`**. Nothing is requested from
omnidim.io until the visitor actually opens the panel, so the third party is
completely outside the critical path. Cost to the page as shipped: **+282
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
3. For the GitHub Pages deploy, add the same value as a repository secret
   named `PUBLIC_OMNIDIM_WIDGET_KEY`. `.github/workflows/deploy.yml` already
   passes it to the build step.

**With no key set, `AiAgent.astro` renders nothing at all** — the site builds
and deploys exactly as before. That keeps forks and PR builds working.

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

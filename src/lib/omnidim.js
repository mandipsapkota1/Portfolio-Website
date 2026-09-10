/**
 * OmniDimension web widget — single source of truth.
 *
 * The key below is a *publishable* embed key. It is shipped inside the built
 * HTML by necessity (the widget is a cross-origin iframe keyed by it), exactly
 * like a Stripe publishable key or a browser-restricted Maps key. Keeping it in
 * an env var buys us easy rotation and a clean git history — it does NOT make
 * it secret. The real access control is the domain allowlist configured on the
 * agent in the OmniDimension dashboard.
 *
 * Import this from `.astro` frontmatter only. Never import it from a client
 * script, or the key gets duplicated into the JS bundle for no benefit.
 */

const key = (import.meta.env.PUBLIC_OMNIDIM_WIDGET_KEY || '').trim();

/** True when a key is present at build time. Everything is inert without one. */
export const omnidimEnabled = key.length > 0;

/** Cross-origin URL for the widget iframe, or '' when disabled. */
export const omnidimSrc = omnidimEnabled
  ? `https://www.omnidim.io/chat-widget?secret=${encodeURIComponent(key)}`
  : '';

/**
 * Background of the OmniDimension widget itself, mirrored on our panel so there
 * is no colour flash while the iframe loads. Keep this in sync with the
 * "Background colour" field on the agent's Web Widget tab in the dashboard.
 */
export const omnidimFrameBg = '#0d1220';

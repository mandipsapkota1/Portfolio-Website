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

/**
 * OmniDimension serves two widget surfaces off the same key. `widgetType` in
 * the dashboard only decides which one *their* loader script picks; because we
 * embed the iframe ourselves we can offer both and let the visitor choose.
 */
const surface = path =>
  omnidimEnabled
    ? `https://www.omnidim.io/${path}?secret=${encodeURIComponent(key)}`
    : '';

/** Text chat. */
export const omnidimChatSrc = surface('chat-widget');

/** Live voice call — needs mic permission, see the Permissions-Policy note. */
export const omnidimVoiceSrc = surface('voice-widget');

/**
 * Header colour of the OmniDimension widget, mirrored on our panel so there is
 * no colour flash while an iframe loads. Keep in sync with the "Background
 * colour" field on the agent's Web Widget tab. Note that only the widget's
 * header is themeable — its conversation area is a fixed light theme.
 */
export const omnidimFrameBg = '#0d1220';

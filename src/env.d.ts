/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /**
   * OmniDimension web widget key (dashboard → agent → Deploy → Web Widget).
   * Publishable by design: it ships in the built HTML. Restrict it with the
   * domain allowlist on the agent, not by hiding it.
   */
  readonly PUBLIC_OMNIDIM_WIDGET_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

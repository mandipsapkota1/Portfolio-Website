/* ─────────────────────────────────────────────────────────────
   AI ASSISTANT — launcher + lazy-mounted OmniDimension surfaces

   Two surfaces share one agent and one key: /chat-widget for text and
   /voice-widget for a live spoken call. Both are cross-origin iframes,
   not third-party <script> tags, so neither can read this page's DOM,
   cookies or storage. Nothing is requested from omnidim.io until the
   visitor opens the panel, and the voice surface is not requested until
   they actually ask for a call.

   Voice needs microphone permission, which has to be granted twice over:
   by the iframe's own `allow` attribute, and by the site's
   Permissions-Policy response header. See docs/ai-assistant.md.

   Renders only when PUBLIC_OMNIDIM_WIDGET_KEY is set at build time —
   without it AiAgent.astro emits nothing and every guard below no-ops.
   ───────────────────────────────────────────────────────────── */

const root = document.getElementById('ai-agent');

if (root) {
  const launcher = document.getElementById('ai-launcher');
  const panel    = document.getElementById('ai-panel');
  const closeBtn = document.getElementById('ai-close');
  const tabs     = [...root.querySelectorAll('.ai-mode')];

  const surfaces = {
    chat:  { frame: document.getElementById('ai-frame-chat'),  src: root.dataset.chatSrc  || '' },
    voice: { frame: document.getElementById('ai-frame-voice'), src: root.dataset.voiceSrc || '' },
  };

  let isOpen = false;
  let mode   = 'chat';

  panel.tabIndex = -1;

  /* ─── LAZY MOUNT ───
     Each surface pays its load once, the first time it is asked for. */
  function mount(name) {
    const s = surfaces[name];
    if (!s || s.mounted || !s.src) return;
    s.mounted = true;
    root.classList.add('ai-busy');
    s.frame.addEventListener('load', () => {
      s.loaded = true;
      if (mode === name) root.classList.remove('ai-busy');
    }, { once: true });
    s.frame.src = s.src;
  }

  /* ─── MODE ───
     Both surfaces stay mounted once used, so switching back and forth
     does not throw away an in-progress conversation. */
  function setMode(next) {
    if (!surfaces[next] || next === mode) return;
    mode = next;
    mount(next);

    for (const [name, s] of Object.entries(surfaces)) {
      s.frame.classList.toggle('is-active', name === next);
    }
    for (const tab of tabs) {
      const on = tab.dataset.mode === next;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
    }

    /* Show the loader only if the surface we switched to is still coming up */
    root.classList.toggle('ai-busy', !surfaces[next].loaded);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => setMode(tab.dataset.mode));
  });

  /* Left/right arrows move between tabs, as a tablist should */
  root.querySelector('.ai-tabs').addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const i = tabs.findIndex(t => t.dataset.mode === mode);
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    setMode(next.dataset.mode);
    next.focus();
  });

  /* ─── OPEN / CLOSE ─── */
  function setOpen(next, wanted) {
    if (next && wanted && surfaces[wanted]) setMode(wanted);
    if (next === isOpen) return;
    isOpen = next;

    if (next) mount(mode);

    root.classList.toggle('ai-open', next);
    panel.classList.toggle('open', next);
    launcher.setAttribute('aria-expanded', String(next));
    launcher.setAttribute(
      'aria-label',
      next ? "Close Mandip's AI assistant" : "Open Mandip's AI assistant"
    );

    if (next) {
      panel.removeAttribute('inert');
      /* A `visibility: hidden` element cannot take focus, and the class
         we just added has not been resolved yet. Force the recalc so the
         panel is focusable before we move focus into the dialog. */
      void panel.offsetHeight;
      panel.focus({ preventScroll: true });
    } else {
      /* Only reclaim focus if it is still inside the panel — otherwise the
         visitor has already moved on and yanking it back is disorienting. */
      const focusWasInside = panel.contains(document.activeElement);
      panel.setAttribute('inert', '');
      if (focusWasInside) launcher.focus({ preventScroll: true });
    }
  }

  launcher.addEventListener('click', () => setOpen(!isOpen));
  closeBtn.addEventListener('click', () => setOpen(false));

  /* Any element on the page can open the assistant, and may name the surface
     it wants: data-ai-open="voice" opens straight into a call. */
  document.querySelectorAll('[data-ai-open]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      setOpen(true, el.dataset.aiOpen || undefined);
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) setOpen(false);
  });

  /* ─── YIELD TO THE MOBILE NAV ───
     The drawer is fixed at z-999 and locks body scroll; leaving a chat
     panel live underneath it strands focus in a covered element. */
  const navbar = document.getElementById('navbar');
  if (navbar && 'MutationObserver' in window) {
    new MutationObserver(() => {
      if (navbar.classList.contains('open')) setOpen(false);
    }).observe(navbar, { attributes: true, attributeFilter: ['class'] });
  }

  /* ─── WHERE THE LAUNCHER IS ALLOWED TO SHOW ───
     The launcher is present on every section, from the hero down. The one
     place it cannot simply sit still is the footer's copyright line, which
     occupies the same corner — there it lifts clear rather than vanishing,
     so the assistant is never absent from the page. */
  root.classList.add('ai-visible');

  const footerBar = document.querySelector('.footer-bottom');
  if (footerBar && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => root.classList.toggle('ai-lifted', entry.isIntersecting),
      { threshold: 0 }
    ).observe(footerBar);
  }
}

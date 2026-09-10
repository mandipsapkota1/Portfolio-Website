/* ─────────────────────────────────────────────────────────────
   AI ASSISTANT — launcher + lazy-mounted OmniDimension iframe

   The widget is a cross-origin iframe, not a third-party <script>, so
   it cannot read this page's DOM, cookies or storage. Nothing is
   requested from omnidim.io until the visitor actually opens the panel,
   which keeps the third party out of the critical path entirely.

   Renders only when PUBLIC_OMNIDIM_WIDGET_KEY is set at build time —
   without it AiAgent.astro emits nothing and every guard below no-ops.
   ───────────────────────────────────────────────────────────── */

const root = document.getElementById('ai-agent');

if (root) {
  const launcher = document.getElementById('ai-launcher');
  const panel    = document.getElementById('ai-panel');
  const closeBtn = document.getElementById('ai-close');
  const frame    = document.getElementById('ai-frame');
  const src      = root.dataset.src || '';

  let mounted = false;
  let isOpen  = false;

  panel.tabIndex = -1;

  /* ─── LAZY MOUNT ───
     First open pays the iframe load; every later open is instant. */
  function mount() {
    if (mounted || !src) return;
    mounted = true;
    frame.addEventListener('load', () => root.classList.add('ai-ready'), { once: true });
    frame.src = src;
  }

  /* ─── OPEN / CLOSE ─── */
  function setOpen(next) {
    if (next === isOpen) return;
    isOpen = next;

    if (next) mount();

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

  /* Any element on the page can open the assistant — see Contact.astro */
  document.querySelectorAll('[data-ai-open]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      setOpen(true);
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

  /* ─── ALWAYS AVAILABLE ───
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

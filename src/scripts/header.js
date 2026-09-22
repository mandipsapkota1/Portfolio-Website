/* Sticky header state, current-section highlighting and the small-screen menu. */

const header   = document.getElementById('header');
const nav      = document.getElementById('nav');
const menuBtn  = document.getElementById('menu-btn');
const links    = [...document.querySelectorAll('.nav-link')];
const sections = links
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

/* ─── Border under the header once the page has moved ─── */
function onScroll() {
  header.classList.toggle('is-stuck', window.scrollY > 8);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ─── Highlight the section that occupies the top of the viewport ─── */
if (sections.length && 'IntersectionObserver' in window) {
  let current = null;
  const setCurrent = id => {
    if (id === current) return;
    current = id;
    links.forEach(a => {
      const on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  };

  const visible = new Map();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
    let best = null, bestRatio = 0;
    for (const [id, ratio] of visible) {
      if (ratio > bestRatio) { best = id; bestRatio = ratio; }
    }
    if (best) setCurrent(best);
    else if (window.scrollY < 200) setCurrent(null);
  }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, .1, .25, .5, .75, 1] });

  sections.forEach(s => io.observe(s));
}

/* ─── Small-screen menu ─── */
if (menuBtn && nav) {
  const desktop = window.matchMedia('(min-width: 861px)');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open && !desktop.matches ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));

  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  document.addEventListener('click', e => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
      setMenu(false);
    }
  });

  /* Growing past the breakpoint would otherwise leave the body scroll-locked */
  desktop.addEventListener('change', e => { if (e.matches) setMenu(false); });
}

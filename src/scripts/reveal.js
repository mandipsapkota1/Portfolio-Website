/* Fade sections in as they enter the viewport. global.css only hides
   .reveal elements when the html element carries the js class, so the
   page is fully readable without this script. */

const items = [...document.querySelectorAll('.reveal')];
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const show = el => el.classList.add('is-visible');

if (!items.length || reduce || !('IntersectionObserver' in window)) {
  items.forEach(show);
} else {
  /* Anything already on screen is shown straight away, so first paint never
     waits on an observer callback (which a background tab may delay). */
  const fold = window.innerHeight * 1.1;
  const pending = items.filter(el => {
    const top = el.getBoundingClientRect().top;
    if (top < fold) { show(el); return false; }
    return true;
  });

  if (pending.length) {
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        show(entry.target);
        io.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    pending.forEach(el => io.observe(el));
  }
}

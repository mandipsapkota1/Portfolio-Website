const dot  = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');

/* Skip entirely on touch devices — no pointer to follow */
const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (dot && ring && hasFinePointer) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  let running = false;

  /* transform instead of left/top: no layout on every frame */
  function place(el, x, y) {
    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
  }

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    place(dot, mx, my);          /* dot tracks the pointer exactly */
    if (!running) { running = true; requestAnimationFrame(moveRing); }
  }, { passive: true });

  function moveRing() {
    /* .22 catches up ~3x faster than .07 while keeping the trailing feel */
    rx += (mx - rx) * .22;
    ry += (my - ry) * .22;
    place(ring, rx, ry);

    /* park the loop once the ring has settled, restart on next move */
    if (Math.abs(mx - rx) < .1 && Math.abs(my - ry) < .1) {
      rx = mx; ry = my;
      place(ring, rx, ry);
      running = false;
      return;
    }
    requestAnimationFrame(moveRing);
  }

  document.querySelectorAll('a, button, .acard, .badge, .proj-card, input, textarea, .tl-dot').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('big'));
    el.addEventListener('mouseleave', () => ring.classList.remove('big'));
  });
}

const dot  = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');

if (dot && ring) {
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function moveRing() {
    rx += (mx - rx) * .07;
    ry += (my - ry) * .07;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(moveRing);
  })();

  document.querySelectorAll('a, button, .acard, .badge, .proj-card, input, textarea, .tl-dot').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('big'));
    el.addEventListener('mouseleave', () => ring.classList.remove('big'));
  });
}

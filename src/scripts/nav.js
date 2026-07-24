const header       = document.getElementById('header');
const sections     = document.querySelectorAll('section[id]');
const navLinks     = document.querySelectorAll('.nav-link');
const menuBtn      = document.getElementById('menu-btn');
const navbar       = document.getElementById('navbar');
const progressBar  = document.getElementById('scroll-progress');

function updateHeader() {
  header.classList.toggle('sticky', window.scrollY > 50);

  /* scroll progress */
  if (progressBar) {
    const scrollTop = window.scrollY;
    const docH      = document.documentElement.scrollHeight - window.innerHeight;
    const pct       = docH > 0 ? (scrollTop / docH) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
  });
  navLinks.forEach(link => {
    const active = link.getAttribute('href') === '#' + current;
    link.classList.toggle('active', active);
  });
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

if (menuBtn && navbar) {
  const backdrop = document.getElementById('nav-backdrop');

  function setMenu(open) {
    navbar.classList.toggle('open', open);
    menuBtn.classList.toggle('open', open);
    if (backdrop) backdrop.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', () => {
    setMenu(!navbar.classList.contains('open'));
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });

  /* Close on backdrop tap and on the CV / social links inside the drawer */
  if (backdrop) backdrop.addEventListener('click', () => setMenu(false));
  navbar.querySelectorAll('.nav-foot a').forEach(a => {
    a.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navbar.classList.contains('open')) setMenu(false);
  });

  document.addEventListener('click', e => {
    if (navbar.classList.contains('open')
      && !navbar.contains(e.target)
      && !menuBtn.contains(e.target)) {
      setMenu(false);
    }
  });

  /* Rotating to landscape / resizing past the breakpoint would otherwise
     leave the backdrop up and the body scroll-locked */
  const desktop = window.matchMedia('(min-width: 769px)');
  const onBreakpoint = e => { if (e.matches) setMenu(false); };
  desktop.addEventListener
    ? desktop.addEventListener('change', onBreakpoint)
    : desktop.addListener(onBreakpoint);
}

/* Smooth scroll */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

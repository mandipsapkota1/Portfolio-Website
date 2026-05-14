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
  menuBtn.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('open');
    menuBtn.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('open');
      menuBtn.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', e => {
    if (navbar.classList.contains('open')
      && !navbar.contains(e.target)
      && !menuBtn.contains(e.target)) {
      navbar.classList.remove('open');
      menuBtn.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
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

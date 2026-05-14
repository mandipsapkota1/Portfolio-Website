/* ─── INTERSECTION OBSERVER SETUP ─── */
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('in');

    /* stagger children of reveal-group */
    if (el.classList.contains('reveal-group')) {
      Array.from(el.children).forEach((child, i) => {
        child.style.setProperty('--i', i);
      });
    }
    io.unobserve(el);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-group, .reveal-left, .reveal-right, .reveal-scale')
  .forEach(el => io.observe(el));

/* ─── COUNTER ANIMATION ─── */
let countersRun = false;
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting || countersRun) return;
    countersRun = true;

    document.querySelectorAll('.counter-item strong[data-target]').forEach(el => {
      const target = +el.dataset.target;
      const duration = 1200;
      const step = duration / target;
      let current = 0;
      const timer = setInterval(() => {
        current++;
        el.textContent = current + '+';
        if (current >= target) { clearInterval(timer); el.textContent = target + '+'; }
      }, step);
    });
    counterObs.disconnect();
  });
}, { threshold: 0.5 });

const countersSection = document.querySelector('.counters');
if (countersSection) counterObs.observe(countersSection);

/* ─── SKILL BARS ─── */
let barsAnimated = false;
const barObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting || barsAnimated) return;
    barsAnimated = true;

    document.querySelectorAll('.fill[data-w]').forEach((bar, i) => {
      setTimeout(() => {
        bar.classList.add('growing');
        bar.style.width = bar.dataset.w + '%';
      }, i * 90);
    });
    barObs.disconnect();
  });
}, { threshold: 0.3 });

const skillsSection = document.getElementById('skills');
if (skillsSection) barObs.observe(skillsSection);

/* ─── TIMELINE DOT RIPPLE ─── */
const tlObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const dot = entry.target.querySelector('.tl-dot');
    if (dot) {
      dot.classList.add('ripple');
      setTimeout(() => dot.classList.remove('ripple'), 1000);
    }
    tlObs.unobserve(entry.target);
  });
}, { threshold: 0.6 });

document.querySelectorAll('.tl-item').forEach(item => tlObs.observe(item));

/* ─── PROJECT CARD TILT (21st.dev hover tilt effect) ─── */
document.querySelectorAll('.proj-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width  / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -6;
    const rotY = ((x - cx) / cx) *  6;
    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
    /* glow follows cursor */
    card.style.setProperty('--mx', `${(x / rect.width)  * 100}%`);
    card.style.setProperty('--my', `${(y / rect.height) * 100}%`);
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ─── SECTION SCAN LINE ─── */
const scanObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const scan = entry.target.querySelector('.scan-line');
    if (scan) {
      scan.style.animation = 'scanLine .8s ease-out forwards';
    }
    scanObs.unobserve(entry.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('section').forEach(sec => scanObs.observe(sec));

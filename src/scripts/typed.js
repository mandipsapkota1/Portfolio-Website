const typedEl = document.getElementById('typed');

if (typedEl) {
  const words = ['Web Developer', 'UI Designer', 'PHP Developer', 'Problem Solver'];
  let wi = 0, ci = 0, isDeleting = false;

  function typeLoop() {
    const word = words[wi];
    typedEl.textContent = isDeleting ? word.slice(0, --ci) : word.slice(0, ++ci);

    if (!isDeleting && ci === word.length) {
      setTimeout(() => { isDeleting = true; typeLoop(); }, 1800);
      return;
    }
    if (isDeleting && ci === 0) {
      isDeleting = false;
      wi = (wi + 1) % words.length;
    }
    setTimeout(typeLoop, isDeleting ? 55 : 110);
  }

  typeLoop();
}

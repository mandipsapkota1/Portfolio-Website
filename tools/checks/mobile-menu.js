const wait = ms => new Promise(r => setTimeout(r, ms));
document.getElementById('menu-btn').click(); await wait(400);
const nav = document.getElementById('nav');
return { open: nav.classList.contains('is-open'), links: [...nav.querySelectorAll('.nav-link')].map(a => a.textContent.trim()), bodyLocked: document.body.style.overflow, launcherHidden: getComputedStyle(document.querySelector(".ai-launcher")).visibility };

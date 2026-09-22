const wait = ms => new Promise(r => setTimeout(r, ms));
const out = {};

/* 1. Parallax: pointer over the scene sets the tilt variables via rAF */
const scene = document.getElementById('stack-scene');
const stack = document.getElementById('stack');
scene.scrollIntoView({ block: 'center' });
await wait(300);
const r = scene.getBoundingClientRect();
scene.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true, pointerType: 'mouse' }));
scene.dispatchEvent(new PointerEvent('pointermove', { clientX: r.left + r.width * 0.9, clientY: r.top + r.height * 0.15, bubbles: true, pointerType: 'mouse' }));
await wait(120);
out.parallax = { tx: stack.style.getPropertyValue('--tx'), tz: stack.style.getPropertyValue('--tz'), spread: stack.classList.contains('is-spread'), finePointer: matchMedia('(hover: hover) and (pointer: fine)').matches };
scene.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true, pointerType: 'mouse' }));
await wait(120);
out.parallaxReset = { tx: stack.style.getPropertyValue('--tx'), tz: stack.style.getPropertyValue('--tz'), spread: stack.classList.contains('is-spread') };

/* 2. Legend drives the active plate, and the transition really runs */
document.querySelector('.stack-key[data-layer="infra"]').click();
await wait(900);
out.legend = { active: stack.dataset.active, infraOpacity: getComputedStyle(stack.querySelector('.plate-infra')).opacity, uiOpacity: getComputedStyle(stack.querySelector('.plate-ui')).opacity };

/* 3. Project filters hide and show cards */
document.getElementById('projects').scrollIntoView();
await wait(300);
document.querySelector('.proj-filter[data-filter="site"]').click();
await wait(500);
out.filterSites = [...document.querySelectorAll('.proj-card')].filter(c => !c.hidden).map(c => c.querySelector('.proj-name').textContent.trim());
out.filterStatus = document.getElementById('proj-status').textContent;
document.querySelector('.proj-filter[data-filter="all"]').click();
await wait(500);
out.filterAllCount = [...document.querySelectorAll('.proj-card')].filter(c => !c.hidden).length;
out.revealedCards = [...document.querySelectorAll('.proj-card')].filter(c => c.classList.contains('is-visible')).length;

/* 4. Nav highlight follows the section */
document.getElementById('experience').scrollIntoView();
await wait(700);
out.navActive = [...document.querySelectorAll('.nav-link.is-active')].map(a => a.textContent.trim());

/* 5. Theme toggle */
document.getElementById('theme-toggle').click();
await wait(100);
out.themeAfterToggle = document.documentElement.dataset.theme;
document.getElementById('theme-toggle').click();
try { localStorage.removeItem('theme'); } catch {}

/* 6. Assistant opens and lazily mounts the frame */
window.scrollTo(0, 0);
document.querySelector('[data-ai-open="chat"]').click();
await wait(400);
out.assistant = { open: document.getElementById('ai-panel').classList.contains('open'), frameHost: (document.getElementById('ai-frame-chat').src || '').split('?')[0] };
document.getElementById('ai-close').click();

/* 7. Every anchor on the page resolves to an element */
out.brokenAnchors = [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href')).filter(h => h.length > 1 && !document.querySelector(h));

return out;

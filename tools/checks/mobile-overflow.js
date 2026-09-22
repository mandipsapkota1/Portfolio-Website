const wait = ms => new Promise(r => setTimeout(r, ms));
await wait(400);
const wide = [...document.querySelectorAll('body *')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 1; }).slice(0, 6).map(el => el.tagName + '.' + (el.className && el.className.toString().split(' ')[0]) + ' right=' + Math.round(el.getBoundingClientRect().right));
return { wide, touch: matchMedia('(hover: none)').matches, launcherVisible: !!document.querySelector('.ai-agent.ai-visible') };

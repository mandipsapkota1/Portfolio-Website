const wait = ms => new Promise(r => setTimeout(r, ms));
await wait(800);
return { title: document.title, uiText: document.getElementById('ui').innerText.replace(/\s+/g,' ').slice(0, 80), canvasSize: [document.getElementById('game').width, document.getElementById('game').height], back: document.querySelector('.veil-back') && document.querySelector('.veil-back').getAttribute('href') };

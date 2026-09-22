/* Light and dark theme toggle.
   The inline script in BaseLayout resolves the theme before first paint;
   this only handles the button and keeps following the OS setting until
   the visitor makes a choice of their own. */

const root   = document.documentElement;
const button = document.getElementById('theme-toggle');
const media  = window.matchMedia('(prefers-color-scheme: dark)');

function apply(theme, persist) {
  root.setAttribute('data-theme', theme);
  if (persist) {
    try { localStorage.setItem('theme', theme); } catch (e) { /* private mode */ }
  }
  if (button) {
    const dark = theme === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
}

apply(root.getAttribute('data-theme') || (media.matches ? 'dark' : 'light'), false);

if (button) {
  button.addEventListener('click', () => {
    apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  });
}

media.addEventListener('change', e => {
  let stored = null;
  try { stored = localStorage.getItem('theme'); } catch (err) { /* ignore */ }
  if (!stored) apply(e.matches ? 'dark' : 'light', false);
});

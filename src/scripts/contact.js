const WEB3FORMS_KEY = '580f7530-ad23-41cf-999a-36c70662d054';

const form      = document.getElementById('contact-form');
const formMsg   = document.getElementById('form-msg');
const submitBtn = document.getElementById('submit-btn');

function showMsg(type, text) {
  if (!formMsg) return;
  formMsg.textContent = text;
  formMsg.className   = 'form-msg show ' + type;
  setTimeout(() => { formMsg.className = 'form-msg'; }, 6000);
}

function setBusy(busy) {
  if (!submitBtn) return;
  const txt  = submitBtn.querySelector('.btn-txt');
  const icon = submitBtn.querySelector('i');
  if (busy) {
    if (txt)  txt.textContent = 'Sending…';
    if (icon) icon.className  = 'bx bx-loader-alt bx-spin';
    submitBtn.disabled = true;
  } else {
    if (txt)  txt.textContent = 'Send Message';
    if (icon) icon.className  = 'bx bx-send';
    submitBtn.disabled = false;
  }
}

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = form.querySelector('[name="from_name"]')?.value.trim()  || '';
    const email   = form.querySelector('[name="from_email"]')?.value.trim() || '';
    const subject = form.querySelector('[name="subject"]')?.value.trim()    || '';
    const message = form.querySelector('[name="message"]')?.value.trim()    || '';
    const phone   = form.querySelector('[name="phone"]')?.value.trim()      || '';

    if (!name || !email || !subject || !message) {
      showMsg('err', '⚠ Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMsg('err', '⚠ Please enter a valid email address.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name,
          email,
          phone:   phone || 'Not provided',
          subject,
          message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMsg('ok', '✓ Message sent! I\'ll get back to you soon.');
        form.reset();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Web3Forms error:', err);
      showMsg('err', '✕ Failed to send. Email me at info@mandipsapkota.com.np');
    } finally {
      setBusy(false);
    }
  });
}

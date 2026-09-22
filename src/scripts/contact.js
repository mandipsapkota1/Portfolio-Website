/* Contact form, delivered through Web3Forms.
   The access key is a public identifier by design (it only says which inbox
   receives the message). Spam is handled by the hidden botcheck field. */

const WEB3FORMS_KEY = '580f7530-ad23-41cf-999a-36c70662d054';
const FALLBACK_EMAIL = 'info@mandipsapkota.com.np';

const form      = document.getElementById('contact-form');
const formMsg   = document.getElementById('form-msg');
const submitBtn = document.getElementById('submit-btn');

let hideTimer;
function showMsg(kind, text) {
  if (!formMsg) return;
  clearTimeout(hideTimer);
  formMsg.textContent = text;
  formMsg.className = 'form-msg ' + (kind === 'ok' ? 'is-ok' : 'is-err');
  hideTimer = setTimeout(() => { formMsg.className = 'form-msg'; formMsg.textContent = ''; }, 8000);
}

function setBusy(busy) {
  if (!submitBtn) return;
  const txt = submitBtn.querySelector('.btn-txt');
  submitBtn.disabled = busy;
  submitBtn.classList.toggle('is-busy', busy);
  if (txt) txt.textContent = busy ? 'Sending' : 'Send message';
}

function markInvalid(field, invalid) {
  if (!field) return;
  if (invalid) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
}

if (form) {
  const fields = {
    name:    form.querySelector('[name="name"]'),
    email:   form.querySelector('[name="email"]'),
    phone:   form.querySelector('[name="phone"]'),
    subject: form.querySelector('[name="subject"]'),
    message: form.querySelector('[name="message"]'),
    bot:     form.querySelector('[name="botcheck"]'),
  };

  Object.values(fields).forEach(f => f && f.addEventListener('input', () => markInvalid(f, false)));

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const name    = fields.name?.value.trim()    || '';
    const email   = fields.email?.value.trim()   || '';
    const phone   = fields.phone?.value.trim()   || '';
    const subject = fields.subject?.value        || 'Website enquiry';
    const message = fields.message?.value.trim() || '';

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    markInvalid(fields.name, !name);
    markInvalid(fields.email, !emailOk);
    markInvalid(fields.message, !message);

    if (!name || !message) {
      showMsg('err', 'Please add your name and a short message.');
      (!name ? fields.name : fields.message)?.focus();
      return;
    }
    if (!emailOk) {
      showMsg('err', 'That email address does not look right.');
      fields.email?.focus();
      return;
    }

    /* A filled honeypot means a bot. Pretend it worked and move on. */
    if (fields.bot?.checked) {
      form.reset();
      showMsg('ok', 'Thanks, your message is on its way.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `${subject} from ${name}`,
          from_name: name,
          name,
          email,
          phone: phone || 'Not provided',
          message,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Web3Forms rejected the request');
      form.reset();
      showMsg('ok', 'Thanks, your message is on its way. I will reply by email.');
    } catch (err) {
      console.error('Contact form:', err);
      showMsg('err', `Sending failed. Please email me directly at ${FALLBACK_EMAIL}.`);
    } finally {
      setBusy(false);
    }
  });
}

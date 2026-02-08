(() => {
  function setStatus(statusEl, message, variant) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('is-ok', 'is-error');
    if (variant === 'ok') statusEl.classList.add('is-ok');
    if (variant === 'error') statusEl.classList.add('is-error');
    statusEl.hidden = false;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const endpoint = form.getAttribute('data-submit-endpoint');
    const statusEl = form.querySelector('[data-submit-status]');
    const submitButton = form.querySelector('button[type="submit"]');

    const nickname = form.querySelector('input[name="nickname"]');
    if (nickname && nickname.value.trim() !== '') {
      setStatus(statusEl, "Sent! I'll review it soon.", 'ok');
      form.reset();
      return;
    }

    if (!endpoint) {
      setStatus(statusEl, 'Submission endpoint is not configured.', 'error');
      return;
    }

    // --- Turnstile token check ---
    const turnstileWidget = form.querySelector('.cf-turnstile');
    let turnstileToken = '';

    if (turnstileWidget) {
      // Try the API first, fall back to hidden input
      if (window.turnstile) {
        turnstileToken = window.turnstile.getResponse(turnstileWidget) || '';
      }
      if (!turnstileToken) {
        const turnstileInput = form.querySelector('input[name="cf-turnstile-response"]');
        turnstileToken = turnstileInput ? turnstileInput.value : '';
      }
      if (!turnstileToken) {
        setStatus(statusEl, 'Please complete the verification check.', 'error');
        return;
      }
    }

    const formData = new FormData(form);
    const nameValue = (formData.get('name') || '').toString().trim();

    const payload = {
      name: nameValue === '' ? 'Anonymous' : nameValue,
      link: (formData.get('link') || '').toString(),
      message: (formData.get('message') || '').toString(),
      status: 'pending',
      source: 'marmalade-site',
    };

    // Include the Turnstile token if present
    if (turnstileToken) {
      payload.cfToken = turnstileToken;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }
    if (statusEl) statusEl.hidden = true;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus(statusEl, "Sent! I'll review it soon.", 'ok');
        form.reset();
        // Reset the Turnstile widget for next submission
        if (turnstileWidget && window.turnstile) {
          window.turnstile.reset();
        }
        return;
      }

      let errorMessage = 'Something went wrong.';
      try {
        const err = await response.json();
        if (err && typeof err.message === 'string') errorMessage = err.message;
      } catch {
        // ignore JSON parse errors
      }
      setStatus(statusEl, `Error: ${errorMessage}`, 'error');
    } catch {
      setStatus(statusEl, 'Could not reach the server (is it running?).', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Submission';
      }
    }
  }

  function init() {
    document.querySelectorAll('form.submit-form[data-submit-endpoint]').forEach((form) => {
      if (form.dataset.submitInit === '1') return;
      form.dataset.submitInit = '1';
      form.addEventListener('submit', handleSubmit);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

(() => {
  /* ── "Based on" picker: search the built-in list of pieces, picks become chips ── */

  function initBasedOn(form) {
    const root = form.querySelector('[data-based-on]');
    const optsEl = form.querySelector('[data-bo-options]');
    if (!root || !optsEl) return;
    let options = [];
    try { options = JSON.parse(optsEl.textContent); } catch { return; }

    const search = root.querySelector('[data-bo-search]');
    const list = root.querySelector('[data-bo-list]');
    const chips = root.querySelector('[data-bo-chips]');
    const otherToggle = root.querySelector('[data-bo-other-toggle]');
    const other = root.querySelector('[data-bo-other]');
    const picked = new Map(); // id -> option
    let active = -1;
    let shown = [];

    form._basedOn = () => Array.from(picked.values());
    form._resetBasedOn = () => { picked.clear(); renderChips(); close(); other.hidden = true; };

    function esc(s) {
      return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function matches(o, q) {
      if (!q) return true;
      const hay = (o.title + ' ' + o.meta + ' ' + (o.tags || '')).toLowerCase();
      return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
    }

    function open() {
      const q = search.value.trim();
      shown = options.filter((o) => !picked.has(o.id) && matches(o, q)).slice(0, 60);
      active = shown.length ? 0 : -1;
      list.innerHTML = shown.length
        ? shown.map((o, i) =>
            `<div role="option" id="bo-opt-${i}" class="bo-option${i === active ? ' is-active' : ''}" data-i="${i}" aria-selected="${i === active}">
               <img src="${esc(o.thumb)}" alt="" loading="lazy" />
               <span class="bo-option-title">${esc(o.title)}</span>
               <span class="bo-option-meta">${esc(o.meta)}${o.badge ? ' · ' + esc(o.badge) : ''}</span>
             </div>`).join('')
        : '<div class="bo-empty">Nothing found. Try another word, or use "Something else" below.</div>';
      list.hidden = false;
      search.setAttribute('aria-expanded', 'true');
      search.setAttribute('aria-activedescendant', active >= 0 ? `bo-opt-${active}` : '');
    }

    function close() {
      list.hidden = true;
      search.setAttribute('aria-expanded', 'false');
      search.removeAttribute('aria-activedescendant');
    }

    function highlight(i) {
      if (!shown.length) return;
      active = Math.max(0, Math.min(shown.length - 1, i)); // stop at the grid's edges
      list.querySelectorAll('.bo-option').forEach((el, j) => {
        el.classList.toggle('is-active', j === active);
        el.setAttribute('aria-selected', String(j === active));
      });
      const el = list.querySelector(`#bo-opt-${active}`);
      if (el) el.scrollIntoView({ block: 'nearest' });
      search.setAttribute('aria-activedescendant', `bo-opt-${active}`);
    }

    function pick(i) {
      const o = shown[i];
      if (!o) return;
      picked.set(o.id, o);
      search.value = '';
      renderChips();
      open();
      form.dispatchEvent(new CustomEvent('basedon:change'));
    }

    function renderChips() {
      chips.innerHTML = Array.from(picked.values()).map((o) =>
        `<span class="bo-chip"><img src="${esc(o.thumb)}" alt="" />${esc(o.title)}
           <button type="button" aria-label="Remove ${esc(o.title)}" data-remove="${esc(o.id)}">×</button></span>`).join('');
    }

    // how many tiles per row right now, so up/down arrows move by a whole row
    function columns() {
      return getComputedStyle(list).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
    }

    search.addEventListener('focus', open);
    search.addEventListener('input', open);
    // Close when focus leaves the picker. The list is focusable (tabindex -1), so grabbing its
    // scrollbar keeps it open; clicks anywhere else on the page close it.
    root.addEventListener('focusout', () => {
      setTimeout(() => { if (!root.contains(document.activeElement)) close(); }, 0);
    });
    search.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); list.hidden ? open() : highlight(active + columns()); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); highlight(active - columns()); }
      else if (e.key === 'ArrowRight' && !list.hidden && search.selectionStart === search.value.length) { e.preventDefault(); highlight(active + 1); }
      else if (e.key === 'ArrowLeft' && !list.hidden && search.selectionStart === search.value.length && active > 0) { e.preventDefault(); highlight(active - 1); }
      else if (e.key === 'Enter') { if (!list.hidden && active >= 0) { e.preventDefault(); pick(active); } }
      else if (e.key === 'Escape') { close(); }
    });
    list.tabIndex = -1;
    list.addEventListener('mousedown', (e) => {
      const tile = e.target.closest('.bo-option');
      if (!tile) return; // scrollbar / gaps: let the list take focus so it stays open
      e.preventDefault(); // keep focus in the search box
      pick(Number(tile.dataset.i));
    });
    chips.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-remove');
      if (!id) return;
      picked.delete(id);
      renderChips();
      form.dispatchEvent(new CustomEvent('basedon:change'));
    });
    // composedPath: a picked tile is re-rendered (removed) before this runs, so e.target alone would look "outside"
    document.addEventListener('mousedown', (e) => { if (!e.composedPath().includes(root)) close(); });
    otherToggle.addEventListener('click', () => {
      other.hidden = !other.hidden;
      if (!other.hidden) other.focus();
    });
  }

  /* ── CC0 opt-in: the explanation + confirmations open when ticked ── */

  function initCC0(form) {
    const toggle = form.querySelector('[data-cc0-toggle]');
    const box = form.querySelector('[data-cc0-box]');
    const warning = form.querySelector('[data-cc0-warning]');
    if (!toggle || !box) return;

    // Heads-up when they built on something that isn't free: their CC0 only covers their own part
    function updateWarning() {
      const notFree = (form._basedOn ? form._basedOn() : []).filter((o) => !o.free);
      if (notFree.length && warning) {
        const names = notFree.map((o) => (o.author ? `${o.title} (by ${o.author})` : o.title)).join(', ');
        warning.textContent = `Heads-up: ${names} ${notFree.length > 1 ? 'belong' : 'belongs'} to ${notFree.length > 1 ? 'their artists' : 'its artist'}, so your CC0 only covers what you added.`;
        warning.hidden = false;
      } else if (warning) {
        warning.hidden = true;
      }
    }

    toggle.addEventListener('change', () => {
      box.hidden = !toggle.checked;
      if (!toggle.checked) box.querySelectorAll('input[type="checkbox"]').forEach((c) => { c.checked = false; });
      updateWarning();
    });
    form.addEventListener('basedon:change', updateWarning);
  }

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

    // --- CC0: both confirmations are required when they opt in ---
    const cc0 = formData.get('cc0') === 'on';
    if (cc0 && !(formData.get('cc0_own') === 'on' && formData.get('cc0_permanent') === 'on')) {
      setStatus(statusEl, 'To release it as CC0, please tick both boxes in the CC0 section (or untick CC0).', 'error');
      return;
    }

    const basedOn = form._basedOn ? form._basedOn() : [];
    const basedOnOther = (formData.get('based_on_other') || '').toString().trim();
    const box = form.querySelector('[data-cc0-box]');
    const statementEl = form.querySelector('[data-cc0-statement]');
    const cc0Statement = cc0 && statementEl
      ? statementEl.innerText.replace(/\n{3,}/g, '\n\n').trim() + '\n\n[ticked both confirmations]'
      : '';

    // Readable summary in the note too, so nothing is lost if the database lacks the new fields
    let message = (formData.get('message') || '').toString();
    const extras = [];
    if (basedOn.length) extras.push('Based on: ' + basedOn.map((o) => o.title).join(', '));
    if (basedOnOther) extras.push('Based on (other): ' + basedOnOther);
    if (cc0) extras.push('Released as CC0: yes (both confirmations ticked)');
    if (extras.length) message = (message ? message + '\n\n' : '') + '— ' + extras.join('\n— ');

    const payload = {
      name: nameValue === '' ? 'Anonymous' : nameValue,
      link: (formData.get('link') || '').toString(),
      message,
      status: 'pending',
      source: 'marmalade-site',
      based_on: basedOn.map((o) => o.id),
      based_on_other: basedOnOther,
      cc0,
      cc0_statement: cc0Statement,
      cc0_version: cc0 && box ? box.dataset.cc0Version : '',
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
        if (form._resetBasedOn) form._resetBasedOn();
        const cc0Box = form.querySelector('[data-cc0-box]');
        if (cc0Box) cc0Box.hidden = true;
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
      initBasedOn(form);
      initCC0(form);
      form.addEventListener('submit', handleSubmit);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

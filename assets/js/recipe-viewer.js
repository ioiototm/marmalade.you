(function () {
  const section = document.querySelector('.related-entries[data-entries]');
  if (!section) return;

  // --- Carousel arrows: only shown when the strip is wider than the page ---
  const tray = section.querySelector('.related-tray');
  const trayWrap = section.querySelector('.related-tray-wrap');
  const arrows = section.querySelector('.related-arrows');
  if (tray && trayWrap && arrows) {
    const [backBtn, fwdBtn] = arrows.querySelectorAll('.related-arrow');

    function updateArrows() {
      const max = tray.scrollWidth - tray.clientWidth;
      const scrollable = max > 2;
      const canBack = scrollable && tray.scrollLeft > 2;
      const canFwd = scrollable && tray.scrollLeft < max - 2;
      arrows.hidden = !scrollable;
      backBtn.disabled = !canBack;
      fwdBtn.disabled = !canFwd;
      trayWrap.classList.toggle('can-back', canBack);
      trayWrap.classList.toggle('can-fwd', canFwd);
    }

    arrows.addEventListener('click', (e) => {
      const btn = e.target.closest('.related-arrow');
      if (!btn) return;
      tray.scrollBy({ left: Number(btn.dataset.dir) * tray.clientWidth * 0.8, behavior: 'smooth' });
    });
    tray.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();
  }

  // --- Recipe viewer (modal with prev/next) ---
  const viewer = document.querySelector('.recipe-viewer');
  if (!viewer) return;

  const entries = JSON.parse(section.dataset.entries);
  const card = viewer.querySelector('.recipe-viewer-card');
  const prevBtn = viewer.querySelector('.recipe-viewer-prev');
  const nextBtn = viewer.querySelector('.recipe-viewer-next');
  let current = 0;
  let isOpen = false;

  const fieldMap = [
    ['model', 'LoRA'], ['base', 'Base'], ['sampler', 'Sampler'],
    ['scheduler', 'Scheduler'], ['steps', 'Steps'], ['cfg', 'CFG'],
    ['seed', 'Seed', true], ['size', 'Size'], ['lora_weight', 'Weight']
  ];

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function render(i) {
    const e = entries[i];
    current = i;
    let left = '';
    let right = '';

    if (e.image) {
      left = `<div class="recipe-viewer-left"><img class="recipe-viewer-image" src="${esc(e.image)}" alt="${esc(e.title)}" /></div>`;
    }

    right += `<h3 class="recipe-viewer-title">${esc(e.title)}</h3>`;
    right += `<div class="recipe-viewer-date">${esc(e.date)}</div>`;

    if (e.summary) {
      right += `<div class="recipe-viewer-summary">${esc(e.summary)}</div>`;
    }

    if (e.generation) {
      const g = e.generation;
      right += '<details class="sketch-recipe">';
      right += '<summary class="sketch-recipe-toggle">Settings</summary>';
      right += '<div class="sketch-recipe-body">';

      if (g.prompt) {
        right += `<div class="recipe-prompt"><div class="recipe-label">Prompt</div><code class="recipe-code">${esc(g.prompt)}</code></div>`;
      }
      if (g.negative) {
        right += `<div class="recipe-prompt"><div class="recipe-label">Negative</div><code class="recipe-code recipe-code--neg">${esc(g.negative)}</code></div>`;
      }

      let grid = '';
      for (const [key, label, mono] of fieldMap) {
        if (g[key] != null) {
          const cls = mono ? 'recipe-value recipe-value--mono' : 'recipe-value';
          grid += `<div class="recipe-field"><span class="recipe-label">${label}</span><span class="${cls}">${esc(String(g[key]))}</span></div>`;
        }
      }
      if (grid) right += `<div class="recipe-grid">${grid}</div>`;

      right += '</div></details>';
    }

    right += `<a href="${esc(e.url)}" class="sketch-card-link">View full page &rarr;</a>`;

    card.innerHTML = left + `<div class="recipe-viewer-right">${right}</div>`;
    prevBtn.style.display = i > 0 ? '' : 'none';
    nextBtn.style.display = i < entries.length - 1 ? '' : 'none';
  }

  function open(i) {
    render(i);
    viewer.hidden = false;
    isOpen = true;
    document.body.classList.add('viewer-open');
  }

  function close() {
    viewer.hidden = true;
    isOpen = false;
    document.body.classList.remove('viewer-open');
    // hand focus back to the card you ended on, scrolled into view inside the strip
    const btn = section.querySelector(`.related-card[data-viewer="${current}"]`);
    if (btn) {
      btn.focus({ preventScroll: true });
      btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  section.querySelectorAll('.related-card[data-viewer]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      open(parseInt(btn.dataset.viewer, 10));
    });
  });

  viewer.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  viewer.querySelector('.recipe-viewer-close').addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });

  viewer.querySelector('.recipe-viewer-overlay').addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (current > 0) render(current - 1);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (current < entries.length - 1) render(current + 1);
  });

  // While the viewer is open it owns these keys (lab-navigation.js also backs off when body.viewer-open).
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault(); // never scroll the page or the strip behind the viewer
      if (e.key === 'ArrowLeft' && current > 0) render(current - 1);
      if (e.key === 'ArrowRight' && current < entries.length - 1) render(current + 1);
    }
  });
})();

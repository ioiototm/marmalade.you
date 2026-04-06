(() => {
  const PACK_EXTS = ['zip', '7z', 'rar', 'tar', 'gz'];
  const IMG_EXTS  = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'];

  function ext(filename) {
    return (filename.split('.').pop() || '').toLowerCase();
  }

  function isPack(filename)    { return PACK_EXTS.includes(ext(filename)); }
  function isImage(filename)   { return IMG_EXTS.includes(ext(filename)); }
  function isPreview(filename) { return filename.toLowerCase().startsWith('preview'); }

  function icon(filename) {
    const e = ext(filename);
    if (['png','jpg','jpeg','webp','gif','bmp','tiff'].includes(e)) return '🖼️';
    if (['clip','psd','kra','sai','sai2','xcf','procreate', 'aseprite'].includes(e)) return '🎨';
    if (['svg','ai','eps'].includes(e)) return '✏️';
    if (['vrm','vroid','pngremix','pmx','glb','gltf','fbx','obj'].includes(e)) return '🧸';
    if (['mp4','mov','webm','avi'].includes(e)) return '🎬';
    if (['mp3','wav','ogg','flac'].includes(e)) return '🔊';
    if (PACK_EXTS.includes(e)) return '📦';
    if (['txt','md','pdf'].includes(e)) return '📄';
    if (['json','csv','yaml','yml','xml'].includes(e)) return '📋';
    return '📁';
  }

  function fmtSize(bytes) {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function buildFileRow(f) {
    const sizeStr = f.size ? `<span class="file-size">(${fmtSize(f.size)})</span>` : '';
    
    // Check if it's an image to show preview
    const previewAttr = isImage(f.path) ? `data-img-preview="${f.url}"` : '';

    return `<a href="${f.url}" class="download-button" download ${previewAttr}>
      <span class="file-name">${icon(f.path)} ${f.path}</span>
      ${sizeStr}
      <span class="download-icon">↓</span>
    </a>`;
  }

  /* ── Preview gallery ── */

  function renderPreview(container, images) {
    if (!images.length) {
      container.innerHTML = '';
      container.classList.remove('preview-gallery');
      return;
    }

    container.classList.add('preview-gallery');
    let idx = 0;

    const viewport = document.createElement('div');
    viewport.className = 'preview-viewport';

    const img = document.createElement('img');
    img.src = images[0].url;
    img.alt = images[0].path;
    viewport.appendChild(img);

    container.innerHTML = '';
    container.appendChild(viewport);

    if (images.length === 1) return;

    // Navigation arrows
    const prev = document.createElement('button');
    prev.className = 'preview-nav preview-nav--prev';
    prev.textContent = '‹';
    prev.type = 'button';

    const next = document.createElement('button');
    next.className = 'preview-nav preview-nav--next';
    next.textContent = '›';
    next.type = 'button';

    viewport.appendChild(prev);
    viewport.appendChild(next);

    // Dots
    const dots = document.createElement('div');
    dots.className = 'preview-dots';
    images.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'preview-dot' + (i === 0 ? ' active' : '');
      dot.type = 'button';
      dot.addEventListener('click', () => goTo(i));
      dots.appendChild(dot);
    });
    container.appendChild(dots);

    function goTo(i) {
      idx = (i + images.length) % images.length;
      img.src = images[idx].url;
      img.alt = images[idx].path;
      dots.querySelectorAll('.preview-dot').forEach((d, j) => {
        d.classList.toggle('active', j === idx);
      });
    }

    prev.addEventListener('click', () => goTo(idx - 1));
    next.addEventListener('click', () => goTo(idx + 1));
  }

  /* ── Downloads file list ── */

  function renderFiles(container, fileList) {
    const packs = fileList.filter(a => isPack(a.path));
    const files = fileList.filter(a => !isPack(a.path));
    let html = '';

    if (packs.length) {
      packs.forEach(p => { html += `<div class="dl-pack-row">${buildFileRow(p)}</div>`; });
    }

    if (files.length) {
      html += '<ul class="download-list">';
      files.forEach(f => { html += `<li>${buildFileRow(f)}</li>`; });
      html += '</ul>';
    }

    if (!packs.length && !files.length) {
      html = '<p class="muted">No files in this version.</p>';
    }

    container.innerHTML = html;
  }

  /* ── Hover Tooltip ── */

  function initHoverPreviews() {
    const tooltip = document.createElement('img');
    tooltip.className = 'download-hover-preview';
    tooltip.hidden = true;
    document.body.appendChild(tooltip);

    const moveTooltip = (e) => {
      const offset = 15;
      let left = e.clientX + offset;
      let top = e.clientY + offset;

      // Keep inside viewport
      if (left + tooltip.offsetWidth > window.innerWidth) {
        left = e.clientX - tooltip.offsetWidth - offset;
      }
      if (top + tooltip.offsetHeight > window.innerHeight) {
        top = e.clientY - tooltip.offsetHeight - offset;
      }

      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    };

    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('[data-img-preview]');
      if (!link) return;

      tooltip.src = link.dataset.imgPreview;
      tooltip.hidden = false;
      document.addEventListener('mousemove', moveTooltip);
    });

    document.addEventListener('mouseout', (e) => {
      const link = e.target.closest('[data-img-preview]');
      if (!link) return;

      tooltip.hidden = true;
      tooltip.src = ''; // Clear to stop loading/playing
      document.removeEventListener('mousemove', moveTooltip);
    });
  }

  /* ── Changelog parser ── */

  function parseChangelog(raw) {
    if (!raw) return [];
    const entries = [];
    let current = null;
    let currentSection = null;

    for (const line of raw.split('\n')) {
      const trimmed = line.trim();

      // ## vX.X — version heading
      if (/^## /.test(trimmed)) {
        if (current) entries.push(current);
        current = { version: trimmed.slice(3).trim(), message: '', sections: [] };
        currentSection = null;
        continue;
      }

      if (!current) continue;

      // ### Category heading
      if (/^### /.test(trimmed)) {
        currentSection = { category: trimmed.slice(4).trim(), items: [] };
        current.sections.push(currentSection);
        continue;
      }

      // - bullet item
      if (/^[-*] /.test(trimmed) && currentSection) {
        currentSection.items.push(trimmed.slice(2).trim());
        continue;
      }

      // Plain text before first ### = freeform message
      if (trimmed && !currentSection) {
        current.message += (current.message ? ' ' : '') + trimmed;
      }
    }

    if (current) entries.push(current);
    return entries;
  }

  function findChangelogEntry(entries, version) {
    return entries.find(e =>
      e.version === version ||
      e.version === 'v' + version ||
      e.version.replace(/^v/, '') === version.replace(/^v/, '')
    );
  }

  /* ── Changelog render — "What's New" card ── */

  function renderChangelogLatest(container, entry) {
    if (!container || !entry) return;

    container.innerHTML = '';
    container.className = 'changelog-latest';

    const heading = document.createElement('h2');
    heading.className = 'h2 changelog-heading';
    heading.textContent = "What\u2019s New in " + entry.version;
    container.appendChild(heading);

    if (entry.message) {
      const msg = document.createElement('p');
      msg.className = 'changelog-message';
      msg.textContent = entry.message;
      container.appendChild(msg);
    }

    renderChangeSections(container, entry.sections);
  }

  function clearChangelogLatest(container) {
    if (!container) return;
    container.innerHTML = '';
    container.className = '';
  }

  /* ── Changelog render — full log below downloads ── */

  function renderChangelogFull(dlEl, entries) {
    if (!entries.length) return;

    const section = document.createElement('details');
    section.className = 'changelog-full';

    const heading = document.createElement('summary');
    heading.className = 'changelog-toggle';
    heading.textContent = 'Changelog';
    section.appendChild(heading);

    const inner = document.createElement('div');
    inner.className = 'changelog-inner';

    for (const entry of entries) {
      const block = document.createElement('div');
      block.className = 'changelog-entry';

      const verHeading = document.createElement('h3');
      verHeading.className = 'changelog-version';
      verHeading.textContent = entry.version;
      block.appendChild(verHeading);

      if (entry.message) {
        const msg = document.createElement('p');
        msg.className = 'changelog-message';
        msg.textContent = entry.message;
        block.appendChild(msg);
      }

      renderChangeSections(block, entry.sections);
      inner.appendChild(block);
    }

    section.appendChild(inner);
    // Insert after the downloads section
    dlEl.after(section);
  }

  function renderChangeSections(parent, sections) {
    for (const sec of sections) {
      const catLabel = document.createElement('span');
      catLabel.className = 'changelog-category';
      catLabel.textContent = sec.category;
      parent.appendChild(catLabel);

      if (sec.items.length) {
        const ul = document.createElement('ul');
        ul.className = 'changelog-items';
        for (const item of sec.items) {
          const li = document.createElement('li');
          li.textContent = item;
          ul.appendChild(li);
        }
        parent.appendChild(ul);
      }
    }
  }

  /* ── Main render ── */

  function render(dlEl, previewEl, changelogEl, data) {
    // Parse changelog (if present)
    const changelogEntries = data.changelog ? parseChangelog(data.changelog) : [];

    if (!data.versions || !data.versions.length) {
      dlEl.innerHTML = '<h2 class="h2">Downloads</h2><p class="muted">No downloads available yet.</p>';
      if (previewEl) previewEl.innerHTML = '';
      return;
    }

    const latestIdx = Math.max(0, data.versions.findIndex(v => v.version === data.latest));

    // Build downloads UI
    dlEl.innerHTML = '';

    const heading = document.createElement('h2');
    heading.className = 'h2';
    heading.textContent = 'Downloads';
    dlEl.appendChild(heading);

    // Version selector row
    const row = document.createElement('div');
    row.className = 'version-row';

    const label = document.createElement('span');
    label.className = 'version-label';
    label.textContent = 'Version:';

    const select = document.createElement('select');
    select.className = 'version-select';
    data.versions.forEach((v, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = v.version + (v.version === data.latest ? ' (latest)' : '');
      if (i === latestIdx) opt.selected = true;
      select.appendChild(opt);
    });

    row.appendChild(label);
    row.appendChild(select);
    dlEl.appendChild(row);

    // File list area
    const fileArea = document.createElement('div');
    fileArea.className = 'version-files';
    dlEl.appendChild(fileArea);

    // Top version selector — injected inline into .lab-tags before the ↓Downloads button
    let topSelect = null;
    if (previewEl && data.versions.length > 1) {
      const tagsEl = document.querySelector('.lab-tags');
      if (tagsEl) {
        const wrapper = document.createElement('span');
        wrapper.className = 'version-select-inline';

        const topLabel = document.createElement('span');
        topLabel.className = 'version-label';
        topLabel.textContent = 'Version:';

        topSelect = document.createElement('select');
        topSelect.className = 'version-select version-select--compact';
        data.versions.forEach((v, i) => {
          const opt = document.createElement('option');
          opt.value = i;
          opt.textContent = v.version + (v.version === data.latest ? ' (latest)' : '');
          if (i === latestIdx) opt.selected = true;
          topSelect.appendChild(opt);
        });

        wrapper.appendChild(topLabel);
        wrapper.appendChild(topSelect);

        // Insert before ↓ Downloads button (or append)
        const jumpLink = tagsEl.querySelector('.jump-downloads');
        if (jumpLink) {
          // Shift the auto-margin from Downloads to our wrapper
          jumpLink.style.marginLeft = '0';
          tagsEl.insertBefore(wrapper, jumpLink);
        } else {
          tagsEl.appendChild(wrapper);
        }

        topSelect.addEventListener('change', () => {
          const idx = parseInt(topSelect.value, 10);
          select.value = idx;
          showVersion(idx);
        });
      }
    }

    // Render a version (updates both preview + file list)
    function showVersion(i) {
      const ver = data.versions[i];
      
      let previews = ver.assets.filter(a => isPreview(a.path) && isImage(a.path));
      let downloadables = [];

      if (previews.length > 0) {
        // Explicit previews exist: hide them from download list
        downloadables = ver.assets.filter(a => !isPreview(a.path));
      } else {
        // Fallback: use ALL images as previews, keep everything in download list
        previews = ver.assets.filter(a => isImage(a.path));
        downloadables = ver.assets;
      }

      if (previewEl) renderPreview(previewEl, previews);
      renderFiles(fileArea, downloadables);

      // Keep sticky mini in sync if it's already showing
      if (syncMiniSrc) syncMiniSrc();

      // Update "What's New" card for this version
      if (changelogEntries.length) {
        const entry = findChangelogEntry(changelogEntries, ver.version);
        if (entry) {
          renderChangelogLatest(changelogEl, entry);
        } else {
          clearChangelogLatest(changelogEl);
        }
      }
    }

    showVersion(latestIdx);

    select.addEventListener('change', () => {
      const idx = parseInt(select.value, 10);
      if (topSelect) topSelect.value = idx;
      showVersion(idx);
    });

    // Render full changelog below downloads
    if (changelogEntries.length) {
      renderChangelogFull(dlEl, changelogEntries);
    }
  }

  /* ── Init ── */

  async function init() {
    const dlContainers = document.querySelectorAll('[data-downloads]');
    if (!dlContainers.length) return;

    for (const dlEl of dlContainers) {
      const slug = dlEl.dataset.downloads;
      const apiBase = dlEl.dataset.api;
      if (!slug || !apiBase) continue;

      // Find matching preview + changelog containers
      const previewEl = document.querySelector(`[data-preview="${slug}"]`);
      const changelogEl = document.querySelector('[data-changelog]');

      // Read changelog from Hugo-embedded script tag (page bundle) or fall back to API
      const changelogScript = document.querySelector('script[data-changelog-raw]');
      const changelogRaw = changelogScript ? changelogScript.textContent : null;

      try {
        const res = await fetch(`${apiBase}/list/${slug}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Prefer Hugo-embedded changelog, fall back to API changelog
        if (changelogRaw) {
          data.changelog = changelogRaw;
        }

        render(dlEl, previewEl, changelogEl, data);
      } catch (err) {
        console.warn('Downloads fetch failed for', slug, err);
        const existing = dlEl.querySelector('.download-list');
        if (!existing) {
          dlEl.innerHTML = '<h2 class="h2">Downloads</h2><p class="muted">Could not load downloads.</p>';
        }
      }
    }
  }

  // Ref that initStickyPreview will fill in so render() can call syncSrc on version change
  let syncMiniSrc = null;

  /* ── Sticky mini-preview ── */

  function initStickyPreview() {
    const previewEl = document.querySelector('[data-preview]');
    if (!previewEl) return;

    const mini = document.createElement('a');
    mini.className = 'preview-mini';
    mini.href = '#';
    mini.setAttribute('aria-label', 'Back to preview image');
    document.body.appendChild(mini);

    const miniImg = document.createElement('img');
    miniImg.alt = '';
    mini.appendChild(miniImg);

    let showing = false;

    mini.addEventListener('click', (e) => {
      e.preventDefault();
      previewEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    function syncSrc() {
      const src = previewEl.querySelector('.preview-viewport img');
      if (src && miniImg.src !== src.src) miniImg.src = src.src;
    }
    // Expose so version switching can update the mini immediately
    syncMiniSrc = syncSrc;

    function show() {
      if (showing) return;
      showing = true;
      syncSrc();
      // Calculate where the preview is relative to viewport for the fly-down origin
      const rect = previewEl.getBoundingClientRect();
      const offsetY = Math.round(rect.bottom - window.innerHeight + 60);
      mini.style.setProperty('--fly-from', offsetY + 'px');
      mini.classList.remove('hiding');
      mini.classList.add('visible');
    }

    function hide() {
      if (!showing) return;
      showing = false;
      mini.classList.add('hiding');
      mini.classList.remove('visible');
      mini.addEventListener('animationend', () => {
        mini.classList.remove('hiding');
      }, { once: true });
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) hide(); else show();
    }, { threshold: 0.05 });

    // Start observing once preview has loaded content
    const wait = new MutationObserver(() => {
      if (previewEl.querySelector('.preview-viewport')) {
        wait.disconnect();
        observer.observe(previewEl);
      }
    });
    wait.observe(previewEl, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      initHoverPreviews();
      initStickyPreview();
    });
  } else {
    init();
    initHoverPreviews();
    initStickyPreview();
  }
})();

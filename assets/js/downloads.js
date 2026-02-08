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
    if (['clip','psd','kra','sai','sai2','xcf','procreate'].includes(e)) return '🎨';
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

  /* ── Main render ── */

  function render(dlEl, previewEl, data) {
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
    }

    showVersion(latestIdx);

    select.addEventListener('change', () => {
      showVersion(parseInt(select.value, 10));
    });
  }

  /* ── Init ── */

  async function init() {
    const dlContainers = document.querySelectorAll('[data-downloads]');
    if (!dlContainers.length) return;

    for (const dlEl of dlContainers) {
      const slug = dlEl.dataset.downloads;
      const apiBase = dlEl.dataset.api;
      if (!slug || !apiBase) continue;

      // Find matching preview container (same slug)
      const previewEl = document.querySelector(`[data-preview="${slug}"]`);

      try {
        const res = await fetch(`${apiBase}/list/${slug}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        render(dlEl, previewEl, data);
      } catch (err) {
        console.warn('Downloads fetch failed for', slug, err);
        const existing = dlEl.querySelector('.download-list');
        if (!existing) {
          dlEl.innerHTML = '<h2 class="h2">Downloads</h2><p class="muted">Could not load downloads.</p>';
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      initHoverPreviews();
    });
  } else {
    init();
    initHoverPreviews();
  }
})();

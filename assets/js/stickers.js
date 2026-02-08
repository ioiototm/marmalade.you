(function () {
  const pathKey = window.location.pathname.replace(/\/$/, "") || "home";
  const KEY = "marmalade_stickers_v1_" + pathKey;
  
  const decorateBtn = document.querySelector('[data-action="toggle-decorate"]');
  const drawer = document.querySelector("[data-drawer]");
  const tray = document.querySelector("[data-sticker-tray]");
  const layer = document.querySelector("[data-sticker-layer]");

  if (!decorateBtn || !drawer || !tray || !layer) return;

  let decorateOn = false;
  let locked = false;

  // Styles are now in main.css

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  }

  function save(stickers) {
    localStorage.setItem(KEY, JSON.stringify(stickers));
  }

  function setDrawer(open) {
    if (open) {
      drawer.hidden = false;
      // Force reflow to ensure transition plays
      void drawer.offsetWidth; 
      drawer.classList.add("is-open");
    } else {
      drawer.classList.remove("is-open");
      // Wait for transition to finish before hiding
      drawer.addEventListener("transitionend", () => {
        if (!drawer.classList.contains("is-open")) {
          drawer.hidden = true;
        }
      }, { once: true });
    }
  }

  function toggleDecorate() {
    decorateOn = !decorateOn;
    decorateBtn.setAttribute("aria-pressed", decorateOn ? "true" : "false");
    setDrawer(decorateOn);
    layer.style.pointerEvents = decorateOn ? "auto" : "none";
    
    const label = decorateBtn.querySelector(".decorate-label");
    if(label) label.textContent = decorateOn ? "done" : "decorate";
    
    if (!decorateOn) {
      document.querySelectorAll(".placed-sticker.selected").forEach(el => el.classList.remove("selected"));
    }
  }

  function uid() {
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
  }

  function updateTransform(el, r, s) {
    // Container handles 2D placement on the desk (Rotation + Scale)
    el.style.transform = `rotate(${r}deg) scale(${s})`;
  }

  function createStickerElement(src, id, r) {
    const wrapper = document.createElement("div");
    wrapper.className = "placed-sticker";
    wrapper.dataset.id = id;
    wrapper.dataset.r = r;
    
    const img = document.createElement("img");
    img.className = "sticker-image";
    img.src = src;
    img.draggable = false;
    wrapper.appendChild(img);

    // Container for controls (Rotate + Delete)
    const controls = document.createElement("div");
    controls.className = "sticker-controls";

    // Rotate Handle
    const rotateBtn = document.createElement("div");
    rotateBtn.className = "control-btn rotate-handle";
    rotateBtn.innerHTML = "↻";
    controls.appendChild(rotateBtn);

    // Delete Button
    const deleteBtn = document.createElement("div");
    deleteBtn.className = "control-btn delete-btn";
    deleteBtn.innerHTML = "×";
    controls.appendChild(deleteBtn);

    wrapper.appendChild(controls);
    
    return wrapper;
  }

  function placeSticker(src, viewportX, viewportY, initialEvent = null) {
    const id = uid();
    const r = Math.floor(Math.random() * 40) - 20;

    const el = createStickerElement(src, id, r);
    
    layer.appendChild(el);

    const docX = viewportX + window.scrollX;
    const docY = viewportY + window.scrollY;
    const w = 120; // Slightly larger default
    
    el.style.left = (docX - w / 2) + "px";
    el.style.top  = (docY - w / 2) + "px";
    el.style.width = w + "px";
    
    updateTransform(el, r, 1);

    wireSticker(el);
    
    if (initialEvent) {
      el._startDrag(initialEvent);
    }
    
    persistFromDom();
  }

  function persistFromDom() {
    const out = Array.from(layer.querySelectorAll(".placed-sticker")).map(el => ({
      id: el.dataset.id,
      src: el.querySelector(".sticker-image").getAttribute("src"),
      left: el.style.left,
      top: el.style.top,
      width: el.style.width || "120px",
      r: el.dataset.r || "0"
    }));
    save(out);
  }

  function restore() {
    const items = load();
    layer.innerHTML = "";
    for (const it of items) {
      const el = createStickerElement(it.src, it.id || uid(), it.r || 0);
      
      if (it.left) el.style.left = it.left;
      if (it.top) el.style.top = it.top;
      if (it.width) el.style.width = it.width;
      
      updateTransform(el, it.r || 0, 1);
      
      layer.appendChild(el);
      wireSticker(el);
    }
  }

  function wireSticker(el) {
    const rotateHandle = el.querySelector(".rotate-handle");
    const deleteBtn = el.querySelector(".delete-btn");
    
    // --- Drag Logic ---
    let startX = 0, startY = 0, originX = 0, originY = 0;

    function onDragDown(ev) {
      if (!decorateOn || locked) return;
      // Ignore clicks on controls
      if (ev.target.closest(".sticker-controls")) return;
      
      // Allow interaction with peel if needed, but here we want to drag the whole thing
      // Peel uses mouseenter/leave, so click/drag is free for us
      
      ev.preventDefault();
      ev.stopPropagation(); 
      
      document.querySelectorAll(".placed-sticker.selected").forEach(s => s.classList.remove("selected"));
      el.classList.add("selected");

      const p = getPoint(ev);
      startX = p.x; 
      startY = p.y;
      originX = parseInt(el.style.left || "0", 10);
      originY = parseInt(el.style.top || "0", 10);

      el.classList.add("dragging");
      updateTransform(el, el.dataset.r, 1.05); // Slight lift

      window.addEventListener("mousemove", onDragMove);
      window.addEventListener("mouseup", onDragUp);
      window.addEventListener("touchmove", onDragMove, { passive: false });
      window.addEventListener("touchend", onDragUp);
    }

    function onDragMove(ev) {
      ev.preventDefault();
      const p = getPoint(ev);
      const dx = p.x - startX;
      const dy = p.y - startY;
      
      el.style.left = (originX + dx) + "px";
      el.style.top  = (originY + dy) + "px";
    }

    function onDragUp() {
      window.removeEventListener("mousemove", onDragMove);
      window.removeEventListener("mouseup", onDragUp);
      window.removeEventListener("touchmove", onDragMove);
      window.removeEventListener("touchend", onDragUp);
      
      el.classList.remove("dragging");
      updateTransform(el, el.dataset.r, 1);
      persistFromDom();
    }

    // --- Rotate Logic ---
    let startAngle = 0, currentR = 0;
    
    function onRotateDown(ev) {
      if (!decorateOn || locked) return;
      ev.preventDefault();
      ev.stopPropagation();

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const p = getPoint(ev);
      startAngle = Math.atan2(p.y - centerY, p.x - centerX) * (180 / Math.PI);
      currentR = parseFloat(el.dataset.r || 0);

      window.addEventListener("mousemove", onRotateMove);
      window.addEventListener("mouseup", onRotateUp);
      window.addEventListener("touchmove", onRotateMove, { passive: false });
      window.addEventListener("touchend", onRotateUp);
    }

    function onRotateMove(ev) {
      ev.preventDefault();
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const p = getPoint(ev);
      const angle = Math.atan2(p.y - centerY, p.x - centerX) * (180 / Math.PI);
      
      const delta = angle - startAngle;
      const newR = currentR + delta;
      
      el.dataset.r = newR;
      updateTransform(el, newR, 1);
    }

    function onRotateUp() {
      window.removeEventListener("mousemove", onRotateMove);
      window.removeEventListener("mouseup", onRotateUp);
      window.removeEventListener("touchmove", onRotateMove);
      window.removeEventListener("touchend", onRotateUp);
      persistFromDom();
    }

    // --- Delete Logic ---
    deleteBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        el.remove();
        persistFromDom();
    });

    // Attach listeners
    el.addEventListener("mousedown", onDragDown);
    el.addEventListener("touchstart", onDragDown, { passive: false });
    
    rotateHandle.addEventListener("mousedown", onRotateDown);
    rotateHandle.addEventListener("touchstart", onRotateDown, { passive: false });
    
    el._startDrag = onDragDown;
  }

  function getPoint(ev) {
    const e = ev.touches && ev.touches[0] ? ev.touches[0] : ev;
    return { x: e.clientX, y: e.clientY };
  }

  // Global click to deselect
  layer.addEventListener("click", (ev) => {
    if (ev.target === layer) {
      document.querySelectorAll(".placed-sticker.selected").forEach(s => s.classList.remove("selected"));
    }
  });

  decorateBtn.addEventListener("click", () => {
    toggleDecorate();
  });

  drawer.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    if (action === "close-drawer") toggleDecorate();
    if (action === "reset-stickers") {
      if(confirm("Clear all stickers on this page?")) {
        layer.innerHTML = "";
        save([]);
      }
    }
    if (action === "lock-stickers") {
      locked = !locked;
      btn.textContent = locked ? "unlock" : "lock";
      btn.classList.toggle("is-locked", locked);
    }
  });

  function handleDrawerDrag(ev) {
    const stickerBtn = ev.target.closest("[data-sticker-src]");
    if (!stickerBtn || !decorateOn) return;
    
    ev.preventDefault();
    
    const src = stickerBtn.getAttribute("data-sticker-src");
    const p = getPoint(ev);
    
    placeSticker(src, p.x, p.y, ev);
  }
  
  tray.addEventListener("mousedown", handleDrawerDrag);
  tray.addEventListener("touchstart", handleDrawerDrag, { passive: false });

  restore();
  layer.style.pointerEvents = "none";
  setDrawer(false);
})();

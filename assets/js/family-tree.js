// Family tree (/family/), wide screens only.
// The tree gets the whole window width. If it's still too wide it shrinks, but never below a
// readable size; past that you drag it around like a map (or scroll sideways), and the
// −/+/"See it all" buttons zoom between close-up and the whole tree.
(function () {
  var frame = document.querySelector('[data-ft-frame]');
  var box = frame && frame.querySelector('[data-family-tree]');
  var tree = box && (box.querySelector('.ft-world') || box.querySelector('.ft-root')); // branches + roots
  var tools = frame && frame.querySelector('[data-ft-tools]');
  if (!tree || !tools || !('zoom' in document.body.style)) return;

  var wide = matchMedia('(min-width: 900px)');
  var READABLE = 0.8;  // smallest automatic zoom: titles stay legible
  var MAX = 1.5;
  var STEP = 1.25;
  var natural = 0;      // the tree's width at 100%
  var zoom = 1;
  var manual = false;   // the visitor zoomed with the buttons: keep their zoom on resize
  var touched = false;  // the visitor has panned or zoomed: don't re-centre on them
  var btnOut = tools.querySelector('[data-zoom="out"]');
  var btnIn = tools.querySelector('[data-zoom="in"]');
  var btnFit = tools.querySelector('[data-zoom="fit"]');

  // the frame breaks out of the text column to the full window width, minus the scrollbar
  function scrollbar() {
    document.documentElement.style.setProperty('--sbw', (innerWidth - document.documentElement.clientWidth) + 'px');
  }
  function room() {
    var cs = getComputedStyle(box);
    return box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  }
  function apply(z) {
    zoom = Math.round(z * 1000) / 1000;
    tree.style.zoom = zoom === 1 ? '' : zoom;
  }
  function fitZoom() { return Math.min(1, room() / natural); }
  function autoZoom() { return Math.min(1, Math.max(fitZoom(), READABLE)); }

  // keep whatever is in the middle of the visible part of the tree in place while zooming
  function anchor() {
    var b = box.getBoundingClientRect(), t = tree.getBoundingClientRect();
    var x = b.left + box.clientWidth / 2;
    var y = (Math.max(b.top, 0) + Math.min(b.bottom, innerHeight)) / 2;
    return { x: x, y: y, fx: (x - t.left) / t.width, fy: (y - t.top) / t.height };
  }
  function restore(a) {
    var t = tree.getBoundingClientRect();
    box.scrollLeft += t.left + a.fx * t.width - a.x;
    scrollBy(0, t.top + a.fy * t.height - a.y);
  }
  function zoomTo(z) {
    manual = touched = true;
    var a = anchor();
    apply(Math.min(MAX, Math.max(fitZoom(), z)));
    restore(a);
    update();
  }

  // soft fades on the sides that have more tree
  function edges() {
    frame.classList.toggle('more-left', box.scrollLeft > 2);
    frame.classList.toggle('more-right', box.scrollLeft + box.clientWidth < box.scrollWidth - 2);
  }
  function update() {
    var fit = fitZoom();
    frame.classList.toggle('is-pannable', box.scrollWidth > box.clientWidth + 1);
    edges();
    // the buttons only show up when there's more tree than fits at 100%
    tools.hidden = !(natural > room() || zoom > 1);
    btnOut.disabled = zoom <= fit + 0.001;
    btnIn.disabled = zoom >= MAX - 0.001;
    var seeingAll = zoom <= fit + 0.001;
    btnFit.textContent = seeingAll ? 'Close-up' : 'See it all';
    btnFit.disabled = seeingAll && autoZoom() <= fit + 0.001;
  }

  function refit() {
    scrollbar();
    if (!wide.matches) {
      apply(1);
      frame.classList.remove('is-pannable', 'more-left', 'more-right');
      tools.hidden = true;
      return;
    }
    var a = natural ? anchor() : null;
    apply(1);
    natural = tree.offsetWidth;
    apply(manual ? Math.min(MAX, Math.max(fitZoom(), zoom)) : autoZoom());
    if (a) restore(a);
    update();
  }

  // start in the middle (that's where the trunk is), or on the piece named in the address (#ft-...)
  function centre() {
    if (!wide.matches) return;
    var id = decodeURIComponent(location.hash.slice(1));
    var node = id && document.getElementById(id);
    var card = node && box.contains(node) && node.querySelector(':scope > .ft-card, :scope > details > .ft-card');
    if (card) {
      var b = box.getBoundingClientRect(), c = card.getBoundingClientRect();
      box.scrollLeft += c.left + c.width / 2 - (b.left + box.clientWidth / 2);
    } else {
      box.scrollLeft = (box.scrollWidth - box.clientWidth) / 2;
    }
    edges();
  }

  btnOut.addEventListener('click', function () { zoomTo(zoom / STEP); });
  btnIn.addEventListener('click', function () { zoomTo(zoom * STEP); });
  btnFit.addEventListener('click', function () {
    zoomTo(zoom <= fitZoom() + 0.001 ? autoZoom() : fitZoom());
  });

  // drag to pan (mouse; touch already scrolls natively). A drag doesn't count as a click on a card.
  var drag = null, swallowClick = false;
  box.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !frame.classList.contains('is-pannable')) return;
    drag = { x: e.clientX, y: e.clientY, left: box.scrollLeft, top: scrollY, moved: false };
  });
  addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved) {
      if (Math.abs(dx) + Math.abs(dy) < 6) return;
      drag.moved = touched = true;
      frame.classList.add('is-dragging');
    }
    box.scrollLeft = drag.left - dx;
    scrollTo(scrollX, drag.top - dy);
  });
  function endDrag() {
    if (!drag) return;
    if (drag.moved) { swallowClick = true; setTimeout(function () { swallowClick = false; }, 0); }
    drag = null;
    frame.classList.remove('is-dragging');
  }
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);
  box.addEventListener('click', function (e) {
    if (swallowClick) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  box.addEventListener('dragstart', function (e) { e.preventDefault(); });
  ['wheel', 'touchstart', 'keydown'].forEach(function (type) {
    box.addEventListener(type, function () { touched = true; }, { passive: true });
  });

  box.addEventListener('scroll', edges, { passive: true });
  addEventListener('resize', refit);
  box.addEventListener('toggle', refit, true); // "N generations" opening/closing changes the width
  addEventListener('hashchange', centre);
  addEventListener('load', function () { refit(); if (!touched) centre(); });
  refit();
  centre();
})();

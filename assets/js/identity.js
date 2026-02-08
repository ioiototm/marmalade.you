(function () {
  function init() {
    const input = document.getElementById("identity-input");
    const titleEl = document.getElementById("site-title");
    if (!input || !titleEl) return;

    const originalTitle = titleEl.textContent || document.title;
    const storageKey = "marmalade-identity";

    function apply(name) {
      if (name) {
        const label = `${name}'s Marmalade`;
        titleEl.textContent = label;
        document.title = label;
      } else {
        titleEl.textContent = originalTitle;
        document.title = originalTitle;
      }
    }

    const savedName = (localStorage.getItem(storageKey) || "").trim();
    if (savedName) {
      input.value = savedName;
      apply(savedName);
    }

    input.addEventListener("input", (ev) => {
      const name = (ev.target.value || "").trim();
      localStorage.setItem(storageKey, name);
      apply(name);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

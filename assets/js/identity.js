(function () {
  function init() {
    const input = document.getElementById("identity-input");
    const titleEl = document.getElementById("site-title");
    if (!input || !titleEl) return;

    const originalTitle = titleEl.textContent || document.title;
    const storageKey = "marmalade-identity";

    // Anything on the page that should talk to the visitor by name
    function personalise(name) {
      document.querySelectorAll("[data-identity-yours]").forEach((el) => {
        el.textContent = name ? `${name}, these are yours.` : el.dataset.default;
      });
      document.querySelectorAll("[data-identity-tip]").forEach((el) => {
        el.dataset.tip = name
          ? `Public domain (CC0). It's yours, ${name}, no need to ask.`
          : "Public domain (CC0). It's yours, no need to ask.";
      });
    }

    function apply(name) {
      personalise(name);
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

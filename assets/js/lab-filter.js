function initLabFilter() {
  const root = document.querySelector(".lab-interface");
  if (!root) {
    console.warn("Lab filter: .lab-interface not found");
    return;
  }

  const buttons = root.querySelectorAll(".filter-btn");
  const items = root.querySelectorAll(".lab-item");
  
  if (!buttons.length) {
    console.warn("Lab filter: no .filter-btn found");
    return;
  }
  if (!items.length) {
    console.warn("Lab filter: no .lab-item found");
    return;
  }

  function setActive(activeButton) {
    buttons.forEach((button) => {
      button.classList.remove("active");
    });
    activeButton.classList.add("active");
  }

  function applyFilter(filter) {
    items.forEach((item) => {
      if (filter === "all") {
        item.style.display = "";
        return;
      }

      const tags = (item.getAttribute("data-tags") || "")
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      if (tags.includes(filter.toLowerCase())) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter") || "all";
      setActive(btn);
      applyFilter(filter);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLabFilter);
} else {
  initLabFilter();
}

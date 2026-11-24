(() => {
  const chips = [...document.querySelectorAll(".chip[data-filter]")];
  const cards = [...document.querySelectorAll(".product-card")];
  const catalog = document.querySelector(".catalog");
  const empty = document.querySelector(".catalog-empty");
  if (!chips.length) return;

  const apply = (value) => {
    chips.forEach((c) => {
      const on = c.dataset.filter === value;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", String(on));
    });
    let shown = 0;
    cards.forEach((card) => {
      const match = value === "todos" || card.dataset.categoria === value;
      card.hidden = !match;
      if (match) shown += 1;
    });
    catalog?.classList.toggle("is-empty", shown === 0);
    if (empty) empty.hidden = shown !== 0;
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => apply(chip.dataset.filter));
  });
})();

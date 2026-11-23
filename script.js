/* El Dorado v3 */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const nav = $("#nav");
  const burger = $("#nav-burger");
  const links = $("#nav-links");
  const form = $("#contact-form");
  const formError = $("#form-error");

  /* ---- menú ---- */
  const closeMenu = () => {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Abrir menú");
  };
  burger?.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  links?.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* ---- revelar al entrar ---- */
  const reveals = $$(".reveal");
  if (reduce) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    reveals.forEach((el) => el.classList.add("is-waiting"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (!e.isIntersecting) return;
        const delay = (e.target.dataset.i || i) * 80;
        setTimeout(() => {
          e.target.classList.remove("is-waiting");
          e.target.classList.add("is-in");
        }, Math.min(delay, 400));
        io.unobserve(e.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el, i) => {
      el.dataset.i = String(i % 6);
      io.observe(el);
    });
  }

  /* ---- formulario → WhatsApp ---- */
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nombre = String(data.get("nombre") || "").trim();
    const telefono = String(data.get("telefono") || "").trim();
    const tipo = String(data.get("tipo") || "").trim();
    const mensaje = String(data.get("mensaje") || "").trim();
    const missing = [];
    const mark = (name, bad) => {
      const el = form.elements[name];
      if (!el) return;
      el.setAttribute("aria-invalid", bad ? "true" : "false");
      if (bad) el.setAttribute("aria-describedby", "form-error");
      else el.removeAttribute("aria-describedby");
    };
    mark("nombre", !nombre);
    mark("telefono", !telefono);
    mark("tipo", !tipo);
    mark("mensaje", !mensaje);
    if (!nombre) missing.push("nombre");
    if (!telefono) missing.push("teléfono");
    if (!tipo) missing.push("tipo de consulta");
    if (!mensaje) missing.push("mensaje");
    if (missing.length) {
      formError.hidden = false;
      formError.textContent = "Por favor complete: " + missing.join(", ") + ".";
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    formError.hidden = true;
    const text =
      `Hola, buen día. Mi nombre es ${nombre} y mi teléfono es ${telefono}.\n` +
      `Quisiera consultar sobre: ${tipo}.\n` +
      `Mi consulta: ${mensaje}\n` +
      `Gracias.`;
    const url = "https://wa.me/50685660110?text=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener");
  });

  /* year-less footer already static */
})();

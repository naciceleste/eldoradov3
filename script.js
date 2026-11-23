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
  const hero = $("#inicio");
  const root = document.documentElement;
  const body = document.body;
  const theme = document.querySelector('meta[name="theme-color"]');

  const DAY_TOP = "#FDF6E9";
  const DAY_BOT = "#FDE3C4";
  const SUNSET_TOP = "#F7A23C";
  const SUNSET_BOT = "#F48C8C";
  const NIGHT_TOP = "#2B2240";
  const NIGHT_BOT = "#361A41";
  const SUN_DAY = "#F0A000";
  const SUN_SET = "#F69B21";
  const MOON = "#EAD9B8";

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const hexTo = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const toHex = (n) => Math.round(n).toString(16).padStart(2, "0");
  const mix = (a, b, t) => {
    const A = hexTo(a), B = hexTo(b);
    return "#" + A.map((v, i) => toHex(v + (B[i] - v) * t)).join("");
  };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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

  /* ---- hero frases ---- */
  const hint = $('[data-hero="hint"]');
  const phraseMap = [
    ["s1", -0.05, 0, 0.30, 0.40],
    ["s2", 0.36, 0.44, 0.58, 0.64],
    ["s3", 0.66, 0.72, 0.82, 0.88],
  ].map(([id, a, b, c, d]) => [$(`[data-hero="${id}"]`), a, b, c, d]);

  const setStory = (p) => {
    if (hint) {
      const h = clamp(1 - p / 0.1);
      hint.style.opacity = reduce ? (p < 0.08 ? "1" : "0") : h.toFixed(3);
    }
    for (const [el, a, b, c, d] of phraseMap) {
      if (!el) continue;
      const inA = ease(clamp((p - a) / (b - a)));
      const outA = ease(clamp((p - c) / (d - c)));
      const visible = p >= a && p <= d;
      const opacity = visible ? inA * (1 - outA) : 0;
      el.style.opacity = opacity.toFixed(3);
      if (!reduce) {
        el.style.transform = `translate(-50%, ${(-outA * 28).toFixed(1)}px)`;
      }
    }
  };

  /* ---- cielo según secciones ---- */
  const marks = () => {
    const y = (id) => {
      const el = document.getElementById(id);
      return el ? el.getBoundingClientRect().top + window.scrollY : 0;
    };
    const vh = window.innerHeight;
    return {
      vh,
      heroTop: y("inicio"),
      heroEnd: y("inicio") + (hero?.offsetHeight || vh) - vh,
      rubros: y("que-hacemos"),
      pasos: y("como-funciona"),
      logos: y("plataformas"),
      faq: y("preguntas"),
      contact: y("contacto"),
    };
  };
  let m = marks();
  window.addEventListener("resize", () => { m = marks(); onScroll(); }, { passive: true });

  /* progreso de noche: 0 día, ~0.45 atardecer, 1 noche */
  const nightOf = (s) => {
    const sunsetStart = m.rubros + m.vh * 0.55;
    if (s < sunsetStart) return 0;
    if (s < m.pasos) return ease(clamp((s - sunsetStart) / Math.max(1, m.pasos - sunsetStart))) * 0.28;
    if (s < m.logos) return 0.28 + ease(clamp((s - m.pasos) / Math.max(1, m.logos - m.pasos))) * 0.22;
    if (s < m.faq) return 0.5;
    if (s < m.contact - m.vh * 0.12) {
      return 0.5 + ease(clamp((s - m.faq) / Math.max(1, m.contact - m.faq - m.vh * 0.12))) * 0.5;
    }
    return 1;
  };

  const skyFor = (night) => {
    if (night <= 0.45) {
      const t = night / 0.45;
      return {
        top: mix(DAY_TOP, SUNSET_TOP, t),
        bot: mix(DAY_BOT, SUNSET_BOT, t),
        sun: mix(SUN_DAY, SUN_SET, t),
        x: lerp(74, 62, t),
        y: lerp(12, 38, t),
      };
    }
    const t = (night - 0.45) / 0.55;
    return {
      top: mix(SUNSET_TOP, NIGHT_TOP, t),
      bot: mix(SUNSET_BOT, NIGHT_BOT, t),
      sun: mix(SUN_SET, MOON, t),
      x: lerp(62, 78, t),
      y: lerp(38, 14, t),
    };
  };

  const onScroll = () => {
    const s = window.scrollY;
    const heroLen = Math.max(1, m.heroEnd - m.heroTop);
    const heroP = clamp((s - m.heroTop) / heroLen);
    setStory(heroP);

    const night = reduce ? (s >= m.contact - m.vh * 0.3 ? 1 : s >= m.pasos ? 0.5 : s >= m.rubros + m.vh * 0.55 ? 0.28 : 0) : nightOf(s);
    const sky = skyFor(night);
    root.style.setProperty("--sky-top", sky.top);
    root.style.setProperty("--sky-bot", sky.bot);
    root.style.setProperty("--sun", sky.sun);
    root.style.setProperty("--sun-x", sky.x + "%");
    root.style.setProperty("--sun-y", sky.y + "%");
    root.style.setProperty("--night", night.toFixed(3));

    nav.classList.toggle("is-sunset", night > 0.15 && night < 0.72);
    nav.classList.toggle("is-night", night >= 0.72);
    body.classList.toggle("is-night", night >= 0.72);
    if (theme) theme.setAttribute("content", sky.top);
  };

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      onScroll();
      ticking = false;
    });
  }, { passive: true });

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

  /* ---- plataformas: color original al tocar en móvil (como v2) ---- */
  document.querySelectorAll("[data-marquee]").forEach((marquee) => {
    marquee.querySelectorAll(".plataforma").forEach((el) => {
      el.addEventListener("pointerup", (e) => {
        if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
        const wasOn = el.classList.contains("is-color");
        marquee.querySelectorAll(".plataforma.is-color").forEach((x) => {
          x.classList.remove("is-color");
        });
        if (!wasOn) el.classList.add("is-color");
      });
    });
  });

  /* year-less footer already static */
  onScroll();
})();

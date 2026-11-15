/* =========================================================
   CAFÉ MORI — script.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.querySelectorAll(".nav__link");
  const toTop = document.getElementById("toTop");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Smooth scroll (header offset aware) ---------- */
  const scrollToTarget = (hash) => {
    const target = document.querySelector(hash);
    if (!target) return;

    const offset = hash === "#home" ? 0 : header.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const hash = link.getAttribute("href");
      if (hash.length < 2) return;
      e.preventDefault();
      closeNav();
      scrollToTarget(hash);
      history.replaceState(null, "", hash);
    });
  });

  /* ---------- Mobile navigation ---------- */
  function openNav() {
    document.body.classList.add("nav-open");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "メニューを閉じる");
  }

  function closeNav() {
    document.body.classList.remove("nav-open");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "メニューを開く");
  }

  hamburger.addEventListener("click", () => {
    document.body.classList.contains("nav-open") ? closeNav() : openNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  /* ---------- Header style & to-top button on scroll ---------- */
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    toTop.classList.toggle("is-visible", y > window.innerHeight * 0.6);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link (scroll spy) ---------- */
  const sections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => spy.observe(section));

  /* ---------- Reveal on scroll ---------- */
  const revealer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

  /* ---------- Menu tabs ---------- */
  const tabs = [...document.querySelectorAll(".menu__tab")];
  const panels = document.querySelectorAll(".menu__panel");

  const activateTab = (tab) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.classList.toggle("is-active", selected);
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.id === tab.dataset.target;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
      next.focus();
      activateTab(next);
    });
  });

  /* ---------- Open / closed status ---------- */
  const statusEl = document.getElementById("openStatus");
  const updateStatus = () => {
    const now = new Date();
    const day = now.getDay(); // 0: Sun ... 3: Wed
    const minutes = now.getHours() * 60 + now.getMinutes();
    const isWeekend = day === 0 || day === 6;
    const [open, close] = isWeekend ? [9 * 60, 20 * 60] : [8 * 60, 19 * 60];
    const isOpen = day !== 3 && minutes >= open && minutes < close;

    statusEl.classList.toggle("is-open", isOpen);
    statusEl.textContent = isOpen ? "ただいま営業中です" : "ただいま準備中です";
  };
  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  /* ---------- Contact form ---------- */
  const contactForm = document.getElementById("contactForm");
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const fieldRules = [
    { input: contactForm.elements.name, label: "お名前" },
    { input: contactForm.elements.email, label: "メールアドレス", isEmail: true },
    { input: contactForm.elements.message, label: "お問い合わせ内容" },
  ];

  const validateField = ({ input, label, isEmail }) => {
    const value = input.value.trim();
    let message = "";
    if (!value) message = `${label}を入力してください`;
    else if (isEmail && !EMAIL_PATTERN.test(value)) message = "メールアドレスの形式が正しくありません";

    const errorEl = document.getElementById(input.getAttribute("aria-describedby"));
    errorEl.textContent = message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
  };

  // Re-validate as the user types, but only once a field has shown an error
  fieldRules.forEach((rule) => {
    rule.input.addEventListener("input", () => {
      if (rule.input.getAttribute("aria-invalid") === "true") validateField(rule);
    });
  });

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const results = fieldRules.map(validateField);
    const firstInvalid = fieldRules.find((_, i) => !results[i]);

    if (firstInvalid) {
      firstInvalid.input.focus();
      return;
    }

    alert("送信しました");
    contactForm.reset();
    fieldRules.forEach(({ input }) => input.removeAttribute("aria-invalid"));
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
});

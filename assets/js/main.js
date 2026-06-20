/* باستا مينا · Pasta Mina — main.js (vanilla, guarded) */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- sticky nav shrink ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- full-screen overlay menu ---------- */
  var overlay = document.getElementById("overlay");
  var burger = document.getElementById("burger");
  var closeBtn = document.getElementById("overlayClose");
  function openMenu() {
    if (!overlay) return;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    if (burger) burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
  }
  function closeMenu() {
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    if (burger) { burger.setAttribute("aria-expanded", "false"); burger.focus(); }
    document.body.style.overflow = "";
  }
  if (burger) burger.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (overlay) {
    overlay.querySelectorAll("[data-close]").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMenu(); closeLightbox(); }
  });

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); }); // safety fallback
  }

  /* ---------- lightbox-lite ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector("img") : null;
  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src; lightboxImg.alt = alt || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }
  document.querySelectorAll("[data-lightbox]").forEach(function (fig) {
    var img = fig.querySelector("img");
    fig.addEventListener("click", function () { if (img) openLightbox(img.currentSrc || img.src, img.alt); });
    fig.setAttribute("tabindex", "0");
    fig.setAttribute("role", "button");
    fig.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (img) openLightbox(img.currentSrc || img.src, img.alt); }
    });
  });
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.hasAttribute("data-close")) closeLightbox();
    });
  }

  /* ---------- reservation form -> WhatsApp + localStorage + toast ---------- */
  var WA = "966554580943";
  var form = document.getElementById("reserveForm");
  var toast = document.getElementById("toast");
  function showToast(msg) {
    if (!toast) return;
    toast.querySelector("span").textContent = msg;
    toast.classList.add("show");
    setTimeout(function () { toast.classList.remove("show"); }, 4200);
  }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = {
        name: (form.name && form.name.value || "").trim(),
        phone: (form.phone && form.phone.value || "").trim(),
        guests: (form.guests && form.guests.value || "").trim(),
        date: (form.date && form.date.value || "").trim(),
        time: (form.time && form.time.value || "").trim(),
        kind: (form.kind && form.kind.value || "").trim(),
        notes: (form.notes && form.notes.value || "").trim()
      };
      if (!data.name || !data.phone) { showToast("يرجى تعبئة الاسم والجوال"); return; }

      // localStorage demo
      try {
        var prev = JSON.parse(localStorage.getItem("pastaMinaReservations") || "[]");
        prev.push(Object.assign({ ts: Date.now() }, data));
        localStorage.setItem("pastaMinaReservations", JSON.stringify(prev));
      } catch (err) {}

      var lines = [
        "السلام عليكم، أرغب في " + (data.kind || "حجز طاولة") + " لدى باستا مينا 🍝",
        "الاسم: " + data.name,
        "الجوال: " + data.phone
      ];
      if (data.guests) lines.push("عدد الضيوف: " + data.guests);
      if (data.date)   lines.push("التاريخ: " + data.date);
      if (data.time)   lines.push("الوقت: " + data.time);
      if (data.notes)  lines.push("ملاحظات: " + data.notes);
      var url = "https://wa.me/" + WA + "?text=" + encodeURIComponent(lines.join("\n"));

      showToast("تم تجهيز طلبك — جارٍ فتح واتساب");
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; setTimeout(function(){ btn.disabled = false; }, 2500); }
      setTimeout(function () { window.open(url, "_blank", "noopener"); }, 650);
      form.reset();
    });
  }

  /* =========================================================
     SIGNATURE MOTION — PASTA TWIRL
     A fork rotates and "twirls" spaghetti strands onto its tines
     (stroke-dashoffset draw + rotation), steam swirls rise, and
     basil/tomato drift down. One play on view, then settles.
     Reduced-motion -> static finished plate (handled by no-JS draw).
     ========================================================= */
  function runTwirl() {
    var svg = document.getElementById("twirl");
    if (!svg) return;

    var fork = svg.querySelector(".fork-group");
    var strands = Array.prototype.slice.call(svg.querySelectorAll(".strand"));
    var steams = Array.prototype.slice.call(svg.querySelectorAll(".steam"));
    var garnish = Array.prototype.slice.call(svg.querySelectorAll(".garnish"));
    var drifts = Array.prototype.slice.call(document.querySelectorAll(".drift"));

    // prep strands for "winding on" via dashoffset
    strands.forEach(function (s) {
      var len = s.getTotalLength();
      s.style.strokeDasharray = len;
      s.style.strokeDashoffset = len;
      s.style.opacity = "1";
    });

    if (reduce) {
      // finished state: strands fully drawn, garnish + a soft steam visible, no animation
      strands.forEach(function (s) { s.style.strokeDashoffset = "0"; });
      garnish.forEach(function (g) { g.style.opacity = "1"; });
      if (steams[0]) steams[0].style.opacity = ".5";
      return;
    }

    var EASE = "cubic-bezier(.16,1,.3,1)";

    // 1) strands wind onto the fork (staggered)
    strands.forEach(function (s, i) {
      s.style.transition = "stroke-dashoffset 1.15s " + EASE;
      setTimeout(function () { s.style.strokeDashoffset = "0"; }, 220 + i * 180);
    });

    // 2) fork twirls (rotates back and forth, settles)
    if (fork) {
      fork.animate(
        [
          { transform: "rotate(0deg)" },
          { transform: "rotate(-14deg)" },
          { transform: "rotate(12deg)" },
          { transform: "rotate(-6deg)" },
          { transform: "rotate(0deg)" }
        ],
        { duration: 2600, easing: "ease-in-out", fill: "forwards" }
      );
    }

    // 3) steam swirls rise (gentle loop)
    steams.forEach(function (st, i) {
      var len2 = st.getTotalLength();
      st.style.strokeDasharray = len2;
      st.style.strokeDashoffset = len2;
      st.animate(
        [
          { strokeDashoffset: len2, opacity: 0, transform: "translateY(8px)" },
          { opacity: .65, offset: .4 },
          { strokeDashoffset: 0, opacity: 0, transform: "translateY(-14px)" }
        ],
        { duration: 4200, delay: 900 + i * 700, iterations: Infinity, easing: "ease-out" }
      );
    });

    // 4) garnish (cherry tomato + basil on the plate) pop in
    garnish.forEach(function (g, i) {
      setTimeout(function () {
        g.style.transition = "opacity .5s " + EASE + ", transform .6s " + EASE;
        g.style.opacity = "1";
        g.animate(
          [{ transform: "scale(.6) translateY(-6px)" }, { transform: "scale(1) translateY(0)" }],
          { duration: 600, easing: EASE, fill: "forwards" }
        );
      }, 1400 + i * 220);
    });

    // 5) basil leaves / cherry tomatoes drift down gently (once)
    drifts.forEach(function (d, i) {
      setTimeout(function () {
        d.style.opacity = "0";
        d.animate(
          [
            { transform: "translateY(-30px) rotate(0deg)", opacity: 0 },
            { opacity: .95, offset: .15 },
            { transform: "translateY(120px) rotate(" + (i % 2 ? 160 : -150) + "deg)", opacity: 0 }
          ],
          { duration: 4600 + i * 400, delay: 600 + i * 900, iterations: Infinity, easing: "ease-in" }
        );
      }, 300);
    });
  }

  // run twirl when hero stage is in view (or immediately if already visible)
  var stage = document.querySelector(".stage");
  if (stage) {
    if ("IntersectionObserver" in window) {
      var sObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { runTwirl(); sObs.disconnect(); }
        });
      }, { threshold: 0.3 });
      sObs.observe(stage);
    } else {
      runTwirl();
    }
  }

  /* year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

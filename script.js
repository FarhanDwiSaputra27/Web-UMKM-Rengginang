/* ═══════════════════════════════════════════════════
   RENGGINANG MBAK TUTIK — script.js
═══════════════════════════════════════════════════ */

// ── Product Data ─────────────────────────────────────
const PRODUCTS = {
  "Rengginang Original (Gurih Bawang)": 15000,
  "Rengginang Terasi (Wangi Khas)"    : 17000,
  "Rengginang Manis (Gula Merah)"     : 16000,
};

const WA_NUMBER = "6283801265983";

// ── Format Currency (Rupiah) ──────────────────────────
function formatRupiah(amount) {
  return "Rp " + amount.toLocaleString("id-ID");
}

// ── Hitung Total ──────────────────────────────────────
function hitungTotal() {
  const sel   = document.getElementById("produkPilihan");
  const qty   = parseInt(document.getElementById("jumlahPesan").value) || 1;
  const opt   = sel.options[sel.selectedIndex];
  const price = parseInt(opt?.dataset?.price || "0");
  const total = price * qty;

  document.getElementById("totalText").textContent =
    total > 0 ? formatRupiah(total) : "Rp 0";
}

// ── Change Quantity ───────────────────────────────────
function changeQty(delta) {
  const inp = document.getElementById("jumlahPesan");
  let val = parseInt(inp.value) || 1;
  val = Math.max(1, Math.min(100, val + delta));
  inp.value = val;
  hitungTotal();
}

// ── Scroll to Order Form & pre-select product ─────────
function scrollToOrder(btn) {
  const productName = btn?.dataset?.product || "";
  const section = document.getElementById("orderFormSection");

  // Scroll to form
  section.scrollIntoView({ behavior: "smooth", block: "center" });

  // Pre-select the product in dropdown
  if (productName) {
    const sel = document.getElementById("produkPilihan");
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === productName) {
        sel.selectedIndex = i;
        break;
      }
    }
    hitungTotal();

    // Gentle highlight effect on the form
    setTimeout(() => {
      section.classList.add("highlight-pulse");
      setTimeout(() => section.classList.remove("highlight-pulse"), 1200);
    }, 600);
  }
}

// ── Kirim Pesanan via WhatsApp ────────────────────────
function kirimPesanan() {
  const nama    = document.getElementById("namaPemesan").value.trim();
  const produk  = document.getElementById("produkPilihan").value;
  const jumlah  = parseInt(document.getElementById("jumlahPesan").value) || 0;
  const catatan = document.getElementById("catatanPesan").value.trim();

  // Validasi
  if (!nama) {
    showToast("⚠️ Mohon masukkan nama pemesan terlebih dahulu.", "warn");
    document.getElementById("namaPemesan").focus();
    return;
  }

  if (!produk) {
    showToast("⚠️ Mohon pilih produk yang ingin dipesan.", "warn");
    document.getElementById("produkPilihan").focus();
    return;
  }

  if (!jumlah || jumlah < 1) {
    showToast("⚠️ Jumlah pesanan harus minimal 1 bungkus.", "warn");
    document.getElementById("jumlahPesan").focus();
    return;
  }

  const hargaSatuan = PRODUCTS[produk] || 0;
  const total       = hargaSatuan * jumlah;

  // Build WhatsApp message
  let pesan =
    `Halo Mbak Tutik! 👋\n\n` +
    `Saya ingin memesan:\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👤 Nama      : ${nama}\n` +
    `🛒 Produk    : ${produk}\n` +
    `📦 Jumlah    : ${jumlah} bungkus\n` +
    `💰 Total     : ${formatRupiah(total)}\n`;

  if (catatan) {
    pesan += `📝 Catatan   : ${catatan}\n`;
  }

  pesan +=
    `━━━━━━━━━━━━━━━━━━\n` +
    `Apakah stok tersedia? Terima kasih 🙏`;

  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`;

  showToast("✅ Pesanan sedang dikirim ke WhatsApp...", "success");
  setTimeout(() => window.open(url, "_blank"), 800);
}

// ── Toast Notification ────────────────────────────────
function showToast(msg, type = "success") {
  const toast = document.getElementById("toastMsg");
  toast.textContent = msg;

  // Color by type
  if (type === "warn") {
    toast.style.background = "var(--terra)";
    toast.style.color = "#fff";
  } else {
    toast.style.background = "var(--brown)";
    toast.style.color = "var(--gold-light)";
  }

  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}

// ── Navbar scroll shadow ──────────────────────────────
function handleNavbarScroll() {
  const nav = document.getElementById("mainNavbar");
  nav.classList.toggle("scrolled", window.scrollY > 60);
}

// ── Active nav link on scroll ─────────────────────────
function updateActiveNavLink() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  const offset   = 120;

  let current = "";

  sections.forEach(sec => {
    const top = sec.getBoundingClientRect().top;
    if (top <= offset) current = sec.getAttribute("id");
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
}

// ── Intersection Observer: animate on scroll ──────────
function initScrollAnimations() {
  const targets = document.querySelectorAll("[data-animate]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          // Respect inline animation-delay if set
          const el = entry.target;
          const delay = el.style.animationDelay
            ? parseFloat(el.style.animationDelay) * 1000
            : idx * 80;

          setTimeout(() => el.classList.add("visible"), delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach(t => observer.observe(t));
}

// ── Smooth scroll for all internal links ─────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();

      // Close mobile navbar if open
      const bsCollapse = document.getElementById("navMenu");
      if (bsCollapse?.classList.contains("show")) {
        const toggler = document.querySelector(".navbar-toggler");
        toggler?.click();
      }

      const offset = 72; // navbar height
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

// ── Highlight pulse style (injected dynamically) ──────
function injectHighlightStyle() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes highlightPulse {
      0%   { box-shadow: 0 0 0 0 rgba(200,134,10,.5); }
      60%  { box-shadow: 0 0 0 16px rgba(200,134,10,0); }
      100% { box-shadow: 0 0 0 0 rgba(200,134,10,0); }
    }
    .highlight-pulse {
      animation: highlightPulse 1.2s ease;
    }
  `;
  document.head.appendChild(style);
}

// ── Counter animation for stats ───────────────────────
function animateCounters() {
  const counters = document.querySelectorAll(".stat-num");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el  = entry.target;
        const raw = el.textContent.replace(/[^0-9]/g, "");
        const end = parseInt(raw) || 0;
        const suffix = el.textContent.replace(/[0-9]/g, "");
        let start  = 0;
        const dur  = 1400;
        const step = Math.ceil(dur / 60);

        const tick = () => {
          start += Math.ceil(end / (dur / step));
          if (start >= end) {
            el.textContent = end + suffix;
          } else {
            el.textContent = start + suffix;
            setTimeout(tick, step);
          }
        };

        tick();
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(c => observer.observe(c));
}

// ── Init on DOM ready ─────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initScrollAnimations();
  initSmoothScroll();
  animateCounters();
  injectHighlightStyle();

  // Initialize total on load
  hitungTotal();

  // Scroll events
  window.addEventListener("scroll", () => {
    handleNavbarScroll();
    updateActiveNavLink();
  }, { passive: true });

  // Also call once on load
  handleNavbarScroll();
  updateActiveNavLink();
});

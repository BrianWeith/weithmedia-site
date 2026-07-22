/* ─────────────────────────────────────────
   WEITH MEDIA — main.js
   ───────────────────────────────────────── */

// ── NAVBAR: shadow on scroll ──
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
}

// ── MOBILE MENU ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

// ── SMOOTH SCROLL (accounts for fixed navbar) ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = navbar ? navbar.offsetHeight : 0;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── LIGHTBOX ──
const lightbox    = document.createElement('div');
lightbox.id       = 'lightbox';
lightbox.innerHTML = '<img id="lightbox-img" src="" alt="" /><button id="lightbox-close" aria-label="Close">&times;</button>';
document.body.appendChild(lightbox);

const lightboxImg = document.getElementById('lightbox-img');

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add('active');
  document.body.classList.add('lightbox-open');
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.classList.remove('lightbox-open');
  lightboxImg.src = '';
}

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// ── CONTENT: load from content.json and populate page ──
fetch('content.json')
  .then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })
  .then(c => populatePage(c))
  .catch(err => console.error('Could not load content.json:', err));

// Helper: set text or HTML on all matching elements
function set(selector, value, useHTML = false) {
  document.querySelectorAll(selector).forEach(el => {
    if (useHTML) el.innerHTML = value;
    else el.textContent = value;
  });
}

function populatePage(c) {

  // ── Hero ──
  // To swap the hero image: replace images/hero.jpg with your Lightroom export (keep the filename)
  const heroBg = document.getElementById('hero-bg');
  if (heroBg) heroBg.style.backgroundImage = "url('images/hero.jpg')";

  set('[data-c="hero-eyebrow"]', c.hero.eyebrow);
  set('[data-c="hero-heading"]', c.hero.heading, true); // innerHTML supports <br>
  set('[data-c="hero-sub"]',     c.hero.subheading);
  set('[data-c="hero-cta"]',     c.hero.cta);

  // ── Services ──
  set('[data-c="services-heading"]', c.services.heading);
  set('[data-c="services-sub"]',     c.services.subheading);
  set('[data-c="addons-heading"]',   c.services.addons.heading);

  const servicesGrid = document.getElementById('services-grid');
  if (servicesGrid) {
    servicesGrid.innerHTML = c.services.cards.map(card => `
      <div class="service-card">
        <h3>${card.title}</h3>
        <p>${card.description}</p>
        <table class="price-table">
          ${card.pricing.map(row => `
            <tr><td>${row.label}</td><td>${row.price}</td></tr>
          `).join('')}
        </table>
      </div>
    `).join('');
  }

  const addonsList = document.getElementById('addons-list');
  if (addonsList) {
    addonsList.innerHTML = c.services.addons.items.map(item => `
      <div class="addon"><span>${item.label}</span><span>${item.price}</span></div>
    `).join('');
  }

  // ── Gallery ──
  // To add photos: drop files into images/gallery/ and add the filename to
  // the "images" array in content.json.
  // To remove: delete from the array. To reorder: rearrange the array.
  set('[data-c="gallery-heading"]', c.gallery.heading);
  set('[data-c="gallery-sub"]',     c.gallery.subheading);

  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid) {
    galleryGrid.innerHTML = c.gallery.images.map(img => `
      <img src="images/${img}" alt="" loading="lazy" />
    `).join('');

    // Attach lightbox click handlers to every gallery image
    galleryGrid.querySelectorAll('img').forEach(img => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => openLightbox(img.src));
    });
  }

  // ── About ──
  // To swap the about image: replace images/about.jpg with your Lightroom export (keep the filename)
  set('[data-c="about-heading"]', c.about.heading);
  set('[data-c="about-cta"]',     c.about.cta);

  const aboutParagraphs = document.getElementById('about-paragraphs');
  if (aboutParagraphs) {
    aboutParagraphs.innerHTML = c.about.paragraphs.map(p => `<p>${p}</p>`).join('');
  }

  // ── Contact ──
  set('[data-c="contact-heading"]', c.contact.heading);
  set('[data-c="contact-sub"]',     c.contact.subheading);
  set('[data-c="contact-note"]',    c.contact.note);

  const contactMethods = document.getElementById('contact-methods');
  if (contactMethods) {
    contactMethods.innerHTML = c.contact.methods.map(method => `
      <a href="${method.href}" class="contact-method">
        <span class="contact-method-label">${method.label}</span>
        <strong class="contact-method-display">${method.display}</strong>
      </a>
    `).join('');
  }

  // ── Footer ──
  set('[data-c="footer-copy"]', c.footer.copyright);
}

/* ===================================================
   SHASHWAT DWIVEDI — 3D Portfolio
   script.js  —  All animations & interactivity
   =================================================== */

'use strict';

/* =============================================
   0. UTILITIES
   ============================================= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const map = (v, a, b, c, d) => c + ((v - a) / (b - a)) * (d - c);

/* =============================================
   1. LOADER
   ============================================= */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = $('#loader');
    loader.classList.add('hidden');
    // Trigger hero reveal
    $$('.reveal-up').forEach(el => el.style.animationPlayState = 'running');
    // Start the roles slider
    startRolesSlider();
    // Start canvas
    initHeroCanvas();
  }, 2000);
});

/* =============================================
   2. CUSTOM CURSOR
   ============================================= */
const dot = $('#cursor-dot');
const outline = $('#cursor-outline');
let mouseX = 0, mouseY = 0;
let outlineX = 0, outlineY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  dot.style.left = `${mouseX}px`;
  dot.style.top  = `${mouseY}px`;
});

// Smooth outline follow
function animateOutline() {
  outlineX = lerp(outlineX, mouseX, 0.15);
  outlineY = lerp(outlineY, mouseY, 0.15);
  outline.style.left = `${outlineX}px`;
  outline.style.top  = `${outlineY}px`;
  requestAnimationFrame(animateOutline);
}
animateOutline();

// Hover effect on interactive elements
$$('a, button, .tool-pill, .skill-cube, .project-card, .stat-card, .contact-item, .social-link').forEach(el => {
  el.addEventListener('mouseenter', () => outline.classList.add('hover'));
  el.addEventListener('mouseleave', () => outline.classList.remove('hover'));
});

/* =============================================
   3. NAVBAR
   ============================================= */
const navbar = $('#navbar');
const navProgress = $('.nav-progress');
const hamburger = $('#hamburger');
const mobileMenu = $('#mobile-menu');

// Scroll: add .scrolled + progress bar
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = (scrollTop / docHeight) * 100;

  navbar.classList.toggle('scrolled', scrollTop > 20);
  navProgress.style.width = `${pct}%`;

  // Active nav link
  const sections = $$('section[id]');
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    const bot = top + sec.offsetHeight;
    const link = $(`.nav-link[data-section="${sec.id}"]`);
    if (link) link.classList.toggle('active', scrollTop >= top && scrollTop < bot);
  });

  // Back to top
  const btt = $('#back-to-top');
  if (btt) btt.style.opacity = scrollTop > 400 ? '1' : '0';
}, { passive: true });

// Hamburger toggle
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});

// Close mobile menu on link click
$$('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});

// Back to top
$('#back-to-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Smooth scroll for all anchor links
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = $(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* =============================================
   4. HERO CANVAS — FLOATING PARTICLES
   ============================================= */
function initHeroCanvas() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = canvas.offsetWidth;
  let H = canvas.height = canvas.offsetHeight;

  const PARTICLE_COUNT = 60;
  const particles = [];

  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 10;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = -(Math.random() * 0.6 + 0.2);
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color = `rgba(82,183,136,${this.opacity})`;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.y < -10) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  // Connection lines
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(82,183,136,${(1 - dist / 100) * 0.15})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  });
}

/* =============================================
   5. HERO ROLES SLIDER
   ============================================= */
function startRolesSlider() {
  const items = $$('.role-item');
  if (!items.length) return;
  let current = 0;
  setInterval(() => {
    items[current].classList.remove('active');
    items[current].classList.add('exit');
    setTimeout(() => items[(current - 1 + items.length) % items.length].classList.remove('exit'), 500);
    current = (current + 1) % items.length;
    items[current].classList.add('active');
  }, 2500);
}

/* =============================================
   6. SCROLL REVEAL — INTERSECTION OBSERVER
   ============================================= */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = parseInt(el.dataset.delay) || 0;
      setTimeout(() => {
        el.classList.add('visible');
        // Trigger skill bars
        if (el.classList.contains('skill-bar-item')) {
          const fill = el.querySelector('.skill-bar-fill');
          if (fill) fill.style.width = `${fill.dataset.width}%`;
        }
        // Trigger stat counters
        if (el.classList.contains('stat-card')) animateCounter(el);
      }, delay);
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.15 });

$$('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
  revealObserver.observe(el);
});

/* =============================================
   7. STAT COUNTER ANIMATION
   ============================================= */
function animateCounter(card) {
  const numEl = card.querySelector('.stat-number');
  if (!numEl) return;
  const target = parseInt(numEl.dataset.target);
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = clamp(elapsed / duration, 0, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    numEl.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* =============================================
   8. LAPTOP OPEN — SCROLL STORY ANIMATION
   ============================================= */
(function initScrollStory() {
  const section = $('#scroll-story');
  const screen  = $('#story-screen');
  const text    = $('#story-text');
  const bar     = $('#story-progress');
  if (!section || !screen) return;

  window.addEventListener('scroll', () => {
    const rect = section.getBoundingClientRect();
    const sectionH = section.offsetHeight;
    const viewH = window.innerHeight;

    // Progress: 0 when section top hits viewport top, 1 when section bottom exits
    const scrolled = -rect.top;
    const maxScroll = sectionH - viewH;
    const progress = clamp(scrolled / maxScroll, 0, 1);

    // progress 0..0.7 => open lid from -90deg to 0deg
    // progress 0.7..1 => slight bounce back
    let lidAngle;
    if (progress < 0.7) {
      lidAngle = map(progress, 0, 0.7, -90, -2);
    } else {
      lidAngle = map(progress, 0.7, 1, -2, -8);
    }
    screen.style.transform = `rotateX(${lidAngle}deg)`;

    // Show text content when lid is mostly open
    if (progress > 0.45) {
      text.classList.add('visible');
    } else {
      text.classList.remove('visible');
    }

    // Update progress bar
    bar.style.width = `${progress * 100}%`;
  }, { passive: true });
})();

/* =============================================
   9. 3D CARD TILT (PROJECT CARDS)
   ============================================= */
$$('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const tiltX = dy * -8;
    const tiltY = dx *  8;
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
    card.style.transition = 'transform 0.1s';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
  });
});

/* =============================================
   10. 3D TILT — EDUCATION CARD
   ============================================= */
const eduCard = $('.edu-card-wrap');
if (eduCard) {
  eduCard.addEventListener('mousemove', e => {
    const rect = eduCard.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    eduCard.style.transform = `perspective(1200px) rotateX(${dy * -5}deg) rotateY(${dx * 5}deg)`;
    eduCard.style.transition = 'transform 0.1s';
  });
  eduCard.addEventListener('mouseleave', () => {
    eduCard.style.transform = '';
    eduCard.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
  });
}

/* =============================================
   11. FLOATING MINI CARDS PARALLAX
   ============================================= */
const miniCards = $$('.mini-card');
window.addEventListener('mousemove', e => {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  miniCards.forEach((card, i) => {
    const factor = (i + 1) * 6;
    card.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
  });
});

/* =============================================
   12. HERO LAPTOP PARALLAX
   ============================================= */
const laptopModel = $('.laptop-model');
if (laptopModel) {
  window.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    laptopModel.style.transform = `rotateY(${dx * 12}deg) rotateX(${-dy * 6}deg)`;
    laptopModel.style.transition = 'transform 0.3s';
  });
}

/* =============================================
   13. HERO SHAPES PARALLAX
   ============================================= */
const shapes = $$('.shape');
window.addEventListener('mousemove', e => {
  shapes.forEach((s, i) => {
    const factor = (i + 1) * 0.015;
    const x = (e.clientX - window.innerWidth  / 2) * factor;
    const y = (e.clientY - window.innerHeight / 2) * factor;
    s.style.transform = `translate(${x}px, ${y}px)`;
  });
});

/* =============================================
   14. SKILL BAR ANIMATION ON SCROLL
   ============================================= */
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fills = entry.target.querySelectorAll('.skill-bar-fill');
      fills.forEach((fill, i) => {
        setTimeout(() => {
          fill.style.width = `${fill.dataset.width}%`;
        }, i * 150);
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const barsWrap = $('.skill-bars-wrap');
if (barsWrap) barObserver.observe(barsWrap);

/* =============================================
   15. CONTACT FORM
   ============================================= */
const form = $('#contact-form');
const successMsg = $('#form-success');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = $('#form-submit-btn');
    const span = btn.querySelector('span');
    span.textContent = 'Sending...';
    btn.disabled = true;

    // Simulate sending
    setTimeout(() => {
      form.reset();
      successMsg.classList.add('show');
      span.textContent = 'Send Message';
      btn.disabled = false;
      setTimeout(() => successMsg.classList.remove('show'), 5000);
    }, 1500);
  });
}

/* =============================================
   16. ORBIT DOTS GLOW PULSE
   ============================================= */
$$('.orbit-dot').forEach((dot, i) => {
  dot.style.animation = `counterOrbit ${[6,9,12][i % 3]}s linear infinite`;
  // Add glow
  dot.style.boxShadow = `0 0 12px ${['#e34c26','#68a063','#4db33d'][i % 3]}44`;
});

/* =============================================
   17. TOOL PILLS STAGGER ON SCROLL
   ============================================= */
const toolsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const pills = entry.target.querySelectorAll('.tool-pill');
      pills.forEach((pill, i) => {
        pill.style.transitionDelay = `${i * 50}ms`;
        pill.style.opacity = '1';
        pill.style.transform = 'none';
      });
      toolsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const toolsRow = $('.tools-row');
if (toolsRow) {
  $$('.tool-pill').forEach(p => { p.style.opacity = '0'; p.style.transform = 'translateY(20px)'; p.style.transition = 'opacity 0.4s, transform 0.4s'; });
  toolsObserver.observe(toolsRow);
}

/* =============================================
   18. SCROLL-BASED BACKGROUND COLOR SHIFT
   ============================================= */
const sections = [
  { id: 'hero',       bg: '#CAF1DE' },
  { id: 'about',      bg: '#E1F8DC' },
  { id: 'scroll-story', bg: '#D4EDE1' },
  { id: 'skills',     bg: '#F0F9F4' },
  { id: 'projects',   bg: '#E1F8DC' },
  { id: 'education',  bg: '#F0F9F4' },
  { id: 'contact',    bg: '#E1F8DC' },
];
// (Lightweight, no heavy color interpolation needed — sections have bg already)

/* =============================================
   19. TYPING EFFECT — CODE SCREEN
   ============================================= */
(function initTypingEffect() {
  const codeLines = $$('.code-line');
  if (!codeLines.length) return;
  codeLines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateX(-10px)';
    line.style.transition = `opacity 0.4s ${i * 0.15}s, transform 0.4s ${i * 0.15}s`;
    setTimeout(() => {
      line.style.opacity = '1';
      line.style.transform = 'none';
    }, 2200 + i * 150);
  });
})();

/* =============================================
   20. TIMELINE ITEM HOVER EFFECT
   ============================================= */
$$('.tl-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    const dot = item.querySelector('.tl-dot');
    if (dot) dot.style.transform = 'scale(1.5)';
  });
  item.addEventListener('mouseleave', () => {
    const dot = item.querySelector('.tl-dot');
    if (dot) dot.style.transform = '';
  });
});

/* =============================================
   21. PROJECT SCREEN DEMO ANIMATION
   ============================================= */
function animateProjectScreens() {
  const screens = $$('.proj-screen-body');
  screens.forEach(screen => {
    const cards = screen.querySelectorAll('.demo-card');
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(10px)';
      card.style.transition = `opacity 0.4s ${i * 0.1}s, transform 0.4s ${i * 0.1}s`;
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          cards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'none';
          });
          observer.unobserve(screen);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(screen);
  });
}
animateProjectScreens();

/* =============================================
   22. PROFILE CARD MOUSE TILT
   ============================================= */
const profileCard = $('.profile-card-3d');
if (profileCard) {
  profileCard.addEventListener('mousemove', e => {
    const rect = profileCard.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    profileCard.style.transform = `perspective(600px) rotateX(${-dy * 10}deg) rotateY(${dx * 10}deg)`;
  });
  profileCard.addEventListener('mouseleave', () => {
    profileCard.style.transform = '';
    profileCard.style.transition = 'transform 0.6s ease';
  });
}

/* =============================================
   23. SMOOTH SECTION ENTRANCE WITH CUSTOM EASING
   ============================================= */
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('section-visible');
    }
  });
}, { threshold: 0.05 });

$$('section').forEach(s => sectionObserver.observe(s));

/* =============================================
   24. HERO CANVAS — MOUSE REPEL
   ============================================= */
let heroMouseX = window.innerWidth / 2;
let heroMouseY = window.innerHeight / 2;
const heroSection = $('#hero');
if (heroSection) {
  heroSection.addEventListener('mousemove', e => {
    heroMouseX = e.clientX;
    heroMouseY = e.clientY;
  });
}

/* =============================================
   25. BUBBLE CLICK EFFECT
   ============================================= */
document.addEventListener('click', e => {
  if (e.target.closest('a') || e.target.closest('button')) return;
  createRipple(e.clientX, e.clientY);
});

function createRipple(x, y) {
  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position: fixed;
    left: ${x}px; top: ${y}px;
    width: 0; height: 0;
    border-radius: 50%;
    background: rgba(82,183,136,0.25);
    border: 2px solid rgba(82,183,136,0.4);
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 9997;
    animation: rippleExpand 0.6s ease-out forwards;
  `;
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

// Inject ripple keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleExpand {
    to { width: 120px; height: 120px; opacity: 0; }
  }
`;
document.head.appendChild(style);

/* =============================================
   26. SCROLL-TRIGGERED TEXT REVEAL (HERO)
   ============================================= */
(function initHeroParallax() {
  const heroContent = $('.hero-content');
  if (!heroContent) return;
  window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    const parallaxAmount = scroll * 0.3;
    heroContent.style.transform = `translateY(${parallaxAmount}px)`;
    heroContent.style.opacity = `${1 - scroll / (window.innerHeight * 0.8)}`;
  }, { passive: true });
})();

/* =============================================
   27. GLOWING CURSOR TRAIL
   ============================================= */
(function initCursorTrail() {
  const TRAIL_COUNT = 12;
  const trails = [];

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      pointer-events: none;
      border-radius: 50%;
      z-index: 9996;
      mix-blend-mode: multiply;
      transition: transform 0.1s;
    `;
    document.body.appendChild(el);
    trails.push({ el, x: 0, y: 0 });
  }

  let trailMouse = { x: 0, y: 0 };
  document.addEventListener('mousemove', e => {
    trailMouse.x = e.clientX;
    trailMouse.y = e.clientY;
  });

  function animateTrail() {
    let px = trailMouse.x;
    let py = trailMouse.y;

    trails.forEach((trail, i) => {
      trail.x = lerp(trail.x, px, 0.35 - i * 0.02);
      trail.y = lerp(trail.y, py, 0.35 - i * 0.02);
      const size = 8 - i * 0.5;
      const opacity = (1 - i / TRAIL_COUNT) * 0.12;
      trail.el.style.left  = `${trail.x}px`;
      trail.el.style.top   = `${trail.y}px`;
      trail.el.style.width  = `${size}px`;
      trail.el.style.height = `${size}px`;
      trail.el.style.background = `rgba(82,183,136,${opacity})`;
      trail.el.style.transform  = `translate(-50%, -50%)`;
      px = trail.x;
      py = trail.y;
    });

    requestAnimationFrame(animateTrail);
  }
  animateTrail();
})();

/* =============================================
   28. MAGNETIC BUTTONS
   ============================================= */
$$('.btn-primary, .btn-secondary, .nav-cta').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) * 0.25;
    const dy = (e.clientY - cy) * 0.25;
    btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-3px)`;
    btn.style.transition = 'transform 0.15s';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
    btn.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
  });
});

/* =============================================
   29. ABOUT HIGHLIGHT STAGGER
   ============================================= */
const highlightObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const items = entry.target.querySelectorAll('.highlight-item');
      items.forEach((item, i) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
          item.style.transition = 'opacity 0.5s, transform 0.5s';
          item.style.opacity = '1';
          item.style.transform = 'none';
        }, 100 + i * 100);
      });
      highlightObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const highlights = $('.about-highlights');
if (highlights) highlightObserver.observe(highlights);

/* =============================================
   30. TIMELINE PROGRESSIVE REVEAL
   ============================================= */
const tlObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const items = $$('.tl-item');
      items.forEach((item, i) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        setTimeout(() => {
          item.style.transition = 'opacity 0.6s, transform 0.6s';
          item.style.opacity = '1';
          item.style.transform = 'none';
        }, i * 150);
      });
      tlObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

const timeline = $('.timeline');
if (timeline) tlObserver.observe(timeline);

/* =============================================
   31. SKILL CUBE AUTO-STOP ON HOVER
   ============================================= */
$$('.skill-cube').forEach(cube => {
  cube.addEventListener('mouseenter', () => {
    cube.style.animationPlayState = 'paused';
  });
  cube.addEventListener('mouseleave', () => {
    cube.style.animationPlayState = 'running';
    // Reset to face-forward after un-hover
    cube.style.transition = 'transform 0.8s cubic-bezier(0.4,0,0.2,1)';
    cube.style.transform = 'rotateX(20deg) rotateY(-20deg)';
    setTimeout(() => {
      cube.style.transition = '';
      cube.style.transform = '';
    }, 800);
  });
});

/* =============================================
   32. PERFORMANCE — REDUCE ANIMATIONS ON SCROLL
   ============================================= */
let ticking = false;
const onScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      ticking = false;
    });
    ticking = true;
  }
};
window.addEventListener('scroll', onScroll, { passive: true });

/* =============================================
   33. INIT MESSAGE IN CONSOLE
   ============================================= */
console.log(
  '%c👋 Hey there, developer!\n%cBuilt with ❤️ by Shashwat Dwivedi\n%cshashwatdigec77@gmail.com',
  'font-size:20px; font-weight:800; color:#2D6A4F',
  'font-size:14px; color:#527566',
  'font-size:12px; color:#52B788'
);

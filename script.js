/* ============================================================
   Eoin Houstoun, Portfolio JavaScript
   - Typing animation (hero titles)
   - Scroll-triggered fade-in (Intersection Observer)
   - Navbar scroll state
   - Mobile navigation toggle
   - Smooth anchor scroll
   ============================================================ */

/* ===== TYPING ANIMATION ===== */
(function initTypingEffect() {
  const titles = [
    'Data Scientist',
    'AI Engineer',
    'ML Researcher',
    'Published Researcher',
  ];

  const el = document.getElementById('typingText');
  if (!el) return;

  let titleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  // Timing constants (ms)
  const TYPE_SPEED   = 75;
  const DELETE_SPEED = 45;
  const PAUSE_END    = 1800; // pause before deleting
  const PAUSE_START  = 300;  // pause before typing next

  function type() {
    const current = titles[titleIndex];

    if (isDeleting) {
      // Remove a character
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        setTimeout(type, PAUSE_START);
        return;
      }
      setTimeout(type, DELETE_SPEED);

    } else {
      // Add a character
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(type, PAUSE_END);
        return;
      }
      setTimeout(type, TYPE_SPEED);
    }
  }

  // Small initial delay so page has loaded
  setTimeout(type, 800);
})();


/* ===== SCROLL FADE-IN (Intersection Observer) ===== */
(function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Only animate once
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach((el, i) => {
    // Stagger sibling cards within the same grid
    const parent = el.parentElement;
    const siblings = parent ? parent.querySelectorAll('.fade-in') : [];
    const siblingIndex = Array.from(siblings).indexOf(el);
    if (siblingIndex > 0) {
      el.style.transitionDelay = `${siblingIndex * 0.08}s`;
    }

    observer.observe(el);
  });
})();


/* ===== NAVBAR SCROLL BEHAVIOUR ===== */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;

  function onScroll() {
    const scrollY = window.scrollY;

    // Add 'scrolled' class to solidify background
    if (scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();


/* ===== MOBILE NAVIGATION TOGGLE ===== */
(function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  function openMenu() {
    links.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeMenu() {
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close menu when any nav link is clicked
  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();


/* ===== SMOOTH ANCHOR SCROLL ===== */
(function initSmoothScroll() {
  // Accounts for fixed navbar height
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = document.getElementById('navbar')?.offsetHeight ?? 72;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();


/* ===== IMAGE SLIDESHOWS ===== */
(function initSlideshows() {
  document.querySelectorAll('.slideshow').forEach((container) => {
    const slides = container.querySelectorAll('.slide');
    const dotsContainer = container.querySelector('.slide-dots');
    if (slides.length < 2) return;

    const interval = parseInt(container.dataset.interval) || 3500;
    let current = 0;

    // Build dot indicators
    if (dotsContainer) {
      slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      });
    }

    const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

    const isSlideType = container.classList.contains('slideshow--slide');

    function goTo(index) {
      const prev = current;
      slides[prev].classList.remove('active');
      if (dots[prev]) dots[prev].classList.remove('active');

      // For slide-from-right: outgoing slide exits left
      if (isSlideType) {
        slides[prev].classList.add('exit-left');
        setTimeout(() => slides[prev].classList.remove('exit-left'), 650);
      }

      current = index;
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }

    function next() {
      goTo((current + 1) % slides.length);
    }

    // Auto-advance, but pause while the visitor is hovering the slideshow
    let timer = setInterval(next, interval);
    container.addEventListener('mouseenter', () => clearInterval(timer));
    container.addEventListener('mouseleave', () => { timer = setInterval(next, interval); });
  });
})();



/* ===== ACTIVE NAV LINK HIGHLIGHTING ===== */
(function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.style.color = '';
            if (link.getAttribute('href') === `#${id}`) {
              link.style.color = 'var(--text-primary)';
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach((section) => observer.observe(section));
})();


/* ===== THEME TOGGLE (light / dark) ===== */
(function initThemeToggle() {
  const KEY = 'eh-theme';
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const meta = document.querySelector('meta[name="theme-color"]');

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f6f8fb' : '#0a0a0a');
    if (btn) btn.setAttribute('aria-label',
      theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }

  // Inline <head> script already set the initial attribute; mirror it here.
  apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  if (btn) {
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      try { localStorage.setItem(KEY, next); } catch (e) {}
      apply(next);
    });
  }
})();


/* ===== PROJECTS SHOW MORE / LESS ===== */
(function initProjectsToggle() {
  const grid = document.getElementById('projectsGrid');
  const btn = document.getElementById('projectsToggle');
  const secondary = document.getElementById('secondaryProjects');
  if (!grid || !btn) return;

  const label = btn.querySelector('.projects-toggle-label');
  const extraCount = grid.querySelectorAll('.project-card.extra').length +
    (secondary ? secondary.querySelectorAll('.secondary-card').length : 0);

  function setLabel(expanded) {
    if (label) label.textContent = expanded ? 'Show fewer projects' : `Show all projects (+${extraCount})`;
    btn.setAttribute('aria-expanded', String(expanded));
  }
  setLabel(false);

  btn.addEventListener('click', () => {
    const expanding = grid.classList.contains('collapsed');
    grid.classList.toggle('collapsed', !expanding);
    if (secondary) secondary.hidden = !expanding;
    // Make sure revealed fade-in blocks are shown even if the observer already ran
    if (expanding) {
      grid.querySelectorAll('.project-card.extra').forEach((c) => c.classList.add('visible'));
      if (secondary) secondary.classList.add('visible');
    } else {
      // Scroll back up to the projects section so "show fewer" isn't disorienting
      const nav = document.getElementById('navbar');
      const top = document.getElementById('projects').getBoundingClientRect().top +
        window.scrollY - (nav ? nav.offsetHeight : 72) - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setLabel(expanding);
  });
})();

/* ===== NEURAL CONSTELLATION BACKGROUND =====
   Drifting nodes linked by faint lines; the cursor gently attracts
   nodes and draws temporary links. Disabled for reduced motion,
   paused when the tab is hidden, dimmed in light mode. */
(function initConstellation() {
  const canvas = document.getElementById('constellation');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.remove();
    return;
  }

  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], linkDist;
  const mouse = { x: null, y: null };
  const MOUSE_RANGE = 160;

  function isLight() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  function build() {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(70, Math.max(28, Math.round((W * H) / 22000)));
    linkDist = Math.min(170, Math.max(110, W / 9));
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1 + Math.random() * 1.6,
      });
    }
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  });
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });
  document.addEventListener('mouseleave', () => { mouse.x = null; });

  let running = true;
  document.addEventListener('visibilitychange', () => {
    const wasRunning = running;
    running = !document.hidden;
    if (running && !wasRunning) requestAnimationFrame(frame);
  });

  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    ctx.clearRect(0, 0, W, H);

    const light = isLight();
    const rgb = light ? '8,145,178' : '0,212,255';
    const nodeAlpha = light ? 0.30 : 0.70;
    const lineBase = light ? 0.09 : 0.20;
    const maxD2 = linkDist * linkDist;

    // Move nodes (gentle cursor attraction + drift + bounce)
    for (const n of nodes) {
      if (mouse.x !== null) {
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 1 && d2 < MOUSE_RANGE * MOUSE_RANGE) {
          const f = 0.012 / Math.sqrt(d2);
          n.vx += dx * f;
          n.vy += dy * f;
        }
      }
      n.vx = Math.max(-0.4, Math.min(0.4, n.vx));
      n.vy = Math.max(-0.4, Math.min(0.4, n.vy));
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) { n.vx *= -1; n.x = Math.max(0, Math.min(W, n.x)); }
      if (n.y < 0 || n.y > H) { n.vy *= -1; n.y = Math.max(0, Math.min(H, n.y)); }
    }

    // Node-to-node links
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxD2) {
          ctx.strokeStyle = 'rgba(' + rgb + ',' + (lineBase * (1 - d2 / maxD2)).toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Cursor links (slightly brighter)
    if (mouse.x !== null) {
      for (const n of nodes) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxD2) {
          ctx.strokeStyle = 'rgba(' + rgb + ',' + ((lineBase + 0.10) * (1 - d2 / maxD2)).toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    // Nodes
    ctx.fillStyle = 'rgba(' + rgb + ',' + nodeAlpha + ')';
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  build();
  requestAnimationFrame(frame);
})();

/* ===== GLANCE EXPANDERS (experience + project details) =====
   Content is in the DOM by default (works without JS); JS hides it
   on load and toggles it per-card. */
(function initExpanders() {
  document.querySelectorAll('.expander-body').forEach((body) => { body.hidden = true; });

  document.querySelectorAll('.expander-toggle').forEach((btn) => {
    const body = document.getElementById(btn.getAttribute('aria-controls'));
    if (!body) return;
    const label = btn.querySelector('.expander-label');
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      body.hidden = isOpen;
      if (label) label.textContent = isOpen ? 'Details' : 'Hide details';
    });
  });
})();

/* ============================================================
   Eoin Houstoun — Portfolio JavaScript
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


/* ===== ABOUT DATA VISUALISATION (canvas) =====
   Loops two scenes:
   A. A forecast line drawing left-to-right with a widening 95% CI band
   B. Samples raining down and stacking into a normal distribution,
      with the bell curve fading in over the histogram
*/
(function initDataViz() {
  const canvas = document.getElementById('dataViz');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const caption = document.getElementById('vizCaption');

  const ACCENT = '#00d4ff';
  const GREEN  = '#00ff87';

  let W, H;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Seeded RNG so the loop is deterministic
  let seed = 42;
  function rand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function gauss() { return (rand() + rand() + rand() + rand() + rand() + rand() - 3) / 3; }

  // Scene A series (precomputed walk)
  const N = 80;
  const series = [];
  let v = 0.5;
  for (let i = 0; i < N; i++) {
    v += Math.sin(i / 9) * 0.012 + gauss() * 0.02 + 0.002;
    v = Math.max(0.18, Math.min(0.88, v));
    series.push(v);
  }

  // Scene B state
  const BINS = 21;
  const TOTAL_SAMPLES = 240;
  let bins, balls, spawned;
  function resetB() { bins = new Array(BINS).fill(0); balls = []; spawned = 0; seed = 1337; }

  // Scene C: gradient descent path on a rotated elliptical loss bowl (precomputed)
  const C_PATH = [];
  (function buildPath() {
    let x = 0.86, y = 0.16, vx = 0, vy = 0;
    const cx = 0.42, cy = 0.62, a = 1.0, b = 2.6, rot = 0.6;
    const cos = Math.cos(rot), sin = Math.sin(rot);
    for (let i = 0; i < 70; i++) {
      C_PATH.push({ x, y });
      const dx = x - cx, dy = y - cy;
      const u = cos * dx + sin * dy, v = -sin * dx + cos * dy;
      const gu = 2 * a * u, gv = 2 * b * v;
      vx = 0.8 * vx - 0.024 * (cos * gu - sin * gv);
      vy = 0.8 * vy - 0.024 * (sin * gu + cos * gv);
      x += vx; y += vy;
    }
  })();

  let phase = 'A';
  let t0 = null;
  const A_DUR = 6000, A_HOLD = 1400, B_DUR = 7000, B_HOLD = 2000, C_DUR = 6000, C_HOLD = 1600;

  function drawAxes(pad) {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad / 2);
    ctx.lineTo(pad, H - pad);
    ctx.lineTo(W - pad / 2, H - pad);
    ctx.stroke();
  }

  function drawA(p) {
    const pad = 32;
    drawAxes(pad);
    const n = Math.max(2, Math.floor(p * N));
    const xw = W - pad - 14;
    const yh = H - pad * 1.9;
    const X = (i) => pad + xw * (i / (N - 1));
    const Y = (val) => (H - pad) - yh * val;

    // Widening CI band
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const ci = 0.025 + 0.11 * (i / N);
      const y = Y(Math.min(0.95, series[i] + ci));
      i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y);
    }
    for (let i = n - 1; i >= 0; i--) {
      const ci = 0.025 + 0.11 * (i / N);
      ctx.lineTo(X(i), Y(Math.max(0.05, series[i] - ci)));
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 212, 255, 0.10)';
    ctx.fill();

    // Mean line with glow
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      i ? ctx.lineTo(X(i), Y(series[i])) : ctx.moveTo(X(i), Y(series[i]));
    }
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 212, 255, 0.6)';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Leading dot
    ctx.beginPath();
    ctx.arc(X(n - 1), Y(series[n - 1]), 3.5, 0, Math.PI * 2);
    ctx.fillStyle = GREEN;
    ctx.fill();
  }

  function drawB(p) {
    const pad = 32;
    drawAxes(pad);
    const xw = W - pad - 14;
    const binW = xw / BINS;
    const floor = H - pad;
    const unit = 4.4; // stacked-sample height in px

    // Spawn new samples up to the target for this progress
    const target = Math.floor(p * TOTAL_SAMPLES);
    while (spawned < target) {
      const g = Math.max(-1, Math.min(1, gauss()));
      const bin = Math.round(((g + 1) / 2) * (BINS - 1));
      balls.push({ bin, y: pad / 2, v: 1.6 + rand() * 1.4 });
      spawned++;
    }

    // Falling samples
    ctx.fillStyle = ACCENT;
    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      const restY = floor - bins[b.bin] * unit - 2;
      b.y += b.v;
      b.v += 0.28;
      if (b.y >= restY) { bins[b.bin]++; balls.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(pad + binW * (b.bin + 0.5), b.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Histogram bars
    for (let i = 0; i < BINS; i++) {
      const h = bins[i] * unit;
      if (!h) continue;
      const x = pad + binW * i + 1;
      const grad = ctx.createLinearGradient(0, floor - h, 0, floor);
      grad.addColorStop(0, 'rgba(0, 212, 255, 0.85)');
      grad.addColorStop(1, 'rgba(0, 212, 255, 0.22)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, floor - h, binW - 2, h);
    }

    // Bell curve fades in once the histogram has shape
    if (p > 0.45) {
      const alpha = Math.min(1, (p - 0.45) / 0.3);
      const sigma = 0.34;
      const peak = TOTAL_SAMPLES * 0.155 * unit;
      ctx.beginPath();
      for (let x = 0; x <= 100; x++) {
        const z = (x / 100) * 2 - 1;
        const yv = Math.exp(-(z * z) / (2 * sigma * sigma));
        const px = pad + xw * (x / 100);
        const py = floor - yv * peak;
        x ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.strokeStyle = 'rgba(0, 255, 135, ' + (0.9 * alpha) + ')';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function drawC(p) {
    const pad = 26;
    const cx = 0.42, cy = 0.62, a = 1.0, b = 2.6, rot = 0.6;
    const cos = Math.cos(rot), sin = Math.sin(rot);
    const X = (ux) => pad + (W - 2 * pad) * ux;
    const Y = (uy) => pad / 2 + (H - 2 * pad) * uy;

    // Contour rings of the loss surface
    for (let l = 1; l <= 6; l++) {
      const r = l * 0.115;
      ctx.beginPath();
      for (let t = 0; t <= 64; t++) {
        const ang = (t / 64) * Math.PI * 2;
        const u = (r * Math.cos(ang)) / Math.sqrt(a);
        const v = (r * Math.sin(ang)) / Math.sqrt(b);
        const px = X(cx + cos * u - sin * v);
        const py = Y(cy + sin * u + cos * v);
        t ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0, 212, 255, ' + (0.22 - l * 0.025) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Minimum marker
    ctx.beginPath();
    ctx.arc(X(cx), Y(cy), 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();

    // Descent trail
    const n = Math.max(2, Math.floor(p * C_PATH.length));
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const px = X(C_PATH[i].x), py = Y(C_PATH[i].y);
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 1.6;
    ctx.shadowColor = 'rgba(0, 255, 135, 0.5)';
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Step markers
    for (let i = 0; i < n; i += 4) {
      ctx.beginPath();
      ctx.arc(X(C_PATH[i].x), Y(C_PATH[i].y), 1.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 135, 0.5)';
      ctx.fill();
    }

    // The ball
    const lead = C_PATH[n - 1];
    ctx.beginPath();
    ctx.arc(X(lead.x), Y(lead.y), 5, 0, Math.PI * 2);
    ctx.fillStyle = ACCENT;
    ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  resetB();

  // Only animate while visible (saves battery, pauses offscreen)
  let visible = false;
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  }, { threshold: 0.1 }).observe(canvas);

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) { t0 = null; return; }
    if (t0 === null) t0 = now;
    const el = now - t0;
    ctx.clearRect(0, 0, W, H);

    if (phase === 'A') {
      drawA(Math.min(1, el / A_DUR));
      if (el > A_DUR + A_HOLD) {
        phase = 'B'; t0 = now; resetB();
        if (caption) caption.textContent = 'Sampling · N(μ, σ²)';
      }
    } else if (phase === 'B') {
      drawB(Math.min(1, el / B_DUR));
      if (el > B_DUR + B_HOLD) {
        phase = 'C'; t0 = now;
        if (caption) caption.textContent = 'Gradient descent · minimising loss';
      }
    } else {
      // Ease-out so the ball decelerates into the minimum
      const raw = Math.min(1, el / C_DUR);
      drawC(1 - Math.pow(1 - raw, 2.2));
      if (el > C_DUR + C_HOLD) {
        phase = 'A'; t0 = now;
        if (caption) caption.textContent = 'Forecast · 95% CI';
      }
    }
  }
  requestAnimationFrame(frame);
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

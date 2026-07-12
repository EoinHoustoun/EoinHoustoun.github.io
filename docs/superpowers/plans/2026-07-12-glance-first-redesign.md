# Glance-First Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure EoinHoustoun.github.io from 8 prose-heavy sections to 5 glanceable sections with a neural-constellation canvas background, glance chips, and click-to-expand detail.

**Architecture:** Single-page vanilla site. All work happens in three files: `index.html` (restructure sections), `style.css` (new components + layering), `script.js` (constellation canvas + shared expander module, both as IIFEs matching the existing module style). No build step, no dependencies.

**Tech Stack:** Vanilla HTML/CSS/JS, Canvas 2D, GitHub Pages (push to `pages` remote).

**Spec:** `docs/superpowers/specs/2026-07-12-portfolio-glance-redesign-design.md`

## Global Constraints

- Working directory: `/Users/eoinhoustoun/Desktop/Projects/Portfolio`
- Files touched: `index.html`, `style.css`, `script.js` only (plus this plan's checkboxes). No changes to `README.md` or any GitHub project repo.
- No font-size below `0.78rem`.
- No runtime dependencies, no CDNs at runtime — all icons inline SVG.
- Both themes must work: dark (default) and `[data-theme="light"]`.
- Constellation: disabled under `prefers-reduced-motion: reduce`; paused when tab hidden; dimmed in light mode.
- Commit messages: plain, no AI references, no Co-Authored-By lines.
- Commit to `main` (local) after each task. Push to `pages` remote ONLY in the final task after full visual verification.
- Local preview for every verification step: `cd /Users/eoinhoustoun/Desktop/Projects/Portfolio && python3 -m http.server 8080` (run in background once, reuse).
- Verification is visual (static site, no test framework): load `http://localhost:8080`, screenshot with Playwright (or open in a browser), plus DOM assertions via JS in the console where given. Hard-reload (cache-bust query strings only change in the final task, so use DevTools "Disable cache" or `http://localhost:8080/?nocache=1`).

---

### Task 1: Neural constellation background canvas

**Files:**
- Modify: `index.html` (insert canvas after `<body>`, line 32)
- Modify: `style.css` (layering + translucent sections; end of file before the reduced-motion block)
- Modify: `script.js` (new IIFE appended at end)

**Interfaces:**
- Produces: `<canvas id="constellation">` fixed behind all content. CSS contract: `nav#navbar`, `section`, `footer` get `position: relative; z-index: 1`; canvas is `position: fixed; z-index: 0`. Later tasks add/remove sections freely — the canvas does not depend on section ids.

- [ ] **Step 1: Add the canvas element**

In `index.html`, immediately after `<body>` (line 32), insert:

```html
  <!-- Neural constellation background (decorative) -->
  <canvas id="constellation" aria-hidden="true"></canvas>
```

- [ ] **Step 2: Add layering + translucency CSS**

In `style.css`, append just BEFORE the `/* REDUCED MOTION */` block (line ~2293):

```css
/* ============================================================
   NEURAL CONSTELLATION BACKGROUND
   ============================================================ */
#constellation {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

/* Content sits above the canvas */
#navbar, section, footer { position: relative; z-index: 1; }

/* Let the constellation show through between blocks */
section { background-color: transparent; }
section:nth-child(even) { background-color: rgba(17, 17, 17, 0.72); }
#hero { background-color: transparent; }

[data-theme="light"] section:nth-child(even) { background-color: rgba(238, 242, 247, 0.80); }
[data-theme="light"] #hero { background-color: transparent; }
```

Note: `section { padding: 100px 0 }` at line 82 and `section:nth-child(even)` at line 86 already exist — the new rules later in the file override the background-colors by cascade order. Do NOT delete the originals (avoids touching unrelated line ranges).

- [ ] **Step 3: Add the constellation module**

Append to the end of `script.js`:

```js
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
```

- [ ] **Step 4: Verify in browser**

Start the server if not running: `python3 -m http.server 8080` (background). Load `http://localhost:8080/?nocache=1` and check:
- Constellation visible behind hero AND between/behind later sections (scroll down); moving the mouse draws links to the cursor.
- Toggle to light theme (moon/sun button): constellation dims noticeably, text contrast unaffected.
- Console: zero errors.
- DOM assertion in console: `getComputedStyle(document.getElementById('constellation')).zIndex === "0" && getComputedStyle(document.getElementById('navbar')).zIndex === "1"` → `true`.
- Emulate reduced motion (DevTools → Rendering → prefers-reduced-motion: reduce, then reload): `document.getElementById('constellation') === null` → `true`.

Take screenshots (dark hero, dark mid-page, light hero) and eyeball readability.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css script.js
git commit -m "Add neural constellation background canvas with cursor interaction"
```

---

### Task 2: Nav restructure, hero glance chips, dissolve Publication section

**Files:**
- Modify: `index.html` — nav links (lines 51–59), hero (lines 76–102), delete `#publication` section (lines 817–894)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: nav expects sections `#snapshot` (created in Task 3 — link will 404-scroll until then, acceptable mid-plan), `#experience`, `#projects`, `#contact`. Hero chip markup uses classes `.chip-row` / `.chip` (styled in Step 2, reused by Tasks 4–5). Publication content (abstract, citation, presenting photo) is REMOVED here and re-homed in Task 5's featured-card expander — Task 5 contains the full replacement markup, nothing is lost.

- [ ] **Step 1: Update nav links**

Replace the `<ul class="nav-links" ...>` contents (lines 51–59) with:

```html
      <ul class="nav-links" id="navLinks">
        <li><a href="#snapshot" class="nav-link">About</a></li>
        <li><a href="#experience" class="nav-link">Experience</a></li>
        <li><a href="#projects" class="nav-link">Projects</a></li>
        <li><a href="#contact" class="nav-link contact-nav">Contact Me</a></li>
      </ul>
```

- [ ] **Step 2: Hero — linkify Springer badge, add glance chips, retarget paper CTA**

(a) Make the published badge a link to the paper. Replace lines 76–79:

```html
          <a class="published-badge" href="https://link.springer.com/chapter/10.1007/978-3-031-96235-6_5" target="_blank" rel="noopener">
            <span class="badge-pulse"></span>
            Published Researcher &nbsp;&middot;&nbsp; AIAI 2025 &nbsp;&middot;&nbsp; Springer
          </a>
```

(b) Replace the `hero-sub` paragraph (lines 88–92) with a single sentence plus a chip row:

```html
          <p class="hero-sub">
            Building intelligent systems across machine learning, clinical AI, and AI engineering.
          </p>

          <div class="chip-row hero-chips">
            <span class="chip">AI Engineer @ TurinTech</span>
            <span class="chip">MSc AI &amp; Data Science &middot; Distinction</span>
            <span class="chip">First Class BSc &middot; UCC</span>
          </div>
```

(c) Retarget the paper CTA (line 96): change `href="#publication"` to `href="https://link.springer.com/chapter/10.1007/978-3-031-96235-6_5"` and add `target="_blank" rel="noopener"`.

(d) Add the shared chip CSS to `style.css` (append before the constellation block added in Task 1):

```css
/* ============================================================
   GLANCE CHIPS (hero, experience, projects)
   ============================================================ */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 13px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--accent);
  background: var(--accent-dim);
  border: 1px solid var(--accent-border);
  line-height: 1.5;
}

a.published-badge { cursor: pointer; }
a.published-badge:hover { opacity: 0.85; }
```

- [ ] **Step 3: Delete the Publication section**

Delete the whole block from `<!-- ===== PUBLICATION SECTION ===== -->` (line 817) through its closing `</section>` (line 894). The abstract, citation, and `aiai_presenting.jpg` photo are re-added inside the featured project card in Task 5 (full markup given there).

- [ ] **Step 4: Verify in browser**

Reload `http://localhost:8080/?nocache=1`:
- Nav shows 4 links: About, Experience, Projects, Contact Me. Experience/Projects/Contact links scroll correctly (About/#snapshot dead until Task 3 — expected).
- Hero: badge is clickable → Springer page; chips render as pills under the one-line sub; "Read My Paper" opens Springer in new tab.
- `#publication` gone: console `document.getElementById('publication') === null` → `true`.
- No console errors. Check both themes.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css
git commit -m "Slim nav to 4 links, add hero glance chips, fold publication into hero and paper links"
```

---

### Task 3: Snapshot section (About + Education + Skills merged)

**Files:**
- Modify: `index.html` — replace sections `#about` (126–193), `#education` (196–269), `#skills` (368–467, post-Task-2 line numbers will have shifted; locate by section ids) with one `#snapshot` section
- Modify: `style.css` — snapshot layout + skill tiles
- Modify: `script.js` — no changes (dataViz canvas and slideshows keep working: their element ids/classes are preserved)

**Interfaces:**
- Consumes: `.chip` / `.chip-row` from Task 2.
- Produces: `<section id="snapshot">` (nav target). Keeps `#dataViz`, `#vizCaption`, `.slideshow` markup intact so existing `initDataViz()` and `initSlideshows()` need no edits.

- [ ] **Step 1: Fetch brand SVGs for the skills grid**

Icons must be inline (no runtime CDN). Fetch official paths from the simple-icons package at build time:

```bash
mkdir -p /private/tmp/claude-501/-Users-eoinhoustoun/2fd519a1-f9de-484b-884b-7b805ae11cf8/scratchpad/icons
cd /private/tmp/claude-501/-Users-eoinhoustoun/2fd519a1-f9de-484b-884b-7b805ae11cf8/scratchpad/icons
for slug in python r pytorch scikitlearn pandas numpy plotly streamlit flask huggingface anthropic mysql; do
  curl -s -o "$slug.svg" "https://cdn.jsdelivr.net/npm/simple-icons@13/icons/$slug.svg"
done
grep -L "<svg" *.svg   # any file listed here failed to download — see fallback below
```

Each file is `<svg role="img" viewBox="0 0 24 24" xmlns="..."><title>…</title><path d="…"/></svg>`. When inlining below, copy ONLY the `<path d="…"/>` into the tile template and drop the `<title>`.

**Fallback** if a slug 404s or the CDN is unreachable: use this generic node-graph icon instead of the brand path (still inline, still looks intentional):

```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="5" cy="12" r="2.2"/><circle cx="19" cy="6" r="2.2"/><circle cx="19" cy="18" r="2.2"/><path d="M7 11l10-4M7 13l10 4"/></svg>
```

- [ ] **Step 2: Replace the three sections with `#snapshot`**

Delete sections `#about`, `#education`, `#skills` entirely and insert this single section where `#about` was. Structure: header → about row (viz canvas + short intro + stats) → education row → skills tiles.

```html
  <!-- ===== SNAPSHOT SECTION (about + education + skills) ===== -->
  <section id="snapshot">
    <div class="container">
      <div class="section-header fade-in">
        <span class="section-label">Snapshot</span>
        <h2>Who I Am, In One Screen</h2>
      </div>

      <div class="about-grid">
        <div class="about-photo fade-in">
          <div class="viz-frame">
            <canvas id="dataViz" aria-label="Animated data visualisation: a forecast line with confidence intervals and points forming a normal distribution"></canvas>
            <div class="viz-caption" id="vizCaption">Forecast &middot; 95% CI</div>
          </div>
        </div>

        <div class="about-text fade-in">
          <p>
            AI Engineer at <strong>TurinTech</strong>, building Artemis — code optimisation that makes
            LLM inference faster and cheaper. Lead author of peer-reviewed Alzheimer's research published
            by <strong>Springer (AIAI 2025)</strong>. I specialise in end-to-end ML: rigorous validation,
            interpretability, and deployment.
          </p>
          <div class="about-links">
            <a href="https://github.com/EoinHoustoun" target="_blank" rel="noopener" class="about-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a href="https://www.mygreatlearning.com/eportfolio/eoin-houstoun" target="_blank" rel="noopener" class="about-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              ePortfolio &amp; Certificate
            </a>
          </div>
        </div>

        <div class="about-stats fade-in">
          <div class="stat-card">
            <div class="stat-number">13+</div>
            <div class="stat-label">ML Projects</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">1</div>
            <div class="stat-label">Springer<br>Publication</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">2</div>
            <div class="stat-label">Clinical AI<br>Tools Deployed</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">2025</div>
            <div class="stat-label">AIAI<br>Conference</div>
          </div>
        </div>
      </div>

      <!-- Education: three compact cards -->
      <div class="snapshot-edu">
        <div class="edu-card edu-card--compact fade-in">
          <div class="edu-photo edu-photo--compact">
            <img src="docs/assets/goldsmiths_grad.jpg" alt="Eoin celebrating his MSc graduation in front of Big Ben, London" loading="lazy">
          </div>
          <div class="edu-body">
            <div class="edu-meta">
              <span class="edu-badge">Distinction &middot; 87%</span>
              <span class="edu-year">2024 – 2025</span>
            </div>
            <h3 class="edu-degree">MSc Artificial Intelligence &amp; Data Science</h3>
            <div class="edu-institution">Goldsmiths, University of London <img class="flag-icon" src="docs/assets/flag_gb.png" alt="Flag of the United Kingdom"></div>
          </div>
        </div>

        <div class="edu-card edu-card--compact fade-in">
          <div class="edu-photo edu-photo--compact">
            <div class="slideshow slideshow--crossfade" data-interval="3500">
              <img src="docs/assets/ucc_grad.jpg" alt="Eoin's BSc graduation portrait, University College Cork" class="slide active" loading="lazy">
              <img src="docs/assets/ucc_hats.jpg" alt="Eoin and classmates throwing graduation caps at UCC" class="slide" loading="lazy">
              <div class="slide-dots"></div>
            </div>
          </div>
          <div class="edu-body">
            <div class="edu-meta">
              <span class="edu-badge">First Class Honours</span>
              <span class="edu-year">2020 – 2024</span>
            </div>
            <h3 class="edu-degree">BSc Data Science &amp; Analytics</h3>
            <div class="edu-institution">University College Cork, Ireland <img class="flag-icon" src="docs/assets/flag_ie.png" alt="Flag of Ireland"></div>
          </div>
        </div>

        <div class="edu-card edu-card--compact fade-in">
          <div class="edu-photo edu-photo--compact edu-photo--badge">
            <img src="docs/assets/MIT_BADGE.png" alt="Massachusetts Institute of Technology logo" loading="lazy">
          </div>
          <div class="edu-body">
            <div class="edu-meta">
              <span class="edu-badge edu-badge-cert">Scholarship</span>
              <span class="edu-year">May – Jul 2025</span>
            </div>
            <h3 class="edu-degree">Machine Learning</h3>
            <div class="edu-institution">MIT, Remote <img class="flag-icon" src="docs/assets/flag_us.png" alt="Flag of the United States"></div>
          </div>
        </div>
      </div>

      <!-- Skills: icon tiles per category -->
      <div class="snapshot-skills fade-in">
        <div class="skill-cat">
          <h3 class="skill-cat-title">Languages &amp; Core</h3>
          <div class="skill-tiles">
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="[PYTHON PATH FROM python.svg]"/></svg><span>Python</span></div>
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="[R PATH FROM r.svg]"/></svg><span>R</span></div>
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="[MYSQL PATH FROM mysql.svg]"/></svg><span>SQL</span></div>
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="[PANDAS PATH FROM pandas.svg]"/></svg><span>pandas</span></div>
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="[NUMPY PATH FROM numpy.svg]"/></svg><span>NumPy</span></div>
          </div>
        </div>

        <div class="skill-cat">
          <h3 class="skill-cat-title">ML &amp; AI</h3>
          <div class="skill-tiles">
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="[PYTORCH PATH FROM pytorch.svg]"/></svg><span>PyTorch</span></div>
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="[SCIKITLEARN PATH FROM scikitlearn.svg]"/></svg><span>scikit-learn</span></div>
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v4M12 17v4M5 12H3m18 0h-2M7 7 5.5 5.5m13 13L17 17M7 17l-1.5 1.5m13-13L17 7"/><circle cx="12" cy="12" r="3.5"/></svg><span>XGBoost</span></div>
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="[HUGGINGFACE PATH FROM huggingface.svg]"/></svg><span>Transformers</span></div>
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 17l4-6 4 3 5-8 5 9"/><path d="M3 21h18"/></svg><span>SHAP</span></div>
          </div>
        </div>

        <div class="skill-cat">
          <h3 class="skill-cat-title">AI Engineering</h3>
          <div class="skill-tiles">
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="[ANTHROPIC PATH FROM anthropic.svg]"/></svg><span>Claude API</span></div>
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/><path d="M12 7.2 6 17m6-9.8L18 17M7.2 19h9.6"/></svg><span>Multi-Agent Systems</span></div>
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 17V9m5 8V5m5 12v-6m5 6V8"/><path d="M3 21h18"/></svg><span>LLM Benchmarking</span></div>
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg><span>Prompt Engineering</span></div>
          </div>
        </div>

        <div class="skill-cat">
          <h3 class="skill-cat-title">Tooling &amp; Delivery</h3>
          <div class="skill-tiles">
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="[STREAMLIT PATH FROM streamlit.svg]"/></svg><span>Streamlit</span></div>
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="[PLOTLY PATH FROM plotly.svg]"/></svg><span>Plotly</span></div>
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="[FLASK PATH FROM flask.svg]"/></svg><span>Flask</span></div>
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 17l4-8 4 5 3-3 4 6"/><path d="M3 21h18M3 3v18"/></svg><span>Matplotlib / Seaborn</span></div>
            <div class="skill-tile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M7 21h10M9 7l3 3-3 3M13 13h3"/></svg><span>Gradio</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>
```

Replace every `[… PATH FROM slug.svg]` placeholder with the actual `d` attribute from the fetched files (Step 1). If a fetch failed, swap the whole `<svg>…</svg>` for the fallback node-graph icon from Step 1.

- [ ] **Step 3: Add snapshot CSS**

Append to `style.css` (after the chip block from Task 2):

```css
/* ============================================================
   SNAPSHOT SECTION (education row + skill tiles)
   ============================================================ */
.snapshot-edu {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 56px;
}

.edu-card--compact {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.edu-photo--compact {
  width: 100%;
  height: 150px;
  overflow: hidden;
  border-radius: var(--radius-md);
}
.edu-photo--compact img { width: 100%; height: 100%; object-fit: cover; }
.edu-photo--compact.edu-photo--badge img { object-fit: contain; padding: 14px; }
.edu-photo--compact .slideshow { width: 100%; height: 100%; position: relative; overflow: hidden; }

.snapshot-skills {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 56px;
}

.skill-cat-title {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.skill-tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
  gap: 10px;
}

.skill-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 6px;
  text-align: center;
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-md);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: transform var(--transition), border-color var(--transition), color var(--transition);
}
.skill-tile:hover {
  transform: translateY(-3px);
  border-color: var(--accent-border);
  color: var(--text-primary);
}
.skill-tile svg { width: 26px; height: 26px; color: var(--accent); }

[data-theme="light"] .skill-tile { border-color: rgba(15, 26, 36, 0.10); }

@media (max-width: 900px) {
  .snapshot-edu { grid-template-columns: 1fr; }
  .snapshot-skills { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Verify in browser**

Reload `http://localhost:8080/?nocache=1`:
- Nav "About" now scrolls to Snapshot.
- DataViz canvas still animates through its three scenes (id unchanged); UCC slideshow still cycles.
- Education renders as a 3-across compact row (stacked at ≤900px — resize to 375px).
- Skill tiles show icons + labels in 4 categories; hover lifts a tile; light theme legible.
- Console assertions: `['about','education','skills'].every(id => document.getElementById(id) === null)` → `true`; `document.getElementById('snapshot') !== null` → `true`; no console errors.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css
git commit -m "Merge about, education and skills into glanceable Snapshot section with skill icon tiles"
```

---

### Task 4: Shared expander module + Experience glance timeline

**Files:**
- Modify: `script.js` — new `initExpanders()` IIFE at end
- Modify: `style.css` — expander styles
- Modify: `index.html` — the three `.timeline-card` bodies inside `#experience`

**Interfaces:**
- Consumes: `.chip` / `.chip-row` (Task 2).
- Produces: expander contract used verbatim by Task 5: a `<button class="expander-toggle" aria-expanded="false" aria-controls="ID"><span class="expander-label">Details</span><svg …chevron…></svg></button>` followed by `<div class="expander-body" id="ID">…</div>`. JS hides all `.expander-body` on load (no-JS users see content expanded, per spec §8) and toggles `hidden` + `aria-expanded` + label text on click.

- [ ] **Step 1: Add the expander module to `script.js`**

Append:

```js
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
```

- [ ] **Step 2: Add expander CSS to `style.css`**

Append after the snapshot block:

```css
/* ============================================================
   EXPANDERS (details reveal on cards)
   ============================================================ */
.expander-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 7px 14px;
  font-family: var(--font);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  cursor: pointer;
  transition: color var(--transition), border-color var(--transition);
}
.expander-toggle:hover { color: var(--text-primary); border-color: var(--accent-border); }
.expander-toggle svg { transition: transform var(--transition); }
.expander-toggle[aria-expanded="true"] svg { transform: rotate(180deg); }

.expander-body { margin-top: 14px; }

[data-theme="light"] .expander-toggle { border-color: rgba(15, 26, 36, 0.18); }
```

- [ ] **Step 3: Rewrite the three timeline card bodies**

In `#experience`, replace each `.timeline-body`'s content BELOW the `.timeline-company` line (i.e. replace each `<ul class="timeline-bullets">…</ul>`) with a glance line + chips + expander. Timeline photos, markers, meta rows stay untouched.

TurinTech card:

```html
              <p class="timeline-glance">Building <strong>Artemis</strong> — code optimisation that makes LLM inference faster and cheaper.</p>
              <div class="chip-row">
                <span class="chip">Multi-agent systems &middot; Claude API</span>
                <span class="chip">LLM benchmarking</span>
                <span class="chip">A/B-tested optimisations</span>
              </div>
              <button class="expander-toggle" type="button" aria-expanded="false" aria-controls="exp-turintech">
                <span class="expander-label">Details</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div class="expander-body" id="exp-turintech">
                <ul class="timeline-bullets">
                  <li>Developing Artemis, TurinTech's code optimisation product that makes LLM inference faster and cheaper for engineering teams.</li>
                  <li>Building an auto-discovery tool that surfaces optimisation opportunities across codebases and LLM workloads; A/B testing optimisations with statistical modelling to validate and stabilise results.</li>
                  <li>Benchmarking and optimising LLMs and ML models within a dedicated research team, designing evaluation frameworks for performance and efficiency.</li>
                  <li>Designing multi-agent and subagent systems with the Claude API, including an in-product AI assistant that guides users through Artemis.</li>
                  <li>Supporting technical pre-sales, walking client engineering teams through the auto-discovery optimisation tool.</li>
                </ul>
              </div>
```

Goldsmiths card:

```html
              <p class="timeline-glance">Published <strong>Alzheimer's classification research</strong> — Springer, AIAI 2025.</p>
              <div class="chip-row">
                <span class="chip">Springer publication</span>
                <span class="chip">SHAP + FDR feature selection</span>
                <span class="chip">Presented in Cyprus</span>
              </div>
              <button class="expander-toggle" type="button" aria-expanded="false" aria-controls="exp-goldsmiths">
                <span class="expander-label">Details</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div class="expander-body" id="exp-goldsmiths">
                <ul class="timeline-bullets">
                  <li>Built classification pipelines on blood-based biomarkers using nested cross-validation and calibration, improving accuracy over baselines.</li>
                  <li>Applied FDR-controlled feature selection and SHAP to identify protein importance, delivering clinician-readable reports.</li>
                  <li>Published in Springer (AIAI 2025) and presented findings at the AIAI 2025 conference in Cyprus.</li>
                </ul>
              </div>
```

AB InBev card:

```html
              <p class="timeline-glance">Statistical analysis and NLP across <strong>16+ global consumer-data projects</strong>.</p>
              <div class="chip-row">
                <span class="chip">16+ projects</span>
                <span class="chip">NLP survey pipelines</span>
                <span class="chip">Reporting: 5 days &rarr; 3</span>
              </div>
              <button class="expander-toggle" type="button" aria-expanded="false" aria-controls="exp-abinbev">
                <span class="expander-label">Details</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div class="expander-body" id="exp-abinbev">
                <ul class="timeline-bullets">
                  <li>Delivered statistical analysis across 16+ projects on consumer and sensory data, informing global product decisions.</li>
                  <li>Designed NLP pipelines for survey responses (translation, tokenisation, sentiment), cutting manual review time significantly.</li>
                  <li>Built predictive models to forecast purchase intent from sensory and chemical attributes, supporting faster prototype iteration.</li>
                  <li>Automated reporting workflows including a PowerPoint generator, reducing project setup time from 5 days to 3.</li>
                </ul>
              </div>
```

Add the glance-line style to `style.css` (with the expander CSS):

```css
.timeline-glance {
  margin-top: 8px;
  font-size: 0.95rem;
  color: var(--text-primary);
}
```

- [ ] **Step 4: Verify in browser**

Reload `http://localhost:8080/?nocache=1`:
- Each role shows one line + 3 chips + a "Details" pill; bullets hidden.
- Clicking "Details" reveals bullets, chevron flips, label becomes "Hide details"; clicking again collapses. Keyboard: Tab to the button, Enter toggles.
- Console: `document.querySelectorAll('.expander-body').length === 3` and all `hidden` on load → `[...document.querySelectorAll('.expander-body')].every(b => b.hidden)` → `true`.
- With JS disabled (DevTools → Ctrl/Cmd+Shift+P → "Disable JavaScript", reload): bullets are visible (expanded fallback).

- [ ] **Step 5: Commit**

```bash
git add index.html style.css script.js
git commit -m "Compress experience timeline to glance lines with metric chips and details expanders"
```

---

### Task 5: Projects glance cards + featured-card publication expander

**Files:**
- Modify: `index.html` — all 10 `.project-card` bodies in `#projects`
- Modify: `style.css` — one small rule

**Interfaces:**
- Consumes: `.chip`/`.chip-row` (Task 2), expander contract (Task 4 — `initExpanders()` picks up new expanders automatically since it runs on load after this HTML exists).
- Produces: final `#projects` markup. Card images, `.card-header` badges, `<h3>` titles, `.tech-stack` pills, and `.card-actions` links all stay untouched — only each card's `<p>` description is replaced by glance line + chips + expander.

- [ ] **Step 1: Rewrite the featured Alzheimer's card body (absorbs the publication)**

Replace the featured card's `<p>…</p>` (between `<h3>Alzheimer's Disease Classification</h3>` and `<div class="tech-stack">`) with:

```html
          <p class="project-glance">ML classification of Alzheimer's cognitive states from digital biomarkers — peer-reviewed and published by Springer.</p>
          <div class="chip-row">
            <span class="chip">Springer &middot; AIAI 2025</span>
            <span class="chip">Presented in Limassol, Cyprus</span>
            <span class="chip">Bio-Hermes cohort</span>
          </div>
          <button class="expander-toggle" type="button" aria-expanded="false" aria-controls="exp-alzheimers">
            <span class="expander-label">Details</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="expander-body" id="exp-alzheimers">
            <p>
              Classified individuals into cognitive states of Alzheimer's disease using machine learning on the
              Bio-Hermes dataset. Employing XGBoost, Random Forest, and Monte Carlo cross-validation with rigorous
              feature selection, the work demonstrates high-accuracy classification from digital biomarker data,
              advancing clinical AI decision-support for neurodegenerative conditions. Invited to present at the
              AIAI 2025 International Conference in Limassol, Cyprus.
            </p>
            <figure class="pub-photo pub-photo--card">
              <img src="docs/assets/aiai_presenting.jpg" alt="Eoin presenting his research at the AIAI 2025 conference in Limassol, Cyprus" loading="lazy">
              <figcaption>Presenting at AIAI 2025 &middot; Limassol, Cyprus</figcaption>
            </figure>
            <div class="pub-citation">
              <span class="citation-label">Cite as</span>
              <blockquote class="citation-text">
                Houstoun, E. et al. (2025). Classifying Cognitive States of Alzheimer's Disease with Machine
                Learning Using Digital Biomarkers from the Bio-Hermes Study Cohort. In: <em>Artificial Intelligence
                Applications and Innovations</em>. AIAI 2025. IFIP Advances in Information and Communication
                Technology, vol 758, pp. 55–68. Springer, Cham. https://doi.org/10.1007/978-3-031-96235-6_5
              </blockquote>
            </div>
          </div>
```

`.pub-citation`, `.citation-label`, `.citation-text`, `.pub-photo` styles already exist in `style.css` (they styled the deleted section) — do not remove them. Add one sizing rule with the other new CSS:

```css
.project-glance { font-size: 0.95rem; }
.pub-photo--card { max-width: 420px; margin: 16px 0; }
.pub-photo--card img { border-radius: var(--radius-md); }
```

- [ ] **Step 2: Rewrite the nine remaining card bodies**

Same pattern for each: replace the `<p>` with `<p class="project-glance">ONE-LINER</p>`, a `chip-row`, an `expander-toggle` (unique `aria-controls`), and an `expander-body` containing the ORIGINAL paragraph text verbatim. Exact content:

| Card | id | Glance line | Chips |
|---|---|---|---|
| Fever Prediction | `exp-fever` | Non-contact fever detection and oral-temperature estimation from infrared thermal data. | `Custom PyTorch MLPs` / `SHAP interpretability` / `Nested CV` |
| Pediatric Appendicitis | `exp-appendicitis` | Clinical decision support for appendicitis diagnosis and severity — live and interactive. | `Live Gradio demo` / `Diagnosis + severity` / `XGBoost + MLP` |
| PL Match Predictor | `exp-fpred` | Ensemble match-outcome predictor with a Kelly-sized mock betting portfolio. | `Dixon-Coles ensemble` / `Kelly criterion sizing` / `Live odds integration` |
| Fantasy Football AI | `exp-fpl` | FPL analytics platform driving transfer, captain and chip decisions. | `XGBoost point predictions` / `Dixon-Coles team strength` / `EWM player form` |
| Transfer Intelligence | `exp-fti` | Stacked ensemble predicting EPL transfer adaptation, served via a Flask API. | `XGBoost + LightGBM stack` / `Optuna HPO` / `xG / xA features` |
| Validation Procedures | `exp-validation` | Transfer-fee prediction as a rigorous case study in validation methodology. | `CV variants compared` / `Temporal validation` / `Bootstrapping` |
| Neural Style Transfer | `exp-nst` | Celebrity faces re-rendered as comic-book art with deep neural style transfer. | `VGG19` / `Content + style loss` |
| AI Chef Chatbot | `exp-chef` | Ingredient-aware recipe chatbot with semantic search. | `DistilBERT similarity` / `TF-IDF retrieval` / `Live web scraping` |
| YouTube Sentiment | `exp-yt` | Comment sentiment and six-emotion detection with an engagement health score. | `RoBERTa + DistilRoBERTa` / `6-emotion detection` / `PDF/CSV export` |

Full markup for the first (Fever) as the literal template — repeat with each row's values and each card's original `<p>` text moved inside `expander-body`:

```html
          <p class="project-glance">Non-contact fever detection and oral-temperature estimation from infrared thermal data.</p>
          <div class="chip-row">
            <span class="chip">Custom PyTorch MLPs</span>
            <span class="chip">SHAP interpretability</span>
            <span class="chip">Nested CV</span>
          </div>
          <button class="expander-toggle" type="button" aria-expanded="false" aria-controls="exp-fever">
            <span class="expander-label">Details</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="expander-body" id="exp-fever">
            <p>
              Estimates oral temperature and detects fever from non-contact infrared thermal sensor data.
              Features custom PyTorch MLPs and rigorous SHAP-based model interpretability.
            </p>
          </div>
```

Rule: NO invented numbers. Chips state only facts already on the page or in the repo READMEs.

- [ ] **Step 3: Verify in browser**

Reload `http://localhost:8080/?nocache=1`:
- Every project card: image + badges + title + one-liner + chips + Details pill + tech pills + buttons. No visible paragraphs by default.
- Featured card expander reveals abstract, presenting photo, and citation block (citation styles intact).
- "Show all projects" toggle still works and reveals `extra` cards + secondary grid; expanders inside revealed cards work.
- Console: `document.querySelectorAll('#projects .expander-body').length === 10` → `true`; no errors. Check light theme and 375px width.

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "Convert project cards to glance view with fact chips and details expanders; fold publication detail into featured card"
```

---

### Task 6: Full-site verification and deploy

**Files:**
- Modify: `index.html` — cache-bust version bumps (lines 30 and 975: `style.css?v=2` → `?v=3`, `script.js?v=2` → `?v=3`)

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Bump cache-bust versions**

In `index.html` change `style.css?v=2` → `style.css?v=3` and `script.js?v=2` → `script.js?v=3`.

- [ ] **Step 2: Full visual sweep**

At `http://localhost:8080` (fresh load, no cache), verify each item and screenshot:
1. Dark desktop (1440px): hero (chips, constellation, badge link), Snapshot, Experience, Projects, Contact — one screenshot each.
2. Light theme: hero + Snapshot + Projects screenshots; constellation dimmed; every chip/tile/expander legible.
3. Mobile 375px: nav hamburger works; snapshot stacks; edu row stacks; chips wrap; cards single-column.
4. Reduced-motion emulation: no constellation canvas, all content visible (`.fade-in` forced visible by the existing CSS block).
5. Tab-hidden pause: switch tabs ~10s, return — animation resumes without a jump (nodes frozen while hidden).
6. All external links resolve (Springer ×3, GitHub repos, LinkedIn, ePortfolio, AIAI link removed with pub section — confirm no dead `#publication` hrefs remain: `document.querySelectorAll('a[href="#publication"]').length === 0` → `true`).
7. Scroll depth sanity: `document.body.scrollHeight` should be well under the pre-redesign height (record both numbers; expect roughly 30–40% shorter with all expanders closed).
8. Console: zero errors across all of the above.

Fix anything that fails before proceeding. If a fix is non-trivial, re-run the affected checks.

- [ ] **Step 3: Commit and deploy**

```bash
git add index.html
git commit -m "Bump asset cache versions for redesign release"
git push origin main
git push pages main
```

- [ ] **Step 4: Verify live site**

Wait ~2 minutes for GitHub Pages, then load https://EoinHoustoun.github.io (hard reload). Confirm constellation, chips, expanders, and both themes on the live site. If Pages serves stale assets, confirm the `?v=3` query strings are present in the served HTML.

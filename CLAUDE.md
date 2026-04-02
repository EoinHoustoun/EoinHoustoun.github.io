# Claude Instructions — Eoin Houstoun Portfolio

This is Eoin Houstoun's personal portfolio repository, deployed as a GitHub Pages site at **https://EoinHoustoun.github.io**.

The portfolio showcases data science and AI engineering projects. Eoin has a **published research paper at AIAI 2025 (Springer)** — this is his lead credential and must always be treated as the most prominent item.

---

## How to Add a New Project (Autonomous Workflow)

When Eoin gives you a new project folder or repo to add, do ALL of the following without asking — this is the full expected workflow:

### Step 1 — Understand the project
Read the existing code, notebooks, and any existing README in the project folder/repo. Extract:
- What problem it solves
- What models/techniques were used
- Any real metrics or results (accuracy, F1, AUC, RMSE, etc.)
- What language/libraries were used
- Whether there is a live demo (Gradio, Streamlit, etc.)

### Step 2 — Write the project README
Write a professional README.md for the project repo following this exact template:

```markdown
# [Project Title]

[1-2 sentence description of what the project does and why it matters]

[![Python](badge)] [other relevant badges]

## Overview
- **Problem:** what problem is being solved
- **Approach:** what ML/AI methods were used
- **Result:** key metric or outcome (use real numbers if available)

## Key Features
- Bullet points of technical depth

## Tech Stack
| Category | Tools |
|---|---|
| Language | Python / R |
| Models | ... |
| Libraries | ... |
| Visualisation | ... |

## Results
[Key findings with real metrics in tables where possible]

## How to Run
[install + run commands]

## Project Structure
[brief file tree]

---
*Part of Eoin Houstoun's Data Science Portfolio — [github.com/EoinHoustoun](https://github.com/EoinHoustoun)*
```

Rules for the README:
- Use shields.io badges at top for language and key libraries
- If there's a live Gradio/Streamlit demo, add a badge at the very top
- Keep language confident: "achieved", "demonstrated", "deployed"
- Every sentence must add value — no filler
- Use real numbers from the code/results wherever possible

### Step 3 — Add a project card to index.html
Open `index.html` and add a new `<div class="project-card fade-in">` inside `.projects-grid`, before the secondary projects section.

**Card template:**
```html
<div class="project-card fade-in">
  <div class="card-header">
    <span class="category-badge badge-[CATEGORY]">[Category Label]</span>
    <!-- Add live-badge if there's a deployed demo -->
  </div>
  <h3>[Project Title]</h3>
  <p>[2-3 sentence description. Use <em> tags for key library names.]</p>
  <div class="tech-stack">
    <span>[Tool]</span><span>[Tool]</span>
  </div>
  <div class="card-actions">
    <a href="https://github.com/EoinHoustoun/[REPO]" target="_blank" rel="noopener" class="card-btn">View on GitHub →</a>
  </div>
</div>
```

**Category badge classes** — pick the most appropriate:
| Badge class | Use for |
|---|---|
| `badge-research` | Academic / published work |
| `badge-clinical` | Healthcare, medical, clinical AI |
| `badge-cv` | Computer vision, image models |
| `badge-nlp` | NLP, transformers, text models |
| `badge-ds` | General data science, analytics |
| `badge-ai-eng` | AI engineering, agents, APIs |

**Live demo badge** (add inside `.card-header` if deployed):
```html
<span class="live-badge"><span class="live-dot"></span> Live Demo</span>
```

### Step 4 — Add the project to README.md
Add a new row to the projects table in `README.md`:
```markdown
| [Project Name](https://github.com/EoinHoustoun/REPO) | Category | Key Models | Status |
```

Then add a project highlight section following the same pattern as existing ones (title, description, bullet points, image if available, repo link).

### Step 5 — Push everything

**Push to the portfolio GitHub Pages repo:**
```bash
# Stage and commit
git add index.html README.md
git commit -m "Add [project name] to portfolio"
git push pages main
```

**Push the new project README** (if it's a separate repo) using the GitHub API:
```bash
TOKEN="[get from: git remote get-url pages]"

# Get current SHA
SHA=$(curl -s -H "Authorization: token $TOKEN" \
  "https://api.github.com/repos/EoinHoustoun/[REPO]/contents/README.md" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sha',''))")

# Push new README
CONTENT=$(base64 -w 0 /tmp/new_readme.md)
curl -s -X PUT \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/EoinHoustoun/[REPO]/contents/README.md" \
  -d "{\"message\":\"Rewrite README — recruiter-optimised\",\"content\":\"$CONTENT\",\"sha\":\"$SHA\"}"
```

To get the token: `git remote get-url pages` — it's embedded in the URL.

---

## Portfolio Structure

```
PORT/
├── index.html        # Single-page portfolio site — all 6 sections
├── style.css         # All styling — edit this for design changes
├── script.js         # Typing effect, scroll animations, mobile nav
├── README.md         # GitHub profile README (recruiter-facing)
├── CLAUDE.md         # This file
└── docs/
    └── assets/
        ├── headshot.png         # Eoin's photo (used in About section)
        ├── Research_Image.png   # Alzheimer's project image
        ├── infra.png            # Infrared thermography image
        ├── poster.png           # Appendicitis project image
        ├── ai_chef.png          # AI Chef project image
        ├── int_val.png          # Validation procedures image
        └── MIT_BADGE.png        # MIT certification badge
```

---

## Design System

**Colours:**
- Background darkest: `#0a0a0a`
- Background dark: `#111111`
- Card background: `#161616`
- Accent (electric blue): `#00d4ff`
- Text primary: `#ffffff`
- Text secondary: `#a0a0a0`

**Font:** Inter (Google Fonts)

**Key CSS classes:**
- `.fade-in` — add to any new element that should animate in on scroll
- `.project-card` — standard project card
- `.project-card.featured` — full-width lead project card (Alzheimer's only)
- `.card-btn` — primary GitHub link button
- `.card-btn.card-btn-secondary` — secondary button (e.g. paper link)
- `.tech-stack span` — grey pill tags for tools

---

## Existing Projects (do not duplicate)

| # | Project | Repo | Category |
|---|---------|------|----------|
| 1 | Alzheimer's Disease Classification | Alzheimers_Biohermes | Research — LEAD (featured card, Springer badge) |
| 2 | Fever Prediction with Infrared Thermography | Infrared_Thermography | Clinical AI |
| 3 | Pediatric Appendicitis Prediction | Pediatric_Appendicitis | Clinical AI + Live Demo |
| 4 | Neural Style Transfer | Generative_AI | Computer Vision |
| 5 | AI Chef Chatbot | AI_Chef | NLP |
| 6 | Validation Procedures Exploration | Final-Year-Project | Research |
| 7 | Amazon Recommendation System | — | NLP/RecSys (secondary card) |
| 8 | Retail Customer Prediction | — | Data Science (secondary card) |
| 9 | Customer Segmentation | — | Data Science (secondary card) |

Projects 1–6 are full cards in `.projects-grid`. Projects 7–9 are smaller cards in `.secondary-grid`. New projects should go into `.projects-grid` unless they are minor, in which case `.secondary-grid`.

---

## Key Links

- Live site: https://EoinHoustoun.github.io
- GitHub Pages repo: https://github.com/EoinHoustoun/EoinHoustoun.github.io
- Springer paper: https://link.springer.com/chapter/10.1007/978-3-031-96235-6_5
- MIT ePortfolio: https://www.mygreatlearning.com/eportfolio/eoin-houstoun

---

## Git Remotes

| Remote | Points to |
|---|---|
| `origin` | https://github.com/EoinHoustoun/Eoin_Houstoun_Portfolio (source/backup) |
| `pages` | https://github.com/EoinHoustoun/EoinHoustoun.github.io (live site) |

Always push portfolio changes to `pages`. The personal access token is embedded in the `pages` remote URL — retrieve it with `git remote get-url pages`.

**Note:** Eoin has two GitHub accounts. Work account is the VSCode default. Personal account is EoinHoustoun — credentials handled via PAT in the remote URL.

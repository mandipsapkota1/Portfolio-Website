# Astro Portfolio Redesign — Design Spec
**Date:** 2026-05-14
**Owner:** Mandip Sapkota
**Approach:** Astro Static + Vanilla JS Islands (Approach A)

---

## 1. Overview

Rebuild the existing single-file HTML/CSS/JS portfolio into a proper Astro project structure. The redesign elevates the current dark theme into a dark-futuristic glassmorphism aesthetic while preserving every piece of content exactly. A new Projects section is added. All animations become rich and scroll-triggered.

**Non-goals:** No React, no Tailwind, no server-side rendering, no CMS, no light mode.

---

## 2. Project Structure

```
Portfolio/
├── public/
│   └── images/
│       ├── home.JPG
│       └── about.JPG
├── src/
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── Journey.astro
│   │   ├── Skills.astro
│   │   ├── Projects.astro
│   │   ├── Contact.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── styles/
│   │   ├── global.css
│   │   └── animations.css
│   ├── scripts/
│   │   ├── cursor.js
│   │   ├── nav.js
│   │   ├── typed.js
│   │   ├── animations.js
│   │   └── contact.js
│   └── pages/
│       └── index.astro
├── astro.config.mjs
└── package.json
```

---

## 3. Design Tokens

### Preserved from current site
```css
--bg:       #07090f
--bg2:      #0d1220
--bg3:      #121a2b
--yellow:   #e8ff48
--yellow2:  #cce630
--text:     #eef0f4
--muted:    #7a8499
--border:   rgba(255,255,255,.08)
--radius:   10px
--hh:       68px
--fhead:    'Syne', sans-serif
--fbody:    'DM Sans', sans-serif
```

### New additions
```css
--glass:        rgba(13,18,32,.6)
--glass-border: rgba(232,255,72,.12)
--glow:         rgba(232,255,72,.08)
```

---

## 4. Component Specifications

### 4.1 BaseLayout.astro
- `<html lang="en">` with full `<head>`: charset, viewport, title, Open Graph meta
- Google Fonts: Syne (400/600/700/800) + DM Sans (300/400/500) via `<link>`
- Boxicons 2.1.4 via CDN `<link>`
- EmailJS `@4` via CDN `<script>` (before `</body>`)
- Global slot for page content
- Loads all scripts from `src/scripts/` as `type="module"` before `</body>`

### 4.2 Header.astro
- Fixed, full-width, `z-index: 1000`
- On scroll > 50px: `background: var(--glass)`, `backdrop-filter: blur(20px)`, `box-shadow: 0 1px 0 var(--border)`
- Logo: `Mandip<span>.</span>` — Syne 800, yellow dot
- Nav links: Home, About, Journey, Skills, Projects, Contact
- Active link: yellow underline dot (not background fill)
- Mobile (< 768px): hamburger → slide-in drawer from right, same overlay behavior as current
- Source inspiration: 21st.dev glassmorphism navbar

### 4.3 Hero.astro
Layout: CSS flexbox, text left (`flex: 1`), photo right (`flex: 0 0 380px`). Stacks to column below 1100px.

**Content (verbatim):**
- Badge: `● Available for work`
- H1: `Mandip` / `Sapkota` (two lines, second in yellow)
- Role line: `I'm a [typed]|` — roles: `['Web Developer','UI Designer','PHP Developer','Problem Solver']`
- Bio: "Web developer & designer crafting seamless digital experiences with HTML, CSS, JavaScript, PHP & Python. Passionate about clean code and beautiful interfaces."
- CTAs: `Let's Work Together →` (btn-solid) + `View My Work` (btn-outline)
- Socials: Facebook, LinkedIn, GitHub

**Photo block:**
- `320×380px` rounded card, `border: 1px solid var(--border)`, yellow box-shadow glow
- Ambient radial glow behind photo: 500px circle, `var(--glow)`, animated pulse (6s loop)
- Stat card top-right: briefcase icon + `20+` / `Projects` — glassmorphism
- Stat card bottom-left: star icon + `3+` / `Years Exp.` — glassmorphism
- Both stat cards float (4s translateY loop)

**Entrance animations (load):**
- Name lines: `translateX(-20px) → 0`, `opacity 0 → 1`, stagger `0s` / `0.15s`
- Role line: fade up, `0.3s` delay
- Bio + buttons: fade up, `0.5s` delay
- Photo: `scale(0.92) → 1` + glow bloom, `0.4s` delay

### 4.4 About.astro
Section label: `01 — About`

**Content (verbatim):**
- H2: `Turning ideas into digital reality`
- P1: "I'm an enthusiastic developer deeply passionate about web development, proficient in HTML, CSS, JavaScript, PHP, and Python. My portfolio showcases my commitment to creating engaging and functional web experiences."
- P2: "Currently pursuing my BSc.IT at ISMT College, I stay at the forefront of this dynamic field through continuous learning and innovation."
- Counters: `3+` Years coding | `20+` Projects built | `6+` Technologies
- CTA: `Get In Touch →`

**Cards (verbatim):**
1. Code icon — Clean Code — "Maintainable, scalable and well-documented code on every project."
2. Palette icon — Creative Design — "Combining aesthetics with functionality for interfaces users love."
3. Mobile icon — Responsive — "Flawless layouts across every screen size and device."
4. Rocket icon — Performance — "Optimised for speed and efficiency — fast sites make happy users."

Cards use `--glass` background, `--glass-border`, icon glows yellow on hover. Count-up animation on first scroll entry (runs once).

### 4.5 Journey.astro
Section label: `02 — Journey`, H2: `Education & Experience`

**Education (verbatim):**
- 2022–2025 | BSc. Information Technology | ISMT College
- 2016–2019 | High School (+2) — Management | Aroma College
- 2006–2014 | School Leaving Certificate | VSSS

**Experience (verbatim):**
- 2020–2023 | Application Developer | Android Studio
- 2017–2019 | Database Administrator | Full-time
- 2014–2015 | Web Developer | Agency

Timeline line: gradient `var(--yellow) → transparent` top-to-bottom. Dots: pulse ripple on scroll entry. Items: slide in from column side (`translateX ±30px`) on scroll.

### 4.6 Skills.astro
Section label: `03 — Skills`, H2: `My Toolkit`

**Technical Skills:**
- HTML5: 80% | CSS3: 70% | JavaScript: 50% | PHP: 70% | Python: 40%

**Professional Skills:**
- Web Design: 75% | Web Development: 50% | Graphic Design: 45% | Android Studio: 60%

Bar fill: gradient `var(--yellow) → var(--yellow2)`. Glow tip: 4px yellow blur pseudo-element tracks fill edge. Tech badges (8): HTML5, CSS3, JavaScript, PHP, Python, GitHub, Android, SQL. Badge hover: lift + yellow border glow.

Source inspiration: 21st.dev animated progress bar component.

### 4.7 Projects.astro *(new)*
Section label: `04 — Projects`, H2: `Featured Work`

6 placeholder cards in a 3-column responsive grid (→ 2-col → 1-col). Each card:
- Glass background (`--glass`, `--glass-border` top border 2px)
- Number: `01` – `06` (yellow, Syne, small)
- Name: `Project 0N`
- Description: 2-line placeholder
- Tech tags: 2–3 pill badges (e.g., HTML, CSS, JS)
- Icons: GitHub link + Live link (both `href="#"`)
- Hover: `translateY(-8px)`, intensified glow, top border → `var(--yellow)` full opacity

Source inspiration: 21st.dev tilt project card with hover glow.

### 4.8 Contact.astro
Section label: `05 — Contact`

**Info column (verbatim):**
- H2: `Let's build something great`
- P: "Have a project in mind or just want to say hello? I'd love to hear from you."
- Email: mandip.sapkota123@gmail.com
- Phone: +977 9840318084
- Location: Kathmandu, Nepal
- Socials: Facebook, LinkedIn, GitHub

**Form:** Glass card, fields: Full Name*, Email*, Phone, Subject*, Message* (textarea 6 rows). EmailJS config:
```js
publicKey:  'qvqoDbjtLreWA8o2_'
serviceId:  'service_0o0vpd9'
templateId: 'template_m3wzt66'
```
Submit button: spinner state on send, success/error message toast below form.

### 4.9 Footer.astro
Three columns: Brand+socials | Quick Links | Get In Touch. Same copyright `© 2024 Mandip Sapkota`. Back-to-top button. Nav updated to include Projects link.

---

## 5. Animation System

### Global Scroll Reveal
`IntersectionObserver` — threshold `0.12`. Entry: `opacity 0→1`, `translateY 24px→0`, `0.6s ease-out`. Children stagger `0.1s` each via `--delay` CSS variable.

### Cursor
Dot: 6px yellow circle. Ring: 32px, `border: 1.5px solid rgba(232,255,72,.5)`, lags behind with lerp factor `0.07`. Scales to 48px on interactive element hover. Hidden on touch devices.

### Specific Animations
| Element | Animation | Trigger |
|---|---|---|
| Hero name lines | slideX(-20px)→0 + fadeIn, stagger 0.15s | page load |
| Hero photo | scale(0.92)→1 + glow bloom | page load |
| Stat cards | float translateY 0→-7px, 4s loop | continuous |
| About counters | count-up 0→N over 1.2s | scroll entry, once |
| Timeline dots | ripple box-shadow expand+fade | scroll entry |
| Timeline items | translateX(±30px)→0 + fadeIn | scroll entry |
| Skill bar fills | width 0→N% over 1.1s | scroll entry, once |
| Skill bar tip | glow pseudo-element tracks fill | during bar animation |
| Project cards | translateY(-8px) + glow intensify | hover |
| Section scan line | horizontal sweep opacity 0.04→0 | first viewport entry |
| Background glow | pulse opacity 0.06→0.12, 6s loop | continuous |

### Performance
- Only `transform` + `opacity` animated (no layout thrash)
- `prefers-reduced-motion`: all animations disabled, final state shown immediately
- `will-change: transform` applied during animation only, removed on `animationend`

---

## 6. 21st.dev Component Sources

| Component | Used In | Adaptation |
|---|---|---|
| Shimmer/glow button | Hero CTAs, Contact submit | Strip React, apply CSS vars |
| Glassmorphism card | About cards, Project cards | Strip React, keep CSS |
| Magnetic/blur navbar | Header | Strip React, vanilla scroll listener |
| Animated progress bar | Skills bars | Strip React, use data-w attribute |
| Pulsing availability badge | Hero badge | Pure CSS animation |
| Tilt project card | Projects grid | Strip React, vanilla mousemove |
| Count-up number | About counters | Vanilla JS, IntersectionObserver |

All components fetched from `https://21st.dev/community/components` and adapted to vanilla JS + existing CSS variable system.

---

## 7. Build & Deployment

```bash
npm create astro@latest . -- --template minimal --no-git
npm run dev    # localhost:4321
npm run build  # output: dist/
```

`astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
export default defineConfig({ output: 'static' });
```

No additional npm packages. CDN-loaded: Boxicons, EmailJS, Google Fonts.
Deploy target: Netlify / Vercel / GitHub Pages (all supported by static output).

---

## 8. Content Preservation Checklist

- ✅ Name, title, bio
- ✅ Typed roles (4 items)
- ✅ 3 education entries (exact years, institutions, descriptions)
- ✅ 3 experience entries (exact years, roles, descriptions)
- ✅ 9 skills with exact percentages
- ✅ 8 tech badge labels
- ✅ Contact: email, phone, location
- ✅ 3 social links with exact URLs
- ✅ EmailJS: publicKey, serviceId, templateId
- ✅ Footer copyright text
- ✅ Stat card values (20+ projects, 3+ years)
- 🆕 6 placeholder project cards (to be filled by owner)

# PeptideRef — Claude Code Guide

## Project Overview

PeptideRef is a static HTML/CSS/JS peptide research reference site. No framework, no build step — just HTML files, one `styles.css`, and `script.js` that renders from JSON data files.

**Stack:** Vanilla HTML, CSS custom properties, vanilla JS  
**Data:** `peptide_frontend_library_v2.json`, `peptide_stacks_frontend_library.json`, `peptide_blends_frontend_library.json`  
**Pages:** `index.html` (home), `peptide.html` (detail), `stack.html` (stack detail), `blend.html` (blend detail), `guides.html` (guides)

## Product Direction

PeptideRef is a **research documentation product**, not a marketing site.

It should feel like: Stripe Docs meets Examine.com meets Linear meets Vercel Docs.

- Premium, calm, scientific, trustworthy, clean, intelligent
- NOT neon, crypto, biohacker, supplement sales page, flashy startup SaaS

---

## Development Principles (Superpowers)

These rules apply to every task. No exceptions without explicit human approval.

### Iron Laws

**1. Test-Driven Development**  
Write the test first. Watch it fail. Write minimal code to pass. If you wrote code before the test, delete it and start over. No production code without a failing test first.

**2. Systematic Debugging**  
Find the root cause before proposing any fix. No guessing. Complete this sequence before touching code:
1. Read error messages carefully
2. Reproduce consistently
3. Check recent changes
4. Trace data flow to the source

If 3+ separate fixes each reveal a new problem, stop and question the architecture. Do not attempt fix #4.

**3. Verification Before Completion**  
Do not claim work is done until you have run the verification command in the current message and read the output. "Should work", "probably passes", "looks correct" are not verification. Evidence before claims, always.

### Development Workflow

For any non-trivial task, follow this sequence:

```
brainstorming → writing-plans → executing-plans → requesting-code-review → finishing-a-development-branch
```

**Brainstorming first:** Before implementing any feature or component — including ones that seem simple — explore intent, propose 2–3 approaches, get approval. Save design doc to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`.

**Plans before code:** Write a complete implementation plan before writing any code. Plans must have exact file paths, step-by-step instructions with real code (no "TBD"), exact commands with expected output, and commit checkpoints. Save to `docs/superpowers/plans/YYYY-MM-DD-<feature>-plan.md`.

**Review after each task:** Dispatch a code reviewer subagent after completing each task in a plan. Fix Critical issues immediately. Fix Important issues before moving on.

**Finish the branch properly:** Run full tests, present merge/PR/keep/discard options, execute the choice. Never merge with failing tests.

### Red Flags — Stop and Ask

- Writing code before a failing test exists
- Proposing a fix without tracing the root cause
- Claiming completion without running verification
- Attempting a 4th fix when 3 have each revealed new problems
- Starting implementation on `main` without explicit approval

---

## Design Principles (Impeccable + Taste Skill)

The impeccable skill is installed at `.agents/skills/impeccable/`. Use it for all frontend design, UI review, and visual polish work.

**Invoke with:** `/impeccable [command] [target]`

Key commands:
- `/impeccable polish` — final quality pass before shipping
- `/impeccable critique` — UX/heuristic review with scoring
- `/impeccable audit` — accessibility, performance, responsive checks
- `/impeccable bolder` — amplify bland designs
- `/impeccable quieter` — tone down overstimulating designs
- `/impeccable animate` — add purposeful motion
- `/impeccable colorize` — strategic color work
- `/impeccable typeset` — typography hierarchy

### Design Rules (Always Applied)

**Color**
- Use CSS custom properties exclusively — no hardcoded hex in components
- Never use pure `#000` or `#fff` — tint every neutral toward brand hue
- Single accent color system (`--accent: #5b5ef5`) — no rainbow palettes
- Token system: `--page-bg`, `--bg`, `--surface`, `--border`, `--text-primary`, `--text-secondary`, `--text-muted`, `--citation-blue`, `--accent`, `--accent-light`

**Bans — Match and refuse**
- Side-stripe borders (`border-left` >1px as accent) — rewrite with full borders or background tints
- Gradient text (`background-clip: text` + gradient) — use solid color with weight/size emphasis instead
- Glassmorphism as default — only purposeful and rare
- Identical card grids — icon + heading + text repeated endlessly
- Cards when a simpler affordance works better
- Nested cards — always wrong

**Typography**
- Body line length: 65–75ch max
- Tight negative letter-spacing on headings: `-0.02em` to `-0.03em`
- Hierarchy through scale + weight (≥1.25 ratio between steps)
- Eyebrow labels: 10–11px, 600 weight, 0.07–0.08em tracking, UPPERCASE

**Motion**
- Animate only `transform` and `opacity` (hardware accelerated)
- Ease-out curves only: `150ms`–`300ms` typical range
- No bounce, no elastic, no looping background animations
- Always include `@media (prefers-reduced-motion: reduce)` overrides
- Max translateY: 4–8px. Max scale: 1.02.

**AI Slop Test**  
If someone could say "AI made that" without doubt, it has failed. Avoid: Inter font without customization, purple-to-blue gradients as default, centered hero + 3 cards + CTA, generic metric dashboards.

**Accessibility**
- WCAG AA minimum contrast on all text
- Complete focus states on all interactive elements
- No color-only communication for important states
- Comfortable tap targets on mobile (44×44px minimum)

### PeptideRef-Specific Don'ts

- Do not turn the hero into a marketing landing page
- Do not add heavy animations that slow reading
- Do not remove disclaimers or change medical/educational claims
- Do not restructure the page layout without explicit approval
- Do not add dependencies — this is a no-build static site

---

## File Conventions

- All styling lives in `styles.css` via CSS custom properties
- JS rendering logic lives in `script.js`
- New pages follow the existing `peptide.html` pattern
- No inline styles — use class-based CSS with token variables only

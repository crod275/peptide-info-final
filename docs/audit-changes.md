# PeptideRef Content Audit — Change Log

## Phases 0–4 (previously completed)

See `audit-baseline.txt` for the pre-audit baseline snapshot.

- **Phase 0**: Baseline captured.
- **Phase 1/2**: CSS centering fix — `contentEl.classList.remove('pep-loading-state')` added in `renderPeptidePage()`, `renderBlendPage()`, `renderStackPage()` in `script.js`.
- **Phase 3**: Stack reconstitution stats card fix — `const isStack = !!p.stack_details` guard added to `renderDosingSection()` in `script.js` to skip the broken stats card for stack entries.
- **Phase 4**: Scripted data fixes via `scripts/fix-data.mjs`:
  - A1: Em dash in recon step 3 fixed across all 95 peptide entries.
  - A2: Em dash in 25 stack protocol labels fixed.
  - A4: "How This Works\n" heading stripped from 11 blend and 3 stack `how_it_works.body` fields.
  - A5/A6: Spacing bugs fixed across reconstitution, storage, stack_details, supplies_needed, injection_frequency fields.
  - A7: Citation markers spaced (`word[1]` → `word [1]`) across all prose fields.
  - A8: "m L" split unit fixed to "mL" across all stacks fields.

---

## Phase 5 — Manual data fixes (`scripts/fix-phase5.mjs`)

### A3 — Em dashes in body prose

**File:** `peptide_blends_frontend_library.json`  
**Entry:** `glow` — `overview.how_it_works.body`  
4 em dashes replaced:
1. `"genomic modulator—it can upregulate"` → `"genomic modulator; it can upregulate"` (two independent clauses → semicolon)
2. `"inflammatory mediators—it lowers"` → `"inflammatory mediators; it lowers"` (two independent clauses → semicolon)
3+4. `"pathways—collagen synthesis…control—to create"` → `"pathways (collagen synthesis…control) to create"` (parenthetical → parentheses)

**File:** `peptide_stacks_frontend_library.json`  
**Entry:** `cjc-1295-dac-ipamorelin` (both vial variants) — `overview.how_it_works.body`  
2 em dashes replaced (same fix in both entries):
- `"pathways—GHRH receptor and ghrelin receptor—to synergistically"` → `"pathways (GHRH receptor and ghrelin receptor) to synergistically"` (parenthetical → parentheses)

### A9 — Misclassified efficacy data in side_effects.items

**File:** `peptide_blends_frontend_library.json`

**Entry: `cagrilintide-semaglutide`**  
Moved 2 efficacy items from `overview.side_effects.items` to `overview.main_benefits.items`:
- `"Phase 2 trials report mean body‑weight loss of ~15–17%…"` → `{ title: "Weight loss efficacy", description: "…" }`
- `"In type 2 diabetes, HbA1c reductions were observed…"` → `{ title: "Glycemic improvement", description: "…" }`

**Entry: `tri-heal`**  
Moved 3 efficacy items from `overview.side_effects.items` to `overview.main_benefits.items`:
- `"Promotes cell proliferation, angiogenesis…"` → `{ title: "Tissue repair", description: "…" }`
- `"Accelerates musculoskeletal healing…"` → `{ title: "Musculoskeletal healing", description: "…" }`
- `"Reduces inflammatory cytokine release…"` → `{ title: "Anti-inflammatory activity", description: "…" }`

### A10 — Orphan "Potential Benefits & Side Effects" header removed

**File:** `peptide_stacks_frontend_library.json`  
Removed `"Potential Benefits & Side Effects"` from `overview.side_effects.items[0]` in all 4 stack entries:
- `cjc-1295-dac-ipamorelin` (×2)
- `pt-141-melanotan-ii`
- `tb-500-bpc-157`

### A11 — Injection frequency summary rewritten

**File:** `peptide_stacks_frontend_library.json`  
**Entry:** `cjc-1295-dac-ipamorelin` (both vial variants)  
`dosing_and_reconstitution.injection_frequency.summary` rewritten to describe both peptides:
- Entry 1 (5 mg vial): `"CJC-1295 DAC: 1 mg subcutaneously once per week on a consistent day. Ipamorelin: 100–300 mcg subcutaneously once daily."`
- Entry 2 (2.5 mg vial): `"CJC-1295 DAC: 1 mg (40 units) subcutaneously once per week on a consistent day. Ipamorelin: 100–300 mcg subcutaneously once daily."`

### A12 — Numbered lists in prose (investigation)

Searched all three JSON files for `body` fields containing `"1. "` + `"2. "` patterns indicating non-sequential numbered lists. **None found.** Item closed with no changes.

---

## Phase 6 — Static HTML fixes (`why.html`)

### D1 — Passive voice fix
**Line ~298:** `"Sources are drawn from peer-reviewed journals…"` → `"We draw sources from peer-reviewed journals, clinical trial databases, and established pharmacological references"`

### D2 — Section label rewrite
**Line ~260:** `"The gap we're filling"` → `"Why existing sources fall short"`

### D3 — "Not a X" parallel structure overuse
Rewrote 4 `why-not-title` elements in the "What we're not" grid:
- `"Not a supplement store"` → `"No affiliate links"`
- `"Not a protocol service"` → `"No protocols or advice"`
- `"Not a community or forum"` → `"Structured information only"`
- `"Not medical advice"` → `"Educational content only"`

### D4 — "Not medical advice" disclaimer count
Searched `why.html` and `about.html` for "not medical" instances. Found 3 total before D3:
1. `why.html:286` — the tile title (removed by D3)
2. `why.html:348` — footer disclaimer (kept)
3. `about.html:442` — footer disclaimer (kept)

After D3, exactly 2 footer disclaimers remain (one per file). No further consolidation needed.

---

## Deferred / documented (no edits)

### pt-141-melanotan-ii empty component fields
**File:** `peptide_stacks_frontend_library.json`  
**Entry:** `pt-141-melanotan-ii`  
`stack_details.components[].vial_strength`, `route_or_frequency`, and `reconstitution` fields are empty for all components. This entry requires manual data population by a domain expert. **Do not invent values.**

### Citation label em dashes in research.resources[].label
Em dashes in `research.resources[].label` fields (12 in blends, similar count in stacks) were reviewed and left unchanged. These follow citation formatting convention (`Publisher — Title`), not prose writing. No edit warranted.

---

## Verification status (Phase 7)

| Check | Result |
|-------|--------|
| C1: No em dashes in steps fields | PASS (all 3 files) |
| C9: cagrilintide-semaglutide side_effects clean | PASS |
| C10: No orphan "Potential Benefits & Side Effects" headers | PASS |
| C11: All 3 JSON files parse cleanly | PASS |
| C14: cjc injection_frequency summaries describe both peptides | PASS |
| A12: No non-sequential numbered lists in body prose | PASS (none found) |
| D4: "not medical" count ≤ 2 after D3 | PASS (2 footer instances remain) |

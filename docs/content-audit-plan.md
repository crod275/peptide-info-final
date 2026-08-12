# PeptideRef Content Audit — Execution Plan

**Status:** Awaiting approval before any edits begin  
**Prepared:** 2026-05-21  
**Scope:** All content across the entire site — all 110 JSON entries (95 peptides, 11 blends, 4 stacks), script.js, styles.css, and static HTML pages (why.html, about.html). Fixes apply site-wide, not only to the example pages used to identify issues.

**Revision note (2026-05-21):** Updated after visual inspection confirmed four gaps in the initial grep-based discovery: (1) centered prose is a real CSS/rendering issue; (2) injection frequency contradiction on stack pages was missing; (3) numbered vs. bulleted misuse is a content-level issue in JSON, not a template issue; (4) static HTML pages (why.html, about.html) were not covered at all.

---

## Table of Contents

1. [Inventory](#1-inventory)
2. [Issue Classification by Bucket](#2-issue-classification-by-bucket)
3. [Execution Order with Reasoning](#3-execution-order-with-reasoning)
4. [Per-Page Workflow](#4-per-page-workflow)
5. [Risks and Mitigations](#5-risks-and-mitigations)
6. [Completion Criteria](#6-completion-criteria)
7. [Phase Checklist](#7-phase-checklist)

---

## 1. Inventory

### 1.1 Where content lives

This is a **no-build static site**. There is no Markdown processor, no template engine, no SSG. All content is stored in three JSON data files. All rendering happens client-side in `script.js`. HTML files are shells only — except `why.html` and `about.html`, which contain static prose content and require direct HTML editing.

| File | Role |
|---|---|
| `peptide_frontend_library_v2.json` | All single-peptide content |
| `peptide_blends_frontend_library.json` | All blend content |
| `peptide_stacks_frontend_library.json` | All stack content |
| `script.js` | All rendering logic — fetches JSON, builds innerHTML |
| `styles.css` | All styling |
| `peptide.html`, `blend.html`, `stack.html` | Shells; zero content |
| `why.html` | Static prose page — voice issues, passive construction, redundant disclaimer |
| `about.html` | Static prose page — redundant disclaimer in footer |

**There is no build pipeline.** Spacing bugs, em dashes, and heading duplications exist in the JSON source. What's in the JSON is what renders.

### 1.2 Page counts

| Type | Count | Notes |
|---|---|---|
| Single-peptide entries | 95 | 24 slugs are shared across vial sizes (e.g., BPC-157 appears twice — 5 mg and 10 mg vials) |
| Unique peptide base names | 61 | Only one is shown on the index listing (deduplication by base_name in script.js); vial variants are linked from the detail page |
| Blend entries | 11 | All have unique slugs |
| Stack entries | 4 | CJC-1295 DAC + Ipamorelin appears twice (2 mg and 5 mg vials) |
| **Total entries** | **110** | |

### 1.3 Complete entry list

**Single peptides (95 entries, 61 unique base names):**

5-Amino-1MQ (×2), Adamax, Adipotide, AICAR, AOD-9604 (×2), Ara-290, BPC-157 (×2), Cagrilintide (×2), Cartalax, Cerebrolysin, Chonluten, CJC-1295 DAC (×2), CJC-1295 NO DAC, Cortagen, DSIP (×2), Epitalon, FOXO4-DRI, GHK-Cu (×2), GHRP-2 (×2), GHRP-6 (×3), Glutathione, Gonadorelin, HCG, HGH 191AA, HMG, IGF-1 LR3, Ipamorelin (×2), Kisspeptin, KPV, L-Carnitine, Livagen, LL-37, Mazdutide (×2), Melanotan II, MGF, MOTS-C (×4), NAD+ (×2), Ovagen, Oxytocin (×2), PE-22-28, PEG MGF, Pinealon, PNC-27, Prostamax, PT-141, Retatrutide (×4), Selank (×2), Semaglutide (×3), Semax (×2), Sermorelin (×2), SLU-PP-332, SNAP-8, SS-31 (×3), Survodutide, TB-500 (×2), Tesamorelin (×3), Testagen, Thymosin Alpha-1 (×2), Tirzepatide (×4), Vesugen, Vilon

**Blends (11 entries):**

AOD-9604 + CJC-1295 + Ipamorelin (12 mg), BPC-157 + TB-500 (10 mg), BPC-157 + TB-500 (20 mg), Cagrilintide + Semaglutide (10 mg), CJC-1295 + GHRP-2 (10 mg), CJC-1295 NO DAC + Ipamorelin (10 mg), GLOW (70 mg), KLOW (80 mg), Neuroxelin (48 mg), Tesamorelin 5mg + Ipamorelin 5mg (10 mg), Tri-Heal (45 mg)

**Stacks (4 entries):**

CJC-1295 DAC (2 mg) + Ipamorelin (5 mg), CJC-1295 DAC (5 mg) + Ipamorelin (5 mg), PT-141 & Melanotan II (10 mg Vials), TB-500 + BPC-157 Stack (5 mg Vials)

### 1.4 Shared components vs. per-page content

| Layer | Location | What it controls |
|---|---|---|
| Accordion structure | `script.js: renderOverviewAccordion()` (~line 751) | What Is It, Main Benefits, How It Works, Side Effects |
| Reconstitution guide card | `script.js: renderDosingSection()` (~line 806) | Vial stats + numbered steps |
| Stack component cards | `script.js: renderStackDetailsSection()` (~line 1295) | Per-peptide reconstitution for stacks |
| Injection frequency | Inside `renderDosingSection()` | Frequency chips |
| Research/sources | `script.js: renderResearchSection()` | Citation list |
| All prose | JSON data files | Unique per entry |

### 1.5 Templated vs. free-form content

| Field type | Templated? | Notes |
|---|---|---|
| `overview.how_it_works.body` | Free-form prose | Unique per entry |
| `overview.what_is_it.body` | Free-form prose | Unique per entry |
| `overview.side_effects.items[]` | Free-form list | Unique per entry |
| `overview.main_benefits.items[]` | Structured cards | Unique per entry |
| `dosing_and_reconstitution.reconstitution_guide.steps[]` | **Partly templated** | First and last steps are nearly identical across all 95 peptide entries; step 3 "Gently swirl or roll the vial to mix — do not shake." is **identical across all 95 entries** |
| `dosing_and_reconstitution.dosage_protocols[].label` | Structured label | Contains em dashes in stacks |
| `research.resources[].label` | Citation label | Publisher — Title format; em dashes are citation-formatting convention |

### 1.6 Citation data

- Citations are stored as `research.resources[]` arrays in each entry, with `label`, `href`, `type`, and `description` fields.
- References appear inline in prose as `[1]`, `[2]`, etc.
- `parseCitations()` in `script.js` (~line 661) replaces `[n]` with `<a>` links at render time. It does **not** add spaces — so `"word[1]"` in the source renders as `word<a>[1]</a>` with no visual space. The spacing fix must be in the JSON source.

### 1.7 Build pipeline

**None.** No transformation between JSON source and rendered HTML. All bugs in the JSON render directly.

---

## 2. Issue Classification by Bucket

### Bucket A — Data fixes in JSON (per-entry, scripted where systematic, manual where nuanced)

| # | Issue | Where | Count | Type |
|---|---|---|---|---|
| A1 | Em dash in reconstitution step 3: "swirl — do not shake" | `peptide_frontend_library_v2.json` → every entry's `reconstitution_guide.steps[2]` | 95 identical | Scripted |
| A2 | Em dash in stack dosage protocol labels: "CJC-1295 DAC — Standard" | `peptide_stacks_frontend_library.json` → `dosage_protocols[].label` | 25 instances across 4 stacks | Scripted |
| A3 | Em dash in blend/stack body prose | `*_blends_*.json` body field (1), `*_stacks_*.json` body (2) + description (1) | 4 instances | Manual |
| A4 | "How This Works\n" duplicated at start of body | All 11 blend entries + all 4 stack entries (`overview.how_it_works.body`) | 15 instances | Scripted |
| A5 | Spacing bugs in blend reconstitution and storage fields | `peptide_blends_frontend_library.json` — `reconstitution_guide.summary`, `steps[]`, `storage.reconstituted_storage` | ~50+ field values | Scripted |
| A6 | Spacing bugs in stack reconstitution and component fields | `peptide_stacks_frontend_library.json` — `reconstitution_guide.steps[]`, `stack_details.components[].reconstitution`, `storage.reconstituted_storage` | ~30+ field values | Scripted |
| A7 | Citation markers abutting text with no space: `word[1]` | `*_blends_*.json` (109 hits), `*_stacks_*.json` (36 hits) | 145 instances | Scripted |
| A8 | "m L" space-split inside unit abbreviation | `*_stacks_*.json` → `dosage_protocols[].units_or_volume`, `stack_details` fields | ~20 instances | Scripted |
| A9 | Misclassified efficacy data in `side_effects.items[]` | `cagrilintide-semaglutide` (2 items), `tri-heal` (1 item) | 3 items | Manual |
| A10 | Orphan header "Potential Benefits & Side Effects" as first `side_effects` list item | All 4 stack entries | 4 instances | Manual |

**Note on citation labels:** The pattern "PMC — The Safety and Efficacy..." in `research.resources[].label` uses em dash as a publisher–title separator. This is a citation convention, not prose. **These 12 instances in blends are out of scope for the em dash audit** — they are in reference metadata fields not rendered as body text. Flagged for human review; propose replacing with " | " if they must change.


| A11 | `injection_frequency.summary` describes only one peptide's schedule on stack pages | `peptide_stacks_frontend_library.json` — `dosing_and_reconstitution.injection_frequency.summary` in CJC-1295 DAC + Ipamorelin entries | 2 entries | Manual |
| A12 | Numbered list content embedded in prose fields where bullets are correct (e.g., "1. X 2. Y" inside a body string for non-sequential items) | Across all three JSON files — `overview` body fields | Investigate first | Manual |

### Bucket B — Template fixes in script.js

| # | Issue | Where | What to change |
|---|---|---|---|
| B1 | Stack pages call `renderDosingSection()` which renders the single-peptide reconstitution stats card with `"—"` fallbacks for empty `bacteriostatic_water` and `resulting_concentration`. `renderStackDetailsSection()` already renders the correct per-component breakdown. | `script.js` ~ line 860 | Suppress the reconstitution guide stats block (`reconStatsHTML`) inside `renderDosingSection()` when the entry is a stack page (detect via presence of `stack_details`). The `reconStepsHTML` (combined steps) should also be suppressed for stacks since per-component steps live in `stack_details`. |

### Bucket C — CSS fixes

**Requires visual verification.** Initial grep-based discovery found no CSS rule directly applying `text-align: center` to prose or list content. However, visual inspection of rendered pages confirmed centered prose and list items are visible, with bullet markers stranded on the left while text content floats center.

The likely source: a parent container with `align-items: center` (flex) or an inherited `text-align: center` that is not visible in a static CSS scan. Must be confirmed by running the site in a browser and inspecting the rendered elements with DevTools.

| # | Issue | Suspected location | Fix |
|---|---|---|---|
| C1 | Long-form paragraph text centered in accordion body | Possibly `.accordion-body-inner` inheriting from a parent, or a responsive breakpoint rule | Identify the rule via DevTools, add explicit `text-align: left` to `.accordion-body-inner p` and `.side-effects-list` if not already set |
| C2 | Bullet markers stranded left while list content is centered | Same parent, affecting `.side-effects-list li` | Same fix — ensures `text-align: left` on list items |

**Gate for Bucket C:** This bucket cannot be executed until the running site is opened in a browser and the centering source is confirmed via DevTools. If DevTools shows the rules already include `text-align: left` on these elements and the centering was a one-time rendering artifact, this bucket closes with no changes.

### Bucket D — Static HTML pages (why.html, about.html)

These are hand-authored HTML files, not JSON-driven. Content fixes require direct HTML editing.

| # | Issue | File | Location | Fix |
|---|---|---|---|---|
| D1 | Passive institutional voice: "Sources are drawn from peer-reviewed journals..." | `why.html` | Line 298, Editorial approach section | Rewrite: "We draw sources from peer-reviewed journals, clinical trial databases, and established pharmacological references" |
| D2 | Section label "The gap we're filling" — generic deck-slide construction | `why.html` | Line 260 `why-section-label` | Rewrite: "The problem with existing sources" or "Why existing sources fall short" |
| D3 | "X, not Y" parallel construction overused — appears in h1 hero, h2 heading, and four "Not a X" grid titles (six instances total) | `why.html` | Hero h1, line 271 h2, lines 286–294 "what we're not" grid | Keep the h1 and one h2 instance; rewrite the "What we're not" grid titles to vary structure (e.g., "No affiliate links", "No protocols or advice", "Structured information only", "Educational content only") |
| D4 | "Not medical advice" disclaimer appears in three places: dosing section disclaimer (each JSON page), global disclaimer banner (each JSON page), and site footer (`why.html` + `about.html`) | `why.html` line 348, `about.html` footer, JSON `global_disclaimer` | Keep the full disclaimer once (the `why.html` Disclaimer section block and the footer one-liner). Consider whether the per-page dosing disclaimer is necessary or whether the global banner suffices. Propose specific consolidation before editing. |

### Original Bucket D — Data schema fixes (renumbered from previous version)

The existing stack schema already supports per-component structure via `stack_details.components[]`. The template (`renderStackDetailsSection`) already renders it. **No schema restructuring is needed** — the fix is Bucket B (suppress the broken single-peptide display for stacks). The per-component structure is already populated correctly in 3 of 4 stacks.

Exceptions: `pt-141-melanotan-ii` has empty `stack_details.components` (`vial_strength`, `route_or_frequency`, `reconstitution` all blank). This entry needs manual data population — flagged as human review item.

---

## 3. Execution Order with Reasoning

```
Phase 0: Verification baseline (read-only)
Phase 1: CSS investigation — open site in browser, confirm centering source via DevTools
Phase 2: CSS fix — styles.css (if confirmed)
Phase 3: Template fix — script.js (1 change, all stack pages)
Phase 4: Scripted data fixes — JSON (systematic, regex-safe)
Phase 5: Manual data fixes — JSON (nuanced, per-entry)
Phase 6: Static HTML fixes — why.html, about.html (voice, passive, redundant disclaimers)
Phase 7: Verify against all completion criteria
```

### Why this order

**Phase 0 first:** Capture a grep baseline before touching anything. Every completion criterion must be verifiable by diffing against this baseline. Takes 2 minutes and makes all subsequent verification trustworthy.

**CSS investigation before CSS fix (Phase 1 before Phase 2):** The centering issue was confirmed visually but the source rule wasn't found by grep. We need to identify the exact CSS rule in a browser before editing. This prevents blindly adding overrides on top of rules that may already exist.

**CSS before template (Phase 2 before Phase 3):** If the centering is caused by a CSS rule that affects the reconstitution card or stack detail sections, fixing CSS first means the template fix in Phase 3 is verified against the correct visual state.

**Template before data (Phase 3 before Phase 4):** The Bucket B fix removes the broken reconstitution stats card from stack pages. Fix template first so data fixes are verified in the correct rendered state.

**Scripted data before manual (Phase 4 before Phase 5):** High-confidence scripted fixes clear systematic noise first. Manual fixes then operate on clean data.

**Static HTML last among edits (Phase 6):** These are the lowest-risk, highest-autonomy changes — no schema, no template, no data dependencies. Editing them last means every other layer is settled.

**Verify last (Phase 7):** Single clear pass/fail after all edits are committed.

### Phase breakdown

**Phase 0 — Baseline (no edits)**
- Run all grep/regex checks from completion criteria
- Record counts to a file (`docs/audit-baseline.txt`) for diff comparison after edits

**Phase 1 — Template fix (script.js)**
- One conditional change inside `renderDosingSection()`: detect stack page (presence of `p.stack_details`), skip rendering `reconStatsHTML` and `reconStepsHTML` when true
- Commit: `fix: suppress single-peptide recon card on stack pages`
- Gate: open one stack page in browser and confirm the broken "—" stats no longer appear

**Phase 2 — Scripted data fixes (JSON)**  
Run a Node.js script (`scripts/fix-data.mjs`) that applies all regex-safe transformations in one pass per file. Single commit per file. Operations in this phase:

For `peptide_frontend_library_v2.json`:
- A1: In every `reconstitution_guide.steps`, replace `" — do not shake"` → `": do not shake"` (the em dash here is a setup-and-payoff)
- Commit: `fix(data): replace em dash in reconstitution step across all peptide entries`

For `peptide_blends_frontend_library.json`:
- A4: Strip `"How This Works\n"` from start of every `overview.how_it_works.body`
- A5: Fix spacing bugs: `Add3.0 mL` → `Add 3.0 mL`, `at2–8` → `at 2–8`, `mLb` → `mL b` → (contextually) `mL bacteriostatic`, etc.
- A7: Add space before citation markers: `(\w)\[(\d)` → `$1 [$2`
- Commit: `fix(data): heading deduplication, spacing bugs, citation spacing in blends`

For `peptide_stacks_frontend_library.json`:
- A2: Replace em dash in protocol labels: `"CJC-1295 DAC — Standard"` → `"CJC-1295 DAC: Standard"`, `"Ipamorelin — Weeks 1–2 (Initiation)"` → `"Ipamorelin: Weeks 1–2 (Initiation)"`
- A4: Strip `"How This Works\n"` from every `overview.how_it_works.body`
- A6: Fix spacing bugs: `Draw2.0` → `Draw 2.0`, `mLb` → `mL b`, `at2–8` → `at 2–8`, `m L` → `mL`, etc.
- A7: Add space before citation markers
- A8: Fix `"m L"` unit split → `"mL"` (careful: only in unit fields, not in prose)
- Commit: `fix(data): protocol label em dashes, spacing bugs, heading dedup in stacks`

**Phase 3 — Manual data fixes (JSON)**
Hand-edit the JSON for nuanced changes that a regex shouldn't touch:

- A3: The 4 em dashes in blend/stack body prose — read each in context, apply correct replacement (parentheses, colon, or comma/split) per the skill decision tree
- A9: Move misclassified efficacy data in `cagrilintide-semaglutide` and `tri-heal` from `side_effects.items[]` to `overview.main_benefits.items[]` or a new item in the appropriate section
- A10: Remove "Potential Benefits & Side Effects" orphan header from `side_effects.items[0]` in all 4 stack entries
- Flag: `pt-141-melanotan-ii` `stack_details.components[]` — fields are empty; document for human population, do not invent data
- One commit per logical change group

**Phase 4 — Verification**
- Run all completion-criteria checks
- Open each page type in browser: single peptide, blend, stack
- Check rendered HTML via browser DevTools for any remaining spacing artifacts
- Diff against baseline counts

---

## 4. Per-Page Workflow

### 4.1 Phase 2 scripted workflow

The scripted fixes do not operate "per page" — they operate on the JSON files directly using a Node.js script. The loop is:

```
READ file → parse JSON → traverse all entries → apply transformations → write file → git diff → verify counts
```

The script (`scripts/fix-data.mjs`) will:
1. Accept a target file path as argument
2. Parse and load the JSON
3. Run each transformation as a named function that returns `{ value, changed: bool, description }`
4. Accumulate a per-entry change log
5. Write the modified JSON back (same formatting — `JSON.stringify(data, null, 2)`)
6. Print a summary: N entries changed, M fields modified, breakdown by transformation type
7. Exit non-zero if any transformation produced unexpected output (safety check)

The script is written before running. It is reviewed before execution. It does not run until approved.

### 4.2 Phase 3 manual workflow

For each manual fix:
1. Open the JSON file in the editor
2. Navigate to the specific entry by searching for its `id` or `slug`
3. Read the full context of the field being changed
4. Make the edit
5. Verify the JSON is still valid: `node -e "require('./file.json')" && echo OK`
6. Run the grep check for that specific issue type to confirm the instance is gone
7. Commit

For content reclassification (A9 — moving items between sections): before moving, confirm the target section (`main_benefits`) already exists and that the moved item makes semantic sense there. Do not reclassify if the move would change the factual claim or its relationship to any citation.

### 4.3 Per-entry change log

Each commit message will include the affected entry IDs. After Phase 3, a log file (`docs/audit-changes.md`) will record:

```
| Entry ID | Slug | Issues fixed | Ambiguous / skipped |
```

### 4.4 Ambiguous cases — escalation rules

If any of the following, **stop and flag to human review rather than editing:**

- The em dash fix would require restructuring a sentence (not just substituting punctuation) and the restructuring would change emphasis
- A content reclassification would remove content from the rendered page (not just move it)
- A citation-bearing sentence needs to be split into two sentences in a way that moves the citation marker away from the claim it supports
- `pt-141-melanotan-ii` empty component fields — do not invent values; flag for human population

---

## 5. Risks and Mitigations

### R1 — Same content in multiple entries (vial-size duplicates)

**Risk:** 24 base names appear as 2–4 separate entries (different vial sizes). The reconstitution step em dash "swirl — do not shake" appears in all 95 entries. Scripted fix applies to all — that's intentional and correct.

**Risk variant:** If vial-specific entries have different prose (e.g., different side effect notes per dose), a scripted fix could homogenize content that was intentionally different.

**Mitigation:** After running the scripted fix on peptide data, diff all entries that share a slug and confirm the only changes are the targeted ones. If non-targeted content differs between vial variants, do not touch it.

### R2 — Spacing regex too broad

**Risk:** A regex replacing `mLb` → `mL b` could incorrectly modify a peptide name or compound abbreviation that happens to match (unlikely but possible). `at2` could match `at 2` in a context where `at2` is a compound name.

**Mitigation:** (a) Preview all replacements with a dry-run flag (`--dry-run`) before writing. (b) After replacement, use `git diff` to review every changed line before committing. (c) Run `node -e "require('./file.json')"` to verify JSON validity after each write.

### R3 — Citation meaning change from prose rewrite

**Risk:** Rewriting a sentence that contains `[1]` in a way that moves the citation away from the claim it supports misrepresents the source.

**Mitigation:** For Phase 3 manual edits, do not split any sentence that contains a citation marker. If a sentence with a citation contains an em dash, choose the substitution (parentheses, colon, comma) that keeps the citation adjacent to the same factual claim. If no substitution works without moving the citation, flag as human review.

### R4 — Voice rewrite flattens good content

**Risk:** Phase 3 manual edits to voice/style could make neutral, confident prose sound flat or corporate if over-edited.

**Mitigation:** Phase 3 scope is limited to removing the orphan header, removing misclassified items, and fixing the specific em dashes. Voice rewriting is **not in scope for this plan** — the skill's voice rules are available but will only be applied where they co-occur with a structural fix (e.g., the orphan header removal may require minor rewriting of the surrounding paragraph). Pure voice polish is a separate task.

### R5 — Build pipeline silently re-introducing bugs

**Risk:** If a scraper or data-generation script is ever re-run, it would regenerate the JSON files with the original bugs.

**Mitigation:** Document in `ProjectInfo.md` that these JSON files are the canonical source of truth and should not be regenerated from the original scraper without running the audit fixes again. The fix script (`scripts/fix-data.mjs`) can be re-run post-generation as a post-process step.

### R6 — Draft or unpublished entries

**Risk:** The JSON files contain entries with no `published: false` or draft flag. All entries are treated as live.

**Mitigation:** Confirmed: the schema has no draft/published field. All 110 entries are live. No special handling needed. If a future entry needs to be excluded from audit, add a `draft: true` field to the schema and update the fix script to skip entries where `draft === true`.

### R7 — pt-141-melanotan-ii empty stack_details

**Risk:** This stack entry has empty component fields in `stack_details.components[]`. Any scripted or manual fix that assumes populated component data will silently skip this entry.

**Mitigation:** The script will log a warning when it encounters empty component fields. The entry will be explicitly listed in the audit change log as "flagged for human review — component data requires manual population." No content will be invented.

### R8 — JSON formatting changes breaking git diff legibility

**Risk:** If `JSON.stringify(data, null, 2)` produces different whitespace than the original file (e.g., trailing commas, different key ordering), the git diff becomes noisy and hard to review.

**Mitigation:** Before running the fix script, confirm the round-trip format matches: `node -e "const d = require('./f.json'); process.stdout.write(JSON.stringify(d,null,2))"` diff against original. If formatting differs, add a formatting-normalization commit first (no content changes), then apply content fixes in a separate commit.

### R9 — Citation label em dashes (out-of-scope boundary)

**Risk:** Treating citation `label` fields as prose and replacing em dashes changes the citation metadata in a way that affects research section rendering without clear benefit.

**Mitigation:** Citation labels are out of scope for the em dash fix. The 12 blend citation labels ("PMC — Title") and similar stack instances will be left as-is unless explicitly approved. These are recorded in the change log as "reviewed, left unchanged — citation formatting convention."

---

## 6. Completion Criteria

Each criterion includes a verification command. An (M) suffix means manual check required.

| # | Criterion | Verification |
|---|---|---|
| C1 | Zero em dashes in reconstitution steps across all three files | `node -e "const fs=require('fs'); ['peptide_frontend_library_v2.json','peptide_blends_frontend_library.json','peptide_stacks_frontend_library.json'].forEach(f => { const raw=fs.readFileSync(f,'utf8'); const steps=[...raw.matchAll(/\"steps\":\s*\[([^\]]*)\]/gs)]; let count=0; steps.forEach(m => { if(m[1].includes('—')) count++; }); console.log(f, count)})"` → all zeros |
| C2 | Zero em dashes in body prose fields (how_it_works.body, what_is_it.body) | `node -e "const fs=require('fs'); ['peptide_frontend_library_v2.json','peptide_blends_frontend_library.json','peptide_stacks_frontend_library.json'].forEach(f=>{const d=JSON.parse(fs.readFileSync(f));(d.peptides||[]).forEach(p=>{const b=p.overview?.how_it_works?.body||'';if(b.includes('—'))console.log(f,p.slug,'how_it_works');});});"` → no output |
| C3 | No collapsed spacing before numbers: `Add\d`, `Draw\d`, `at\d` in reconstitution fields | `grep -c "Add[0-9]\|Draw[0-9]\|at[0-9]" peptide_blends_frontend_library.json peptide_stacks_frontend_library.json` → 0 |
| C4 | No `mLb`, `mLw`, `mLs` collapsed unit patterns | `grep -c "mL[a-z]" peptide_blends_frontend_library.json peptide_stacks_frontend_library.json` → 0 |
| C5 | No `m L` split inside unit abbreviations | `grep -c '"m L"' peptide_stacks_frontend_library.json` → 0 |
| C6 | No citation markers abutting text without space | `node -e "const fs=require('fs');['peptide_blends_frontend_library.json','peptide_stacks_frontend_library.json'].forEach(f=>{const raw=fs.readFileSync(f,'utf8');const hits=[...raw.matchAll(/\w\[\d/g)];console.log(f,hits.length,'hits');})"` → 0 |
| C7 | No "How This Works\n" at start of any how_it_works body | `node -e "const fs=require('fs');['peptide_blends_frontend_library.json','peptide_stacks_frontend_library.json'].forEach(f=>{const d=JSON.parse(fs.readFileSync(f));(d.peptides||[]).forEach(p=>{const b=p.overview?.how_it_works?.body||'';if(b.startsWith('How This Works'))console.log(f,p.slug)});})"` → no output |
| C8 | Stack pages no longer show broken "—" reconstitution stats | (M) Open `/stack.html?slug=cjc-1295-dac-ipamorelin` in browser. Confirm no stat card with "—" values appears above the Stack Protocol Details section |
| C9 | Misclassified efficacy data removed from `side_effects.items` | `node -e "const d=require('./peptide_blends_frontend_library.json');const p=d.peptides.find(x=>x.slug==='cagrilintide-semaglutide');const items=p.overview.side_effects.items||[];items.forEach((i,n)=>console.log(n,typeof i==='string'?i.slice(0,60):JSON.stringify(i).slice(0,60)))"` → no weight-loss percentage data in output |
| C10 | Orphan header removed from stack side_effects | `node -e "const d=require('./peptide_stacks_frontend_library.json');d.peptides.forEach(p=>{const items=p.overview?.side_effects?.items||[];if(items[0]==='Potential Benefits & Side Effects')console.log(p.slug,'still has orphan header')})"` → no output |
| C11 | All three JSON files parse without error after edits | `node -e "require('./peptide_frontend_library_v2.json'); require('./peptide_blends_frontend_library.json'); require('./peptide_stacks_frontend_library.json'); console.log('OK')"` → `OK` |
| C12 | Per-entry change log exists for every entry touched | (M) Review `docs/audit-changes.md` — every modified entry ID is listed |
| C13 | Accordion body prose is left-aligned; bullet markers are not stranded | (M) Open one blend and one stack page in browser; confirm list items are left-aligned in DevTools |
| C14 | Injection frequency summary on CJC+Ipamorelin stacks describes both peptides' schedules | `node -e "const d=require('./peptide_stacks_frontend_library.json');d.peptides.filter(p=>p.slug==='cjc-1295-dac-ipamorelin').forEach(p=>console.log(p.dosing_and_reconstitution.injection_frequency.summary))"` — output must reference both CJC and Ipamorelin schedules |
| C15 | Passive voice removed from why.html editorial section | (M) Read `why.html` line ~298 — should begin "We draw sources from..." not "Sources are drawn from..." |
| C16 | "Not medical advice" disclaimer consolidated — not repeated in three separate locations | (M) Search `why.html` + `about.html` for "not medical advice" — count should be 2 or fewer (disclaimer section + footer one-liner); dosing section disclaimer in JSON is acceptable as a separate context |

---

## 6b. Parallelization Design

### 6b.1 What is and isn't parallelizable

Not all phases can overlap. Some work is gate-locked by preceding phases; some touches shared infrastructure that must be serialized. Map this explicitly before dispatching anything.

**Strictly sequential (main agent only):**

| Phase | Why serial |
|---|---|
| Phase 0 — Baseline | Gate; everything depends on it |
| Phase 1 — CSS investigation | Manual browser + DevTools work; requires human interaction |
| Phase 2 — CSS fix | Single file (`styles.css`); trivial change; no benefit from parallelism |
| Phase 3 — Template fix | Single file (`script.js`); must complete before data fixes so verification reflects correct rendering |
| Phase 7 — Verification (browser checks) | Manual; requires human eyes |

**Phases with internal parallelism:**

| Phase | What can run in parallel | Constraint |
|---|---|---|
| Phase 4 — Scripted data fixes | Dry-run review of all three JSON files simultaneously | Write the script first (serial); dispatch dry-run review subagents in parallel; apply changes sequentially after human approval |
| Phase 5 — Manual data fixes | Blend file fixes and stack file fixes are independent | Peptide file has no manual fixes; blends and stacks subagents may run concurrently because they touch different files |
| Phase 5b — Per-page content audit | Every individual entry is independent | Batch by file first (no cross-file subagent); no two subagents touch the same file |
| Phase 7 — Automated verification | Grep/regex checks on each JSON file; HTML file checks | Independent files; dispatch 4 parallel verification subagents |

**Concurrency ceiling: 8 subagents maximum concurrent.** Queue beyond that. Reason: beyond ~8, output review time exceeds any scheduling benefit, and context stitching becomes error-prone.

---

### 6b.2 Phase 5b — Per-page content audit batching

This is the largest parallelization opportunity: 110 entries, each independent once the template/CSS/scripted-fix layers are clean.

**Batching strategy:**

| Subagent | File | Entries | Count |
|---|---|---|---|
| Audit-Blend-1 | `peptide_blends_frontend_library.json` | All 11 blend entries | 11 |
| Audit-Stack-1 | `peptide_stacks_frontend_library.json` | All 4 stack entries | 4 |
| Audit-Pep-1 | `peptide_frontend_library_v2.json` | 5-Amino-1MQ (×2) through BPC-157 (×2) | 10 |
| Audit-Pep-2 | `peptide_frontend_library_v2.json` | Cagrilintide (×2) through CJC-1295 NO DAC | 10 |
| Audit-Pep-3 | `peptide_frontend_library_v2.json` | Cortagen through GHRP-6 (×3) | 10 |
| Audit-Pep-4 | `peptide_frontend_library_v2.json` | Glutathione through Kisspeptin | 10 |
| Audit-Pep-5 | `peptide_frontend_library_v2.json` | KPV through MOTS-C (×4) | 10 |
| Audit-Pep-6 | `peptide_frontend_library_v2.json` | NAD+ (×2) through PT-141 | 10 |
| Audit-Pep-7 | `peptide_frontend_library_v2.json` | Retatrutide (×4) through Semaglutide (×3) | 10 |
| Audit-Pep-8 | `peptide_frontend_library_v2.json` | Semax (×2) through Tirzepatide (×4) | 10 |
| Audit-Pep-9 | `peptide_frontend_library_v2.json` | Vesugen through Vilon + any remaining | 5 |

**Dispatch batches:**

- **Wave 1 (8 concurrent):** Audit-Blend-1, Audit-Stack-1, Audit-Pep-1 through Audit-Pep-6
- **Wave 2 (3 concurrent):** Audit-Pep-7, Audit-Pep-8, Audit-Pep-9

Multiple subagents touching the same file is a conflict. The peptide subagents all write to `peptide_frontend_library_v2.json`. Resolution: **subagents do not write to disk**. They return proposed JSON patches and change summaries to the main agent. The main agent assembles all patches, merges them into the file, and commits once.

---

### 6b.3 Subagent prompt templates

Each template defines exact scope, what to invoke, what to return, and hard prohibitions. Copy these verbatim when dispatching.

---

**Template A — Dry-run review subagent (Phase 4)**

Use for: reviewing the output of `scripts/fix-data.mjs --dry-run` on one JSON file before the main agent applies changes.

```
You are reviewing the proposed changes from a dry-run data fix script on one PeptideRef JSON file.

File: [INSERT FILENAME]
Dry-run output: [PASTE DRY-RUN STDOUT HERE]

Your job:
1. Read every proposed change in the dry-run output.
2. For each change, verify it falls into one of these expected categories:
   - Replacing "— do not shake" with ": do not shake" in reconstitution steps
   - Stripping "How This Works\n" from how_it_works.body
   - Fixing spacing bugs: Add3.0 mL → Add 3.0 mL, at2–8 → at 2–8, mLb → mL b, etc.
   - Adding space before citation markers: word[1] → word [1]
   - Replacing protocol label em dashes: "CJC-1295 DAC — Standard" → "CJC-1295 DAC: Standard"
3. Flag any change that:
   - Modifies content outside the expected categories
   - Changes a sentence that contains a citation marker [n] in a way that moves the marker away from its claim
   - Changes a number, dosage, or unit value
   - Produces malformed JSON

Return:
- APPROVED: [count] changes look correct
- FLAGGED: [list each flagged change with line number and reason]
- VERDICT: approve / needs-review

Do NOT apply any changes. Do NOT write to any file. Return your verdict only.
```

---

**Template B — Manual fix subagent (Phase 5)**

Use for: blends or stacks file nuanced fixes. Dispatch one instance per file.

```
You are applying nuanced manual fixes to one PeptideRef JSON file. You have a narrow, explicit list of changes to make. Do not make any changes outside this list.

File: [INSERT FILENAME — either peptide_blends_frontend_library.json OR peptide_stacks_frontend_library.json]

Assigned fixes for this file:
[INSERT SPECIFIC FIX LIST — e.g.:]
- A3: In [slug], overview.how_it_works.body contains an em dash at position [describe]. Replace with [colon / parentheses / comma]. The correct replacement based on context is [SPECIFY].
- A9: In cagrilintide-semaglutide, move side_effects.items[1] ("Phase 2 trials report...") to overview.main_benefits.items as a new entry with title "Weight loss efficacy" and description [exact text].
- A10: In [stack slug], remove side_effects.items[0] which contains "Potential Benefits & Side Effects".
- A11: In [stack slug], rewrite injection_frequency.summary from "[current text]" to "[new text describing both peptides' schedules]".

Process:
1. Read the full JSON file.
2. Make only the changes in the assigned list above, in order.
3. Verify the JSON is still valid after each change.
4. Return the complete modified JSON as your output.

Rules:
- Do NOT commit or write to disk — return the JSON content only.
- Do NOT change any entry not listed above.
- Do NOT touch script.js, styles.css, or any HTML file even if you see issues in them — flag those up instead.
- Do NOT invent peptide data, dosages, or citation content.
- If any assigned fix would change the meaning of a cited claim or move a citation marker away from its claim, return it as FLAGGED instead of applying it.

Return format:
{
  "applied": [ { "fix_id": "A3", "slug": "...", "description": "..." } ],
  "flagged": [ { "fix_id": "...", "reason": "..." } ],
  "modified_json": { ...complete file content... }
}
```

---

**Template C — Per-page audit subagent (Phase 5b)**

Use for: running the peptideref-auditor skill against a batch of entries. One instance per batch.

```
You are auditing a batch of PeptideRef JSON entries for content quality issues.

Source file: [INSERT FILENAME]
Your batch (audit these entry IDs only):
[INSERT LIST OF IDs e.g. "peptide-001", "peptide-002", ...]

Background: This is the PeptideRef peptide reference site. JSON entries follow this schema:
- overview.what_is_it.body — prose paragraph
- overview.how_it_works.body — prose paragraph  
- overview.side_effects.items[] — bulleted list items
- overview.main_benefits.items[] — benefit cards
- dosing_and_reconstitution.reconstitution_guide.steps[] — numbered steps
- dosing_and_reconstitution.injection_frequency.summary + options[]

Already fixed in a prior phase (do NOT flag these as issues):
- Em dash in reconstitution step "swirl — do not shake" → replaced with colon
- "How This Works\n" stripped from how_it_works.body
- Spacing bugs in reconstitution fields
- Citation markers spaced: word[1] → word [1]
- Protocol label em dashes in stacks: "Name — Phase" → "Name: Phase"

Apply the peptideref-auditor rules to each entry in your batch. Check for:
1. Remaining em dashes in prose (parentheses / colon / split per context)
2. Any spacing bugs the script missed
3. Numbered lists used for non-sequential content (should be bullets)
4. Split list items that should be merged
5. Misclassified content under the wrong section header
6. Voice issues: passive constructions, redundant disclaimers, over-edited parallelism

For each entry, produce:
- The corrected field values (not the full entry — only the changed fields)
- A change summary grouped by issue type
- Any FLAGGED items where you are uncertain (ambiguous em dash context, potential citation displacement, meaning change)

Rules:
- Do NOT write to any file.
- Do NOT commit anything.
- Do NOT change citation numbers or alter the factual claim a citation supports.
- Do NOT edit entries outside your assigned batch.
- Do NOT touch script.js, styles.css, or HTML files.
- If a change would require moving content between sections (e.g., misclassified side effect), describe the move precisely — do not silently discard content.
- Return flagged items rather than making uncertain judgment calls.

Return format per entry:
{
  "id": "peptide-001",
  "slug": "5-amino-1mq",
  "changes": [ { "field": "overview.how_it_works.body", "issue_type": "em_dash", "before": "...", "after": "..." } ],
  "flagged": [ { "field": "...", "reason": "..." } ],
  "no_changes_needed": false
}
```

---

**Template D — Automated verification subagent (Phase 7)**

Use for: running grep/regex completion criteria checks on one file.

```
You are running automated verification checks on one PeptideRef JSON file after all fixes have been applied.

File: [INSERT FILENAME]

Run each check below, report PASS or FAIL with count, and show up to 3 example failures if any.

Checks:
1. Zero em dashes in reconstitution steps: no "—" inside steps[] arrays
2. Zero em dashes in body prose: no "—" in overview.*.body fields
3. No collapsed spacing before numbers: no matches for /Add\d|Draw\d|at\d/ in reconstitution fields
4. No mL-unit collapse: no matches for /mL[a-z]/ in any string value
5. No m-L split: no "m L" in any string value (stacks file only)
6. No citation markers abutting text: no matches for /\w\[(\d+)\]/ in any string value
7. No "How This Works" heading duplication: no how_it_works.body starting with "How This Works"
8. JSON parses without error

Return:
- File: [filename]
- Each check: PASS or FAIL [count] — [up to 3 examples]
- Overall: CLEAN or NEEDS-ATTENTION
```

---

### 6b.4 Dispatch table

For each phase, the exact subagent configuration before execution begins.

| Phase | Concurrent subagents | Assignments | Returns to main agent |
|---|---|---|---|
| Phase 0 | 0 | Main agent runs all baseline checks | Baseline counts saved to `docs/audit-baseline.txt` |
| Phase 1 | 0 | Main agent opens browser + DevTools | Centering source rule identified |
| Phase 2 | 0 | Main agent edits `styles.css` | 1 file changed |
| Phase 3 | 0 | Main agent edits `script.js` | 1 file changed |
| Phase 4 (dry-run review) | 3 | Template A × 3 — one per JSON file | APPROVED / FLAGGED verdict per file |
| Phase 4 (apply) | 0 | Main agent applies the script sequentially after human approval | 3 committed file changes |
| Phase 5 (manual) | 2 | Template B × 2 — one for blends file, one for stacks file | Modified JSON per file; flagged items |
| Phase 5b Wave 1 | 8 | Template C: Audit-Blend-1, Audit-Stack-1, Audit-Pep-1 through Audit-Pep-6 | Proposed field corrections + change summaries per batch |
| Phase 5b Wave 2 | 3 | Template C: Audit-Pep-7, Audit-Pep-8, Audit-Pep-9 | Proposed field corrections + change summaries |
| Phase 5b (apply) | 0 | Main agent merges all patches, writes files, commits | 3 committed file changes |
| Phase 6 | 0 | Main agent edits `why.html` and `about.html` | 2 files changed |
| Phase 7 (automated) | 4 | Template D × 3 (one per JSON file) + HTML check subagent | CLEAN / NEEDS-ATTENTION per file |
| Phase 7 (browser) | 0 | Main agent manual check | C8, C13 verification |

**Maximum concurrent at any moment: 8** (Phase 5b Wave 1). Total subagent dispatches across full execution: ~21.

---

### 6b.5 State and commit coordination rules

1. **Main agent owns all commits.** Subagents return proposed changes only — never write to files, never call `git`.
2. **No two subagents touch the same file.** Peptide audit subagents all read from `peptide_frontend_library_v2.json` but return patches; the main agent applies all patches to the file in one write.
3. **Subagents receive their input context at dispatch time.** If a file has been modified since the last dispatch, the main agent must re-read the current file state before constructing the next subagent's prompt. Never pass stale content.
4. **Flagged items always surface to the main agent.** If a subagent flags an ambiguous case, the main agent decides — either fix it directly, escalate to human review, or include it in the final report as deferred.
5. **Wave 2 does not dispatch until Wave 1 results are received.** This prevents queuing more work before confirming the first wave pattern holds.
6. **If any subagent returns NEEDS-ATTENTION in Phase 7, stop.** Do not proceed to final report until the main agent has investigated and resolved the failure.

---

## 7. Phase Checklist

**Phase 0 — Baseline (no edits)**
- [ ] Run all C1–C7 verification commands and save output to `docs/audit-baseline.txt`
- [ ] Note em dash counts: peptide (96), blends (16), stacks (30)
- [ ] Note spacing bug counts per file
- [ ] Note citation spacing counts: blends (109), stacks (36)
- [ ] **Gate: human reviews baseline before proceeding**

**Phase 1 — CSS investigation (browser + DevTools, no edits)**
- [ ] Run the site locally (or open via file://)
- [ ] Open one blend page and one stack page
- [ ] Use DevTools to inspect the computed styles on `.accordion-body-inner p` and `.side-effects-list li`
- [ ] Identify the exact rule(s) responsible for centering
- [ ] Record findings in `docs/audit-baseline.txt`
- [ ] **Gate: share DevTools findings before any CSS editing begins**

**Phase 2 — CSS fix (styles.css)**
- [ ] If centering confirmed: add `text-align: left` to identified selector(s) in `styles.css` (C1, C2)
- [ ] Open browser and verify list items are left-aligned with markers correctly positioned (C13)
- [ ] Commit: `fix(css): left-align accordion prose and side-effects list items`
- [ ] If centering not confirmed: document as no-issue and close Phase 2 with no changes
- [ ] **Gate: human reviews visual change before proceeding**

**Phase 3 — Template fix (script.js)**
- [ ] Write conditional check in `renderDosingSection()` to skip recon stats/steps for stack entries
- [ ] Syntax check: `node --check script.js`
- [ ] Open stack page in browser: confirm broken "—" stats are gone (C8)
- [ ] Commit: `fix: suppress single-peptide recon card on stack pages`
- [ ] **Gate: human reviews visual change before proceeding**

**Phase 4 — Scripted data fixes**
- [ ] Write `scripts/fix-data.mjs` with dry-run mode
- [ ] Run dry-run on each file; review output
- [ ] **Gate: human approves dry-run diff before writing**
- [ ] Run on `peptide_frontend_library_v2.json`; verify C11, C1; commit
- [ ] Run on `peptide_blends_frontend_library.json`; verify C11, C3, C4, C6, C7; commit
- [ ] Run on `peptide_stacks_frontend_library.json`; verify C11, C2, C3, C4, C5, C6, C7; commit
- [ ] **Gate: human reviews git diff for each file before proceeding**

**Phase 5 — Manual data fixes**
- [ ] Investigate A12 (numbered lists in body prose) by searching all three JSON files for patterns like `"1. "`, `"2. "` inside body strings; document any found instances
- [ ] Fix 4 em dashes in blend/stack body prose (A3)
- [ ] Fix injection frequency summaries on both CJC+Ipamorelin stack entries (A11); verify C14
- [ ] Move misclassified efficacy items in `cagrilintide-semaglutide` (A9)
- [ ] Move misclassified item in `tri-heal` (A9)
- [ ] Remove orphan headers from all 4 stack `side_effects.items[0]` (A10)
- [ ] Document `pt-141-melanotan-ii` empty component fields in `docs/audit-changes.md`
- [ ] Document citation label em dashes as reviewed and left unchanged
- [ ] Commit each logical group separately

**Phase 6 — Static HTML fixes (why.html, about.html)**
- [ ] Fix passive voice in `why.html` line 298: "Sources are drawn from..." → "We draw sources from..." (D1, C15)
- [ ] Rewrite "The gap we're filling" section label in `why.html` (D2)
- [ ] Rewrite "What we're not" grid titles to vary structure away from "Not a X" × 4 (D3)
- [ ] Review "not medical advice" locations site-wide; propose and execute consolidation (D4, C16)
- [ ] Verify `why.html` and `about.html` are valid HTML after edits
- [ ] **Gate: human reviews static HTML diffs before committing**
- [ ] Commit: `fix(why): voice, parallel structure, disclaimer consolidation`

**Phase 7 — Verification**
- [ ] Run all C1–C7 automated checks → all pass
- [ ] Run C8, C13 manual browser checks → pass
- [ ] Run C9, C10, C14, C15, C16 checks → pass
- [ ] Verify C11 JSON parse → OK
- [ ] Complete `docs/audit-changes.md` with all touched entries (C12)
- [ ] Final report: total entries touched, fixes by category, items skipped, verification results

---

**Awaiting approval. No edits will begin until you confirm.**

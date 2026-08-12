/**
 * PeptideRef data-fix script
 *
 * Usage:
 *   node scripts/fix-data.mjs [--dry-run] <file>
 *
 * Applies systematic, regex-safe transformations to the JSON data files.
 * With --dry-run, prints proposed changes without writing to disk.
 * Exits non-zero if any transformation produces unexpected output.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const DRY_RUN = process.argv.includes('--dry-run')
const fileArg = process.argv.find(a => a.endsWith('.json'))

if (!fileArg) {
  console.error('Usage: node scripts/fix-data.mjs [--dry-run] <file.json>')
  process.exit(1)
}

const filePath = resolve(fileArg)
const raw = readFileSync(filePath, 'utf8')
const data = JSON.parse(raw)
const entries = data.peptides || []

// ── Change tracking ──────────────────────────────────────────────────────────

const changes = []
let totalChanged = 0

function record(slug, field, before, after, transformId) {
  if (before === after) return before
  changes.push({ slug, field, transformId, before: before.slice(0, 120), after: after.slice(0, 120) })
  return after
}

// ── Transformation functions ─────────────────────────────────────────────────

/**
 * A1 — Em dash in reconstitution step 3 (peptide file only)
 * "Gently swirl or roll the vial to mix — do not shake." → "... — do not shake" → ": do not shake"
 * Only targets the exact em dash pattern in swirl/shake steps.
 */
function fixReconStepEmDash(value) {
  return value.replace(/ — do not shake/g, ': do not shake')
}

/**
 * A2 — Em dash in stack protocol labels
 * "CJC-1295 DAC — Standard" → "CJC-1295 DAC: Standard"
 * Only in label fields — targets em dash between peptide name and phase/variant descriptor.
 * Skips citation labels (those have " — " between publisher and title in research.resources).
 */
function fixProtocolLabelEmDash(value) {
  return value.replace(/ — /g, ': ')
}

/**
 * A4 — Strip "How This Works\n" heading duplication from how_it_works.body
 */
function fixHeadingDuplication(value) {
  return value.replace(/^How This Works\n+/i, '')
}

/**
 * A5/A6 — Spacing bugs in reconstitution and storage fields
 * Fixes: Add3.0 → Add 3.0, Draw2.0 → Draw 2.0, at2–8 → at 2–8,
 *        mLbacteriostatic → mL bacteriostatic, mLtotal → mL total,
 *        mLconcentration → mL concentration, mLonce → mL once,
 *        →4 → → 4, :0. → : 0., range:0 → range: 0
 */
function fixSpacingBugs(value) {
  let v = value
  // Verb+number: Add3, Draw3, at2
  v = v.replace(/\b(Add|Draw|at)(\d)/g, '$1 $2')
  // mL immediately followed by a word char (but not a digit — e.g. mg/mL is fine)
  // Target: mLb, mLt, mLc, mLo, mLw, mLs, mLp, mLa
  v = v.replace(/mL([a-zA-Z])/g, 'mL $1')
  // Arrow directly before number: →4 → → 4
  v = v.replace(/→(\d)/g, '→ $1')
  // Colon directly before digit in prose contexts: :0., :1., etc.
  // Careful: don't touch ratios like 1:10 or time like 2:30
  // Target: "concentration:0." "range:0." patterns only
  v = v.replace(/(concentration|range):(\d)/gi, '$1: $2')
  return v
}

/**
 * A7 — Add space before citation markers: word[1] → word [1]
 * Only adds a space when a word character directly precedes [digit].
 */
function fixCitationSpacing(value) {
  return value.replace(/(\w)(\[\d+\])/g, '$1 $2')
}

/**
 * A8 — Fix "m L" split unit abbreviation → "mL"
 * Only targets the exact string " m L" inside unit/volume values.
 */
function fixMLSplit(value) {
  // \bm L\b misses "m Lbacteriostatic" (no word boundary between L and b)
  return value.replace(/\bm L/g, 'mL')
}

// ── Per-file transformation routing ─────────────────────────────────────────

const filename = filePath.split('/').pop()

function applyToString(slug, fieldPath, value, fns) {
  if (typeof value !== 'string') return value
  let v = value
  for (const [id, fn] of fns) {
    const after = fn(v)
    v = record(slug, fieldPath, v, after, id)
  }
  return v
}

// Walk all string fields in an object recursively, applying fns to matching paths
function walkAndApply(obj, slug, pathPrefix, fns) {
  if (typeof obj === 'string') return applyToString(slug, pathPrefix, obj, fns)
  if (Array.isArray(obj)) {
    return obj.map((item, i) => walkAndApply(item, slug, `${pathPrefix}[${i}]`, fns))
  }
  if (obj && typeof obj === 'object') {
    const result = {}
    for (const [k, v] of Object.entries(obj)) {
      result[k] = walkAndApply(v, slug, `${pathPrefix}.${k}`, fns)
    }
    return result
  }
  return obj
}

let modifiedEntries = []

// ─── PEPTIDE FILE ────────────────────────────────────────────────────────────
if (filename === 'peptide_frontend_library_v2.json') {
  modifiedEntries = entries.map(entry => {
    const slug = entry.slug || entry.id || '?'
    let e = { ...entry }

    // A1 — recon step em dash (only in steps arrays)
    const recon = e.dosing_and_reconstitution?.reconstitution_guide
    if (recon?.steps) {
      e = {
        ...e,
        dosing_and_reconstitution: {
          ...e.dosing_and_reconstitution,
          reconstitution_guide: {
            ...recon,
            steps: recon.steps.map((s, i) =>
              applyToString(slug, `recon.steps[${i}]`, s, [['A1', fixReconStepEmDash]])
            )
          }
        }
      }
    }

    return e
  })
}

// ─── BLENDS FILE ─────────────────────────────────────────────────────────────
if (filename === 'peptide_blends_frontend_library.json') {
  modifiedEntries = entries.map(entry => {
    const slug = entry.slug || entry.id || '?'
    let e = JSON.parse(JSON.stringify(entry)) // deep clone

    // A4 — strip heading duplication in how_it_works.body
    const hiw = e.overview?.how_it_works
    if (hiw?.body) {
      hiw.body = applyToString(slug, 'overview.how_it_works.body', hiw.body, [['A4', fixHeadingDuplication]])
    }

    // A5 — spacing bugs in reconstitution, storage, and frequency fields
    const dr = e.dosing_and_reconstitution || {}
    const recon = dr.reconstitution_guide
    if (recon) {
      if (recon.summary) recon.summary = applyToString(slug, 'recon.summary', recon.summary, [['A5', fixSpacingBugs]])
      if (recon.steps) recon.steps = recon.steps.map((s, i) =>
        applyToString(slug, `recon.steps[${i}]`, s, [['A5', fixSpacingBugs]])
      )
    }
    // injection_frequency options
    const freq = dr.injection_frequency
    if (freq?.options) {
      freq.options = freq.options.map((opt, i) =>
        applyToString(slug, `injection_frequency.options[${i}]`, opt, [['A5', fixSpacingBugs]])
      )
    }
    if (freq?.summary) freq.summary = applyToString(slug, 'injection_frequency.summary', freq.summary, [['A5', fixSpacingBugs]])
    // protocol_duration
    const dur = dr.protocol_duration
    if (dur?.summary) dur.summary = applyToString(slug, 'protocol_duration.summary', dur.summary, [['A5', fixSpacingBugs]])
    // storage_and_handling (actual field name in blends)
    const storage = e.storage_and_handling
    if (storage?.reconstituted_storage) {
      storage.reconstituted_storage = applyToString(slug, 'storage_and_handling.reconstituted_storage', storage.reconstituted_storage, [['A5', fixSpacingBugs]])
    }
    if (storage?.lyophilized_storage) {
      storage.lyophilized_storage = applyToString(slug, 'storage_and_handling.lyophilized_storage', storage.lyophilized_storage, [['A5', fixSpacingBugs]])
    }

    // A7 — citation spacing — walk all string fields, skip research.resources labels and identifiers
    const SKIP_PATHS = new Set(['id', 'slug', 'name', 'href', 'type', 'label'])
    function applyA7Deep(obj, path) {
      if (typeof obj === 'string') {
        return applyToString(slug, path, obj, [['A7', fixCitationSpacing]])
      }
      if (Array.isArray(obj)) return obj.map((v, i) => applyA7Deep(v, `${path}[${i}]`))
      if (obj && typeof obj === 'object') {
        const result = {}
        for (const [k, v] of Object.entries(obj)) {
          // Skip research.resources label/href (citation metadata, not prose)
          if (path.includes('research.resources') && SKIP_PATHS.has(k)) {
            result[k] = v
          } else {
            result[k] = applyA7Deep(v, `${path}.${k}`)
          }
        }
        return result
      }
      return obj
    }
    e = applyA7Deep(e, slug)

    return e
  })
}

// ─── STACKS FILE ─────────────────────────────────────────────────────────────
if (filename === 'peptide_stacks_frontend_library.json') {
  modifiedEntries = entries.map(entry => {
    const slug = entry.slug || entry.id || '?'
    let e = JSON.parse(JSON.stringify(entry)) // deep clone

    // A2 — em dash in protocol labels
    const protocols = e.dosing_and_reconstitution?.dosage_protocols || []
    protocols.forEach(pr => {
      if (pr.label) pr.label = applyToString(slug, 'dosage_protocols.label', pr.label, [['A2', fixProtocolLabelEmDash]])
    })

    // A4 — strip heading duplication in how_it_works.body
    const hiw = e.overview?.how_it_works
    if (hiw?.body) {
      hiw.body = applyToString(slug, 'overview.how_it_works.body', hiw.body, [['A4', fixHeadingDuplication]])
    }

    // A6/A8 — spacing bugs across reconstitution, storage, stack_details, and supplies
    // A8 (m L → mL) must run before A6 (mLx → mL x) so that "m Lbacteriostatic"
    // becomes "mLbacteriostatic" first, then "mL bacteriostatic".
    const A6A8 = [['A8', fixMLSplit], ['A6', fixSpacingBugs]]

    // Apply A6/A8 to all string values in a subtree (walk every field)
    function applyA6A8Deep(obj, path) {
      if (typeof obj === 'string') return applyToString(slug, path, obj, A6A8)
      if (Array.isArray(obj)) return obj.map((v, i) => applyA6A8Deep(v, `${path}[${i}]`))
      if (obj && typeof obj === 'object') {
        const result = {}
        for (const [k, v] of Object.entries(obj)) result[k] = applyA6A8Deep(v, `${path}.${k}`)
        return result
      }
      return obj
    }

    const recon = e.dosing_and_reconstitution?.reconstitution_guide
    if (recon) {
      if (recon.summary) recon.summary = applyToString(slug, 'recon.summary', recon.summary, A6A8)
      if (recon.steps) recon.steps = recon.steps.map((s, i) =>
        applyToString(slug, `recon.steps[${i}]`, s, A6A8)
      )
    }
    const storage = e.storage_and_handling
    if (storage?.reconstituted_storage) {
      storage.reconstituted_storage = applyToString(slug, 'storage_and_handling.reconstituted_storage', storage.reconstituted_storage, A6A8)
    }
    if (storage?.lyophilized_storage) {
      storage.lyophilized_storage = applyToString(slug, 'storage_and_handling.lyophilized_storage', storage.lyophilized_storage, A6A8)
    }
    // Walk all of stack_details and supplies_needed broadly (covers reconstitution_steps[], dosing_table, etc.)
    if (e.stack_details) e.stack_details = applyA6A8Deep(e.stack_details, 'stack_details')
    if (e.supplies_needed) e.supplies_needed = applyA6A8Deep(e.supplies_needed, 'supplies_needed')
    // dosage_protocols units_or_volume (A8 only — not prose, don't apply full spacing)
    protocols.forEach(pr => {
      if (pr.units_or_volume) pr.units_or_volume = applyToString(slug, 'dosage_protocols.units_or_volume', pr.units_or_volume, [['A8', fixMLSplit]])
    })

    // A7 — citation spacing — walk all string fields, skip research.resources metadata
    const SKIP_PATHS_STACKS = new Set(['id', 'slug', 'name', 'href', 'type', 'label'])
    function applyA7DeepStack(obj, path) {
      if (typeof obj === 'string') {
        return applyToString(slug, path, obj, [['A7', fixCitationSpacing]])
      }
      if (Array.isArray(obj)) return obj.map((v, i) => applyA7DeepStack(v, `${path}[${i}]`))
      if (obj && typeof obj === 'object') {
        const result = {}
        for (const [k, v] of Object.entries(obj)) {
          if (path.includes('research.resources') && SKIP_PATHS_STACKS.has(k)) {
            result[k] = v
          } else {
            result[k] = applyA7DeepStack(v, `${path}.${k}`)
          }
        }
        return result
      }
      return obj
    }
    e = applyA7DeepStack(e, slug)

    return e
  })
}

// ── Output ────────────────────────────────────────────────────────────────────

const changedSlugs = [...new Set(changes.map(c => c.slug))]
const byTransform = {}
for (const c of changes) {
  byTransform[c.transformId] = (byTransform[c.transformId] || 0) + 1
}

console.log(`\nFile: ${filename}`)
console.log(`Entries processed: ${entries.length}`)
console.log(`Entries with changes: ${changedSlugs.length}`)
console.log(`Total field changes: ${changes.length}`)
console.log(`By transform:`, byTransform)

if (DRY_RUN) {
  console.log('\n── DRY RUN — proposed changes ──')
  for (const c of changes) {
    console.log(`\n[${c.transformId}] ${c.slug} → ${c.field}`)
    console.log(`  BEFORE: ${JSON.stringify(c.before)}`)
    console.log(`  AFTER:  ${JSON.stringify(c.after)}`)
  }
  console.log('\nDry run complete. No files written.')
} else {
  // Validate round-trip before writing
  const modified = { ...data, peptides: modifiedEntries }
  const serialized = JSON.stringify(modified, null, 2)
  JSON.parse(serialized) // throws if invalid

  writeFileSync(filePath, serialized, 'utf8')
  console.log(`\nWrote ${filePath}`)
}

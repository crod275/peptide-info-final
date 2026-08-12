// ─────────────────────────────────────────────────────────────────────────────
// calculator.js — Reusable inline dosage calculator component
// Depends on: calculator-core.js, calculator-presets.js (window.CALC_PRESETS, optional)
// Modes: 'page' (dedicated calculator page), 'detail' (embedded on peptide/blend/stack pages)
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const pageContainer = document.getElementById('calc-container')
  if (pageContainer) {
    renderInlineCalculator(pageContainer, { mode: 'page' })
  }
  if (typeof initAccordion === 'function') initAccordion()
})

// ─── Fallback dropdown options (used by the sidebar calculator before a peptide is selected) ─

const FALLBACK_VIAL_OPTS  = [0.1, 0.25, 0.5, 1, 1.5, 2, 2.5, 3, 5, 10, 15, 20, 25, 50]
const FALLBACK_WATER_OPTS = [0.5, 1, 1.5, 2, 2.5, 3, 5, 10]
const FALLBACK_DOSE_OPTS  = [25, 50, 100, 150, 200, 250, 500, 750, 1000, 1500, 2000, 2500, 5000, 10000]

function buildVialOpts(vals, sel) {
  return (vals || FALLBACK_VIAL_OPTS).map(v =>
    `<option value="${v}"${v == sel ? ' selected' : ''}>${v} mg</option>`
  ).join('')
}

function buildWaterOpts(vals, sel) {
  return (vals || FALLBACK_WATER_OPTS).map(v =>
    `<option value="${v}"${v == sel ? ' selected' : ''}>${v} mL</option>`
  ).join('')
}

function buildDoseOpts(vals, sel) {
  return (vals || FALLBACK_DOSE_OPTS).map(v => {
    const lbl = v >= 1000
      ? `${+(v / 1000).toFixed(3).replace(/\.?0+$/, '')} mg`
      : `${v} mcg`
    return `<option value="${v}"${v == sel ? ' selected' : ''}>${lbl}</option>`
  }).join('')
}

// ─── Data loading (used only for the optional "load from research profile" search) ────────────

async function getCalcData() {
  if (window.__calcData) return window.__calcData
  try {
    const [pepRes, blendRes, stackRes] = await Promise.all([
      fetch('peptide_frontend_library_v2.json'),
      fetch('peptide_blends_frontend_library.json'),
      fetch('peptide_stacks_frontend_library.json')
    ])
    const pepJson   = await pepRes.json()
    const blendJson = await blendRes.json()
    const stackJson = await stackRes.json()
    window.__calcData = {
      peptides: pepJson.peptides   || [],
      blends:   blendJson.peptides || [],
      stacks:   stackJson.peptides || []
    }
    return window.__calcData
  } catch (e) {
    console.error('Calculator: failed to load data', e)
    return { peptides: [], blends: [], stacks: [] }
  }
}

// ─── Shared calculation (single source of truth for the full calculator + sidebar calculator) ─
// Assumes inputs already passed validateInputs() — does not re-validate.

function runCalculation({ vialMg, waterMl, doseMg, syringeType }) {
  const conc        = calcConcentration(vialMg, waterMl)
  const vol         = calcInjectionVolumeMl(doseMg, conc)
  const units       = calcSyringeUnits(vol, syringeType)
  const roundedUnits = Math.round(units)
  const perUnitMg   = conc / SYRINGE_UNITS[syringeType]
  const capWarn     = checkSyringeCapacity(vol, syringeType)
  const roundWarn   = checkDoseRounding(units)
  return { conc, vol, units, roundedUnits, perUnitMg, capWarn, roundWarn }
}

function formatMgDisplay(mg) {
  const mcg = mg * 1000
  const trim = n => (+n.toFixed(2)).toString()
  return mcg < 1000 ? `${trim(mcg)} mcg` : `${trim(mg)} mg`
}

function fmtVolMl(v) {
  return v < 0.01 ? v.toFixed(4) : v < 0.1 ? v.toFixed(3) : v.toFixed(2)
}

function fmtConcentration(c) {
  return `${(+c.toFixed(4))} mg/mL`
}

// ─── Main render function ─────────────────────────────────────────────────────

function renderInlineCalculator(container, options) {
  options = options || {}
  container.innerHTML = buildCalcHTML(options.mode)
  initCalcInteractivity(container, options)
}

const VIAL_PRESET_OPTS  = [1, 2, 5, 10, 15, 20, 30]
const WATER_PRESET_OPTS = [0.5, 1, 2, 2.5, 3, 5]

// ─── Editable combobox field builder ──────────────────────────────────────────
// A text input the user can type into directly, paired with a button that opens
// a listbox of preset values. Typing filters the list; picking an option just
// writes its value into the input — there is no separate "custom" mode.

const CALC_COMBOBOX_CHEVRON_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
</svg>`

function buildComboboxOptionsHTML(inputId, presets, formatLabel) {
  return presets.map(v =>
    `<li role="option" id="${inputId}-opt-${v}" class="calc-combobox-option" data-value="${v}">${formatLabel(v)}</li>`
  ).join('')
}

function buildComboboxHTML({ inputId, listId, presets, formatLabel, defaultValue, unitBadge, attached }) {
  return `
        <div class="calc-combobox${attached ? ' calc-combobox--attached' : ''}">
          <input type="text" inputmode="decimal" class="calc-input calc-combobox-input${attached ? ' calc-dose-input' : ''}"
                 id="${inputId}" role="combobox" aria-autocomplete="list" aria-expanded="false"
                 aria-controls="${listId}" aria-describedby="${inputId}-error" autocomplete="off"
                 value="${defaultValue}" />
          ${unitBadge ? `<span class="calc-combobox-unit-badge">${unitBadge}</span>` : ''}
          <button type="button" class="calc-combobox-toggle" tabindex="-1" aria-expanded="false" aria-label="Show preset options">
            ${CALC_COMBOBOX_CHEVRON_SVG}
          </button>
          <ul class="calc-combobox-list" id="${listId}" role="listbox" hidden>
            ${buildComboboxOptionsHTML(inputId, presets, formatLabel)}
          </ul>
        </div>`
}

function initCombobox(container, { inputId, listId }) {
  const input = container.querySelector('#' + inputId)
  const list  = container.querySelector('#' + listId)
  if (!input || !list) return
  const toggle = input.parentElement.querySelector('.calc-combobox-toggle')

  function optionEls() { return Array.from(list.querySelectorAll('.calc-combobox-option')) }
  function visibleOptionEls() { return optionEls().filter(li => !li.hidden) }

  let activeIndex = -1

  function setActive(idx) {
    const visible = visibleOptionEls()
    visible.forEach(li => li.classList.remove('calc-combobox-option--active'))
    activeIndex = idx
    if (idx >= 0 && idx < visible.length) {
      visible[idx].classList.add('calc-combobox-option--active')
      input.setAttribute('aria-activedescendant', visible[idx].id)
      visible[idx].scrollIntoView({ block: 'nearest' })
    } else {
      input.removeAttribute('aria-activedescendant')
    }
  }

  function openList(filterText) {
    let anyVisible = false
    optionEls().forEach(li => {
      const match = !filterText || String(li.dataset.value).startsWith(filterText)
      li.hidden = !match
      if (match) anyVisible = true
    })
    if (!anyVisible) { closeList(); return }
    list.hidden = false
    input.setAttribute('aria-expanded', 'true')
    if (toggle) toggle.setAttribute('aria-expanded', 'true')
    setActive(-1)
  }

  function closeList() {
    list.hidden = true
    input.setAttribute('aria-expanded', 'false')
    if (toggle) toggle.setAttribute('aria-expanded', 'false')
    activeIndex = -1
    input.removeAttribute('aria-activedescendant')
  }

  input.addEventListener('input', () => {
    openList(input.value.trim())
  })

  input.addEventListener('focus', () => openList(input.value.trim()))

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (list.hidden) { openList(input.value.trim()); return }
      setActive(Math.min(activeIndex + 1, visibleOptionEls().length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (list.hidden) { openList(input.value.trim()); return }
      setActive(Math.max(activeIndex - 1, 0))
    } else if (e.key === 'Enter') {
      const visible = visibleOptionEls()
      if (!list.hidden && activeIndex >= 0 && visible[activeIndex]) {
        e.preventDefault()
        input.value = visible[activeIndex].dataset.value
        closeList()
      }
    } else if (e.key === 'Escape') {
      if (!list.hidden) { closeList(); e.stopPropagation() }
    }
  })

  if (toggle) {
    toggle.addEventListener('mousedown', e => {
      e.preventDefault()
      if (list.hidden) { openList(''); input.focus() } else { closeList() }
    })
  }

  list.addEventListener('mousedown', e => {
    const li = e.target.closest('.calc-combobox-option')
    if (!li) return
    e.preventDefault()
    input.value = li.dataset.value
    closeList()
    input.focus()
  })

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !list.contains(e.target) && (!toggle || !toggle.contains(e.target))) {
      closeList()
    }
  })
}

function setComboboxValue(container, inputId, value) {
  const input = container.querySelector('#' + inputId)
  if (input) input.value = value
}

// ─── Core three fields (vial strength / BAC water / desired dose) ─────────────

function calcCoreFieldsHTML() {
  return `
      <div class="calc-field">
        <label class="calc-label" for="calc-vial-input">Vial strength</label>
        <div class="calc-dose-row">
          ${buildComboboxHTML({
            inputId: 'calc-vial-input', listId: 'calc-vial-list',
            presets: VIAL_PRESET_OPTS, formatLabel: v => `${v} mg`,
            defaultValue: 10, attached: true
          })}
          <select class="calc-unit-select" id="calc-vial-unit" aria-label="Vial strength unit">
            <option value="mg" selected>mg</option>
            <option value="mcg">mcg</option>
          </select>
        </div>
        <p class="calc-field-hint">
          <span class="calc-hint-full">The total amount listed on the vial. Type a value or pick a preset.</span>
          <span class="calc-hint-short">Total amount in the vial.</span>
        </p>
        <p class="calc-field-error" id="calc-vial-input-error" role="alert" hidden></p>
      </div>

      <div class="calc-field">
        <label class="calc-label" for="calc-water-input">BAC water added</label>
        ${buildComboboxHTML({
          inputId: 'calc-water-input', listId: 'calc-water-list',
          presets: WATER_PRESET_OPTS, formatLabel: v => `${v} mL`,
          defaultValue: 2, unitBadge: 'mL'
        })}
        <p class="calc-field-hint">
          <span class="calc-hint-full">The amount of bacteriostatic water added to the vial. Type a value or pick a preset.</span>
          <span class="calc-hint-short">Amount of BAC water added.</span>
        </p>
        <p class="calc-field-error" id="calc-water-input-error" role="alert" hidden></p>
      </div>

      <div class="calc-field">
        <label class="calc-label" for="calc-dose-value">Desired dose</label>
        <div class="calc-dose-row">
          <input type="number" inputmode="decimal" class="calc-input calc-dose-input" id="calc-dose-value" min="0" step="any" placeholder="e.g. 250" aria-describedby="calc-dose-error" />
          <select class="calc-unit-select" id="calc-dose-unit" aria-label="Desired dose unit">
            <option value="mcg">mcg</option>
            <option value="mg">mg</option>
          </select>
        </div>
        <div class="calc-chip-row" role="group" aria-label="Quick dose amounts">
          <button type="button" class="calc-chip" data-value="100" data-unit="mcg">100 mcg</button>
          <button type="button" class="calc-chip" data-value="250" data-unit="mcg">250 mcg</button>
          <button type="button" class="calc-chip" data-value="500" data-unit="mcg">500 mcg</button>
        </div>
        <p class="calc-field-hint">
          <span class="calc-hint-full">The amount to calculate per injection. Shortcuts are common research amounts, not a recommendation.</span>
          <span class="calc-hint-short">Amount to calculate per injection.</span>
        </p>
        <p class="calc-field-error" id="calc-dose-error" role="alert" hidden></p>
      </div>`
}

const CALCULATE_ICON_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="m18 2 4 4"/><path d="m17 7 3-3"/>
  <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/>
  <path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>
</svg>`

function calcExtrasHTML() {
  return `
      <details class="calc-optional-details">
        <summary>Optional: Load values from a research profile</summary>
        <div class="calc-optional-body">
          <div class="calc-field">
            <label class="calc-label" for="calc-peptide-search">Search peptide or blend</label>
            <div class="calc-search-wrap">
              <svg class="calc-search-icon" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
              </svg>
              <input
                id="calc-peptide-search"
                class="calc-search-input calc-input"
                type="text"
                placeholder="Search peptides or blends…"
                autocomplete="off"
                spellcheck="false"
              />
              <div id="calc-search-dropdown" class="calc-search-dropdown" hidden role="listbox" aria-label="Peptide suggestions"></div>
            </div>
            <input type="hidden" id="calc-peptide-slug" />
            <input type="hidden" id="calc-peptide-type" />
            <p class="calc-field-hint">Selecting a profile fills in its known vial size and BAC water — it does not recommend a dose.</p>
          </div>
          <a class="calc-profile-link" id="calc-profile-link" href="#" hidden>View research profile →</a>
        </div>
      </details>

      <details class="calc-advanced-details">
        <summary>Advanced options</summary>
        <div class="calc-advanced-body">
          <div class="calc-field">
            <label class="calc-label" for="calc-syringe-select">Syringe type</label>
            <select class="calc-select" id="calc-syringe-select">
              <option value="U-100" selected>U-100 insulin (100 units/mL)</option>
              <option value="U-50">U-50 insulin (50 units/mL)</option>
              <option value="U-40">U-40 insulin (40 units/mL)</option>
            </select>
          </div>
          <button type="button" class="calc-copy-btn" id="calc-copy-btn">Copy result</button>
        </div>
      </details>`
}

// mode 'page' (dedicated calculator page): the optional/advanced accordions render as a
// third grid area below the results panel, so the syringe sits right after the core
// fields on mobile instead of below the (collapsed) accordions. mode 'detail' (embedded
// on peptide/blend/stack pages) keeps the original single-column layout untouched.
function buildCalcHTML(mode) {
  const isPage = mode === 'page'

  return `
<div class="calc-card">
  <form class="calc-form-grid${isPage ? ' calc-form-grid--page' : ''}" id="calc-form" novalidate>

    <!-- LEFT: INPUTS -->
    <div class="calc-inputs-col">
      <p class="calc-col-label">Calculator</p>

      ${calcCoreFieldsHTML()}

      <div class="calc-actions-row">
        <button type="submit" class="calc-calculate-btn" id="calc-calculate-btn">
          ${CALCULATE_ICON_SVG}
          Calculate dosage
        </button>
        ${isPage ? '' : '<button type="button" class="calc-reset-btn" id="calc-reset-btn">Reset</button>'}
      </div>

      ${isPage ? '' : calcExtrasHTML()}
    </div><!-- /calc-inputs-col -->

    <!-- RIGHT: RESULTS -->
    <div class="calc-outputs-col">
      <div id="calc-results" aria-live="polite"></div>
      ${isPage ? '<button type="button" class="calc-reset-btn calc-reset-btn--minor" id="calc-reset-btn">Reset</button>' : ''}
    </div><!-- /calc-outputs-col -->

    ${isPage ? `<div class="calc-inputs-extra">${calcExtrasHTML()}</div><!-- /calc-inputs-extra -->` : ''}

  </form><!-- /calc-form-grid -->
</div><!-- /calc-card -->
`
}

// ─── Interactivity init ────────────────────────────────────────────────────────

function initCalcInteractivity(container, options) {
  options = options || {}
  const mode = options.mode || 'page'

  calcShowEmpty(container)

  const form = container.querySelector('#calc-form')
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault()
      calcRecalculate(container)
    })
  }

  initCombobox(container, { inputId: 'calc-vial-input', listId: 'calc-vial-list' })
  initCombobox(container, { inputId: 'calc-water-input', listId: 'calc-water-list' })

  container.querySelectorAll('.calc-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const valEl  = container.querySelector('#calc-dose-value')
      const unitEl = container.querySelector('#calc-dose-unit')
      if (valEl)  valEl.value  = btn.dataset.value
      if (unitEl) unitEl.value = btn.dataset.unit
      container.querySelectorAll('.calc-chip').forEach(b => b.classList.remove('calc-chip--active'))
      btn.classList.add('calc-chip--active')
    })
  })

  const resetBtn = container.querySelector('#calc-reset-btn')
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset()
      setComboboxValue(container, 'calc-vial-input', '10')
      setComboboxValue(container, 'calc-water-input', '2')
      container.querySelectorAll('.calc-chip').forEach(b => b.classList.remove('calc-chip--active'))
      clearFieldErrors(container)
      _calcSelectedItem = null
      const slugInput = container.querySelector('#calc-peptide-slug')
      const searchInput = container.querySelector('#calc-peptide-search')
      const profileLink = container.querySelector('#calc-profile-link')
      if (slugInput) slugInput.value = ''
      if (searchInput) searchInput.value = ''
      if (profileLink) profileLink.hidden = true
      calcShowEmpty(container)
    })
  }

  const copyBtn = container.querySelector('#calc-copy-btn')
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = container.querySelector('#calc-results')?.dataset.copyText || ''
      if (!text || !navigator.clipboard) return
      navigator.clipboard.writeText(text).then(() => {
        const original = copyBtn.textContent
        copyBtn.textContent = 'Copied!'
        setTimeout(() => { copyBtn.textContent = original }, 1500)
      })
    })
  }

  getCalcData().then(data => {
    const allItems = buildSearchList(data.peptides, data.blends, data.stacks)
    wireSearchInput(container, allItems)
    if (options.initialSlug) {
      preloadPeptide(container, options.initialSlug, allItems)
    }
  })

  // Prefill from query params (only the dedicated calculator page, not embedded detail widgets)
  if (mode === 'page') {
    applyQueryParamPrefill(container)
  }
}

function applyQueryParamPrefill(container) {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('vial') && !params.has('water') && !params.has('dose')) return

  const vial  = parseFloat(params.get('vial'))
  const water = parseFloat(params.get('water'))
  const dose  = parseFloat(params.get('dose'))
  const doseUnit = params.get('doseUnit') === 'mg' ? 'mg' : 'mcg'

  if (Number.isFinite(vial))  setComboboxValue(container, 'calc-vial-input', vial)
  if (Number.isFinite(water)) setComboboxValue(container, 'calc-water-input', water)
  if (Number.isFinite(dose)) {
    const doseEl = container.querySelector('#calc-dose-value')
    const unitEl = container.querySelector('#calc-dose-unit')
    if (doseEl) doseEl.value = dose
    if (unitEl) unitEl.value = doseUnit
  }
  if (Number.isFinite(vial) && Number.isFinite(water) && Number.isFinite(dose)) {
    calcRecalculate(container)
  }
}

// Build a flat, searchable list from peptides, blends, and stacks
function buildSearchList(peptides, blends, stacks) {
  const items = []
  peptides = peptides || []
  blends   = blends   || []
  stacks   = stacks   || []

  const sortedPeps = [...peptides].sort((a, b) => {
    const na = (a.base_name || a.name || '').toLowerCase()
    const nb = (b.base_name || b.name || '').toLowerCase()
    if (na < nb) return -1
    if (na > nb) return 1
    return (a.vial_strength || '').localeCompare(b.vial_strength || '')
  })

  sortedPeps.forEach(p => {
    const recon = p.dosing_and_reconstitution && p.dosing_and_reconstitution.reconstitution_guide
    items.push({
      slug:      p.slug,
      type:      'peptide',
      label:     p.name || p.base_name,
      baseName:  p.base_name || p.name,
      vialAmt:   recon ? (recon.vial_amount || '') : '',
      waterMl:   recon ? (recon.bacteriostatic_water || '') : '',
      blendNote: null
    })
  })

  const sortedBlends = [...blends].sort((a, b) => {
    const na = (a.base_name || a.name || '').toLowerCase()
    const nb = (b.base_name || b.name || '').toLowerCase()
    return na < nb ? -1 : na > nb ? 1 : 0
  })

  sortedBlends.forEach(b => {
    const recon = b.dosing_and_reconstitution && b.dosing_and_reconstitution.reconstitution_guide
    if (!recon) return
    items.push({
      slug:      b.slug,
      type:      'blend',
      label:     b.name || b.base_name,
      baseName:  b.base_name || b.name,
      vialAmt:   recon.vial_amount || '',
      waterMl:   recon.bacteriostatic_water || '',
      blendNote: recon.summary || null
    })
  })

  const sortedStacks = [...stacks].sort((a, b) => {
    const na = (a.base_name || a.name || '').toLowerCase()
    const nb = (b.base_name || b.name || '').toLowerCase()
    return na < nb ? -1 : na > nb ? 1 : 0
  })

  sortedStacks.forEach(s => {
    items.push({
      slug:      s.slug,
      type:      'stack',
      label:     s.name || s.base_name,
      baseName:  s.base_name || s.name,
      vialAmt:   '',
      waterMl:   '',
      blendNote: null
    })
  })

  return items
}

// Prefill vial/water fields from a selected profile's known reconstitution values
function applyProfileToFields(container, slug) {
  const p = window.CALC_PRESETS && window.CALC_PRESETS[slug]
  if (!p) return
  if (p.defaultVialMg) {
    setComboboxValue(container, 'calc-vial-input', p.defaultVialMg)
    const unitEl = container.querySelector('#calc-vial-unit')
    if (unitEl) unitEl.value = 'mg'
  }
  if (p.defaultBacWaterMl) setComboboxValue(container, 'calc-water-input', p.defaultBacWaterMl)
}

// ─── Searchable input (optional profile section) ──────────────────────────────

let _calcAllItems = []
let _calcSelectedItem = null

function wireSearchInput(container, allItems) {
  _calcAllItems = allItems

  const searchInput    = container.querySelector('#calc-peptide-search')
  const searchDropdown = container.querySelector('#calc-search-dropdown')
  if (!searchInput || !searchDropdown) return

  const TYPE_LABEL = { peptide: 'Peptide', blend: 'Blend', stack: 'Stack' }

  function itemRow(item) {
    const idx = allItems.indexOf(item)
    return `<div class="calc-search-item" role="option"
          data-slug="${escHtml(item.slug)}"
          data-type="${escHtml(item.type)}"
          data-idx="${idx}">
      <span class="calc-search-item-name">${escHtml(item.label)}</span>
      <span class="calc-search-item-type">${TYPE_LABEL[item.type] || 'Peptide'}</span>
    </div>`
  }

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase()
    if (!q) {
      searchDropdown.hidden = true
      return
    }
    const matches = []
    allItems.forEach(item => {
      const nameLow = item.label.toLowerCase()
      const baseLow = item.baseName.toLowerCase()
      if (!nameLow.includes(q) && !baseLow.includes(q)) return
      matches.push({ item, score: nameLow.startsWith(q) ? 0 : 1 })
    })
    matches.sort((a, b) => a.score - b.score)

    if (matches.length === 0) { searchDropdown.hidden = true; return }
    searchDropdown.innerHTML = matches.map(({ item }) => itemRow(item)).join('')
    searchDropdown.hidden = false
  })

  searchDropdown.addEventListener('mousedown', e => {
    const row = e.target.closest('.calc-search-item')
    if (!row) return
    e.preventDefault()
    const idx = parseInt(row.dataset.idx, 10)
    selectCalcItem(container, allItems[idx])
    searchDropdown.hidden = true
  })

  document.addEventListener('click', e => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
      searchDropdown.hidden = true
    }
  })
}

function selectCalcItem(container, item) {
  if (!item) return
  _calcSelectedItem = item

  const searchInput  = container.querySelector('#calc-peptide-search')
  const slugInput    = container.querySelector('#calc-peptide-slug')
  const typeInput    = container.querySelector('#calc-peptide-type')
  const profileLink  = container.querySelector('#calc-profile-link')
  if (searchInput) searchInput.value = item.label
  if (slugInput)   slugInput.value   = item.slug
  if (typeInput)   typeInput.value   = item.type

  applyProfileToFields(container, item.slug)

  if (profileLink) {
    profileLink.href   = `${item.type}.html?slug=${encodeURIComponent(item.slug)}`
    profileLink.hidden = false
  }
}

function preloadPeptide(container, slug, allItems) {
  const item = allItems.find(i => i.slug === slug)
  if (!item) return
  selectCalcItem(container, item)
}

// ─── Reading + validating inputs ──────────────────────────────────────────────

function calcReadInputs(container) {
  const vialRaw  = (container.querySelector('#calc-vial-input')  || {}).value || ''
  const vialUnit = (container.querySelector('#calc-vial-unit')   || {}).value || 'mg'
  const waterRaw = (container.querySelector('#calc-water-input') || {}).value || ''

  const vialMg  = vialRaw.trim()  ? parseMg(vialRaw.trim()  + ' ' + vialUnit) : NaN
  const waterMl = waterRaw.trim() ? parseMl(waterRaw.trim() + ' ml') : NaN

  const doseEl  = container.querySelector('#calc-dose-value')
  const doseUnitEl = container.querySelector('#calc-dose-unit')
  const doseRaw = doseEl ? doseEl.value.trim() : ''
  const doseMg  = doseRaw ? parseMg(doseRaw + ' ' + (doseUnitEl ? doseUnitEl.value : 'mcg')) : NaN

  const syringeEl = container.querySelector('#calc-syringe-select')
  const syringeType = syringeEl ? syringeEl.value : 'U-100'

  return { vialMg, waterMl, doseMg, syringeType }
}

// ─── Field-level error display ────────────────────────────────────────────────

const CALC_ERROR_FIELD_MAP = [
  { test: m => m.includes('Vial amount'), field: 'vial-input' },
  { test: m => m.includes('BAC water'), field: 'water-input' },
  { test: m => m.includes('Dose exceeds') || m.includes('Desired dose'), field: 'dose' },
  { test: m => m.toLowerCase().includes('syringe'), field: 'syringe' }
]

function clearFieldErrors(container) {
  ;['vial-input', 'water-input', 'dose', 'syringe'].forEach(f => {
    const el = container.querySelector(`#calc-${f}-error`)
    if (el) { el.textContent = ''; el.hidden = true }
    const inputEl = container.querySelector(`#calc-${f}, #calc-${f}-select, #calc-${f}-value`)
    if (inputEl) inputEl.removeAttribute('aria-invalid')
  })
}

function renderFieldErrors(container, errors) {
  const unmatched = []
  errors.forEach(msg => {
    const mapping = CALC_ERROR_FIELD_MAP.find(m => m.test(msg))
    const el = mapping ? container.querySelector(`#calc-${mapping.field}-error`) : null
    if (el) {
      el.textContent = msg
      el.hidden = false
      const inputEl = container.querySelector(`#calc-${mapping.field}, #calc-${mapping.field}-select, #calc-${mapping.field}-value`)
      if (inputEl) inputEl.setAttribute('aria-invalid', 'true')
    } else {
      unmatched.push(msg)
    }
  })

  const resultsEl = container.querySelector('#calc-results')
  if (resultsEl && unmatched.length) {
    resultsEl.innerHTML = `
      <div class="calc-error-box">
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        <ul>${unmatched.map(e => `<li>${escHtml(e)}</li>`).join('')}</ul>
      </div>`
  } else if (resultsEl) {
    calcShowEmpty(container)
  }
}

// ─── Calculation ───────────────────────────────────────────────────────────────

function calcRecalculate(container) {
  const { vialMg, waterMl, doseMg, syringeType } = calcReadInputs(container)
  const resultsEl = container.querySelector('#calc-results')
  if (!resultsEl) return

  clearFieldErrors(container)

  const { valid, errors } = validateInputs({ vialMg, waterMl, doseMg, syringeType })
  if (!valid) {
    renderFieldErrors(container, errors)
    return
  }

  const result = runCalculation({ vialMg, waterMl, doseMg, syringeType })
  calcRenderResults(container, { ...result, vialMg, waterMl, doseMg, syringeType })
}

// ─── Syringe visualization ─────────────────────────────────────────────────────
// Builds a large inline SVG syringe that visually fills to the calculated draw level.
// vol: injection volume in mL (0–1.0), syringeType: 'U-100'|'U-50'|'U-40',
// roundedUnits: integer unit count, doseDisplay: formatted dose string e.g. "200 mcg".

function buildSyringeSVG(vol, syringeType, roundedUnits, doseDisplay, hasResult) {
  const maxUnits = SYRINGE_UNITS[syringeType] || 100
  const NDIVS    = 10
  const unitStep = maxUnits / NDIVS

  // Horizontal barrel constants (SVG viewBox "0 0 480 150")
  // Needle at LEFT (0 units), plunger at RIGHT (100 units), fill grows left → right
  const INN_L = 60, INN_R = 420, INN_W = 360
  const INN_TOP = 42, INN_BTM = 102, INN_H = 60
  const divW = INN_W / NDIVS

  const fillFrac = Math.min(Math.max(vol || 0, 0), 1.0)
  let fillW = fillFrac * INN_W
  if (hasResult && fillW > 0 && fillW < 4) fillW = 4 // keep very small draws visible
  const indX = Math.round(INN_L + fillW)

  let ticks = ''
  for (let i = 0; i <= NDIVS; i++) {
    const x     = Math.round(INN_L + i * divW)
    const uVal  = i * unitStep
    const mlVal = (i / NDIVS).toFixed(1)

    ticks += `
      <line x1="${x}" y1="${INN_TOP}" x2="${x}" y2="${INN_TOP - 9}" class="syr-tick-maj"/>
      <line x1="${x}" y1="${INN_BTM}" x2="${x}" y2="${INN_BTM + 9}" class="syr-tick-maj"/>
      <text x="${x}" y="16" text-anchor="middle" dominant-baseline="middle" class="syr-lbl">${uVal}</text>
      <text x="${x}" y="128" text-anchor="middle" dominant-baseline="middle" class="syr-lbl">${mlVal}</text>`

    if (i < NDIVS) {
      const mx = Math.round(INN_L + (i + 0.5) * divW)
      ticks += `
      <line x1="${mx}" y1="${INN_TOP}" x2="${mx}" y2="${INN_TOP - 5}" class="syr-tick-min"/>
      <line x1="${mx}" y1="${INN_BTM}" x2="${mx}" y2="${INN_BTM + 5}" class="syr-tick-min"/>`
    }
  }

  const fillRect = hasResult
    ? `<rect x="${INN_L}" y="${INN_TOP}" width="${Math.round(fillW)}" height="${INN_H}" class="syr-fill"/>`
    : ''

  const indicator = hasResult ? `
      <line x1="${indX}" y1="${INN_TOP}" x2="${indX}" y2="${INN_BTM}" class="syr-indicator"/>
      <circle cx="${indX}" cy="${INN_BTM + 13}" r="4" class="syr-indicator-dot"/>`
    : ''

  const caption = hasResult
    ? `<p class="calc-syringe-cap-dose">${escHtml(doseDisplay)}</p>
       <p class="calc-syringe-cap-draw">Draw to <strong>${roundedUnits} units</strong> &nbsp;&middot;&nbsp; ${fmtVolMl(vol || 0)} mL</p>`
    : `<p class="calc-syringe-cap-empty">Enter your values to calculate the fill level.</p>`

  return `
<div class="calc-syringe-wrap">
  <svg viewBox="0 0 480 150" class="calc-syringe-svg"
       role="img" aria-label="Syringe draw level: ${roundedUnits} units on a ${escHtml(syringeType)} syringe">
    <defs>
      <clipPath id="syr-barrel-clip">
        <rect x="${INN_L}" y="${INN_TOP}" width="${INN_W}" height="${INN_H}"/>
      </clipPath>
    </defs>

    <!-- Needle shaft -->
    <rect x="4" y="68" width="40" height="8" rx="3" class="syr-needle"/>
    <!-- Needle hub (trapezoid, wider at barrel end) -->
    <path d="M44,55 L${INN_L},${INN_TOP} L${INN_L},${INN_BTM} L44,89 Z" class="syr-needle-hub"/>

    <!-- Barrel -->
    <rect x="${INN_L}" y="${INN_TOP}" width="${INN_W}" height="${INN_H}" rx="5" class="syr-barrel"/>

    <!-- Liquid fill (clipped to inner barrel) -->
    <g clip-path="url(#syr-barrel-clip)">
      ${fillRect}
    </g>

    <!-- Tick marks and labels -->
    ${ticks}

    <!-- Draw-to indicator -->
    ${indicator}

    <!-- Plunger rod -->
    <rect x="${INN_R}" y="60" width="14" height="30" rx="3" class="syr-plunger-rod"/>
    <!-- Plunger flange -->
    <rect x="${INN_R + 14}" y="29" width="18" height="86" rx="5" class="syr-plunger-flange"/>
  </svg>
  <div class="calc-syringe-cap">
    ${caption}
  </div>
</div>`
}

function calcShowEmpty(container) {
  const el = container.querySelector('#calc-results')
  if (!el) return
  el.innerHTML = buildSyringeSVG(0, 'U-100', 0, '', false)
}

// ─── Result rendering ──────────────────────────────────────────────────────────

function calcRenderResults(container, { conc, vol, units, roundedUnits, perUnitMg, capWarn, roundWarn, vialMg, waterMl, doseMg, syringeType }) {
  const doseDisplay    = formatMgDisplay(doseMg)
  const perUnitDisplay = formatMgDisplay(perUnitMg)

  let html = `
    <div class="calc-draw-hero">
      <p class="calc-draw-eyebrow">Draw</p>
      <div class="calc-draw-value" aria-label="${roundedUnits} units on syringe">
        ${roundedUnits}<span class="calc-draw-unit"> units</span>
      </div>
      <p class="calc-draw-sub">${fmtVolMl(vol)} mL in a ${escHtml(syringeType)} insulin syringe</p>
    </div>`

  html += buildSyringeSVG(vol, syringeType, roundedUnits, doseDisplay, true)

  html += `<div class="calc-detail-grid">
    <div class="calc-detail-item">
      <span class="calc-detail-label">Concentration</span>
      <span class="calc-detail-value">${escHtml(fmtConcentration(conc))}</span>
    </div>
    <div class="calc-detail-item">
      <span class="calc-detail-label">Amount per syringe unit</span>
      <span class="calc-detail-value">${escHtml(perUnitDisplay)}</span>
    </div>
  </div>`

  if (_calcSelectedItem && _calcSelectedItem.type === 'blend' && _calcSelectedItem.blendNote) {
    html += `
      <div class="calc-blend-note">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <p class="calc-blend-note-heading">Blend Composition</p>
          <p>${escHtml(_calcSelectedItem.blendNote)}</p>
        </div>
      </div>`
  }

  if (capWarn) {
    html += `
      <div class="calc-warning-box">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        Injection volume exceeds the selected syringe's capacity. Consider adding more BAC water or splitting into multiple injections.
      </div>`
  }

  if (roundWarn) {
    html += `
      <div class="calc-warning-box">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        The dose rounds to 0 units. The volume is too small to measure accurately on this syringe. Try adding less BAC water to increase concentration.
      </div>`
  }

  html += `
    <p class="calc-safety-note">
      For research use only. Always use sterile technique and consult a qualified healthcare professional before use.
    </p>`

  html += `
    <button class="calc-save-btn" aria-label="Save this calculation">
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
      </svg>
      Save calculation
    </button>`

  const el = container.querySelector('#calc-results')
  if (!el) return
  el.innerHTML = html
  el.dataset.copyText = `Draw ${roundedUnits} units (${fmtVolMl(vol)} mL) of ${escHtml(syringeType)} — ${fmtConcentration(conc)}, ${perUnitDisplay}/unit.`

  const saveBtn = el.querySelector('.calc-save-btn')
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!_currentUser) {
        if (typeof openLoginModal === 'function') openLoginModal()
        return
      }
      saveBtn.disabled = true
      saveBtn.textContent = 'Saving…'
      const { error } = await _supabase.from('saved_calculations').insert({
        user_id:             _currentUser.id,
        peptide_slug:        _calcSelectedItem?.slug || '',
        peptide_name:        _calcSelectedItem?.label || '',
        vial_mg:             vialMg,
        water_ml:            waterMl,
        dose_value:          doseMg * 1000,
        dose_unit:           'mcg',
        syringe_type:        syringeType,
        frequency_per_week:  null,
        draw_units:          roundedUnits,
        draw_ml:             vol,
        concentration_mg_ml: conc,
        doses_per_vial:      Math.floor(vialMg / doseMg),
      })
      saveBtn.disabled = false
      if (error) { saveBtn.textContent = 'Error — try again'; return }
      saveBtn.textContent = 'Saved!'
      if (typeof renderSavedCalcs === 'function') renderSavedCalcs()
      setTimeout(() => {
        saveBtn.innerHTML = `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg> Save calculation`
      }, 2000)
    })
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── Sidebar (sticky) calculator ─────────────────────────────────────────────
// Compact, pre-loaded calculator for the left sidebar on detail pages.
// Uses sb-* IDs (no conflict with the inline calc-* IDs). Uses the same
// runCalculation()/validateInputs() shared logic as the main calculator.

function renderSidebarCalculator(container, { slug, displayName }) {
  const presets    = (window.CALC_PRESETS && window.CALC_PRESETS[slug]) || null
  const vialOpts   = (presets && presets.vialOptions)  || FALLBACK_VIAL_OPTS
  const waterOpts  = (presets && presets.waterOptions) || FALLBACK_WATER_OPTS
  const doseOpts   = (presets && presets.doseOptions)  || FALLBACK_DOSE_OPTS
  const defVial    = (presets && presets.defaultVialMg)    || vialOpts[0]
  const defWater   = (presets && presets.defaultBacWaterMl) || waterOpts[1] || waterOpts[0]
  const hasNormal  = !!(presets && presets.dosePresets && presets.dosePresets.normal)
  const hasHigh    = !!(presets && presets.dosePresets && presets.dosePresets.high)
  const defDose    = hasNormal
    ? presets.dosePresets.normal.valueMcg
    : (doseOpts[0] || 250)

  container.innerHTML = `
    <div class="sb-calc-wrap">
      <p class="sb-calc-heading">Dosage Calculator</p>
      <p class="sb-calc-peptide-name">${escHtml(displayName)}</p>

      <div class="sb-preset-row">
        <button type="button" class="sb-preset-pill${hasNormal ? '' : ' sb-preset-pill--unavailable'}" data-preset="normal">Normal</button>
        <button type="button" class="sb-preset-pill${hasHigh   ? '' : ' sb-preset-pill--unavailable'}" data-preset="high">High</button>
      </div>

      <div class="sb-calc-field">
        <label class="sb-calc-label" for="sb-vial">Vial (mg)</label>
        <select id="sb-vial" class="sb-calc-input">${buildVialOpts(vialOpts, defVial)}</select>
      </div>
      <div class="sb-calc-field">
        <label class="sb-calc-label" for="sb-water">BAC water (mL)</label>
        <select id="sb-water" class="sb-calc-input">${buildWaterOpts(waterOpts, defWater)}</select>
      </div>
      <div class="sb-calc-field">
        <label class="sb-calc-label" for="sb-dose">Desired dose</label>
        <select id="sb-dose" class="sb-calc-input">${buildDoseOpts(doseOpts, defDose)}</select>
      </div>
      <div class="sb-calc-field">
        <label class="sb-calc-label" for="sb-syringe">Syringe</label>
        <select id="sb-syringe" class="sb-calc-input">
          <option value="U-100">U-100 insulin</option>
          <option value="U-40">U-40 insulin</option>
          <option value="U-50">U-50 insulin</option>
        </select>
      </div>

      <div id="sb-results" class="sb-results">
        <div class="sb-empty-state">Select a dose to calculate.</div>
      </div>
      <p class="sb-calc-safety">Research use only. Use sterile technique.</p>
    </div>`

  function sbRecalculate() {
    const vialRaw  = (container.querySelector('#sb-vial')    || {}).value || ''
    const waterRaw = (container.querySelector('#sb-water')   || {}).value || ''
    const doseRaw  = (container.querySelector('#sb-dose')    || {}).value || ''
    const syringe  = (container.querySelector('#sb-syringe') || {}).value || 'U-100'
    const resultsEl = container.querySelector('#sb-results')
    if (!resultsEl) return

    if (!doseRaw.trim()) {
      resultsEl.innerHTML = '<div class="sb-empty-state">Select a dose to calculate.</div>'
      return
    }

    const vialMg  = parseMg(vialRaw.trim()  + ' mg')
    const waterMl = parseMl(waterRaw.trim() + ' ml')
    const doseMg  = parseMg(doseRaw.trim()  + ' mcg')

    const { valid, errors } = validateInputs({ vialMg, waterMl, doseMg, syringeType: syringe })
    if (!valid) {
      resultsEl.innerHTML = `<div class="sb-error">${escHtml(errors[0])}</div>`
      return
    }

    const { conc, vol, roundedUnits, capWarn, roundWarn } = runCalculation({ vialMg, waterMl, doseMg, syringeType: syringe })
    const doseDisplay = formatMgDisplay(doseMg)

    let html = `
      <div class="sb-draw-hero">
        <p class="sb-draw-eyebrow">Draw to</p>
        <div class="sb-draw-value">${roundedUnits}<span class="sb-draw-unit"> units</span></div>
        <p class="sb-draw-sub">${escHtml(doseDisplay)} per injection</p>
      </div>
      <p class="sb-draw-detail">${fmtVolMl(vol)} mL &nbsp;·&nbsp; ${fmtConcentration(conc)}</p>`

    if (capWarn) {
      html += `<p class="sb-warn">Volume exceeds syringe capacity — try adding less BAC water.</p>`
    }
    if (roundWarn) {
      html += `<p class="sb-warn">Dose rounds to 0 units — try less BAC water.</p>`
    }

    resultsEl.innerHTML = html
  }

  if (hasNormal) {
    const normalBtn = container.querySelector('[data-preset="normal"]')
    if (normalBtn) normalBtn.classList.add('sb-preset-pill--active')
  }
  sbRecalculate()

  container.querySelectorAll('.sb-calc-input').forEach(el => {
    el.addEventListener('change', sbRecalculate)
  })

  container.querySelectorAll('.sb-preset-pill:not(.sb-preset-pill--unavailable)').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.preset
      const p   = presets && presets.dosePresets && presets.dosePresets[key]
      if (!p) return
      const vialEl  = container.querySelector('#sb-vial')
      const waterEl = container.querySelector('#sb-water')
      const doseEl  = container.querySelector('#sb-dose')
      if (vialEl  && p.vialMg)   vialEl.value  = p.vialMg
      if (waterEl && p.waterMl)  waterEl.value = p.waterMl
      if (doseEl  && p.valueMcg) doseEl.value  = p.valueMcg
      container.querySelectorAll('.sb-preset-pill').forEach(b => b.classList.remove('sb-preset-pill--active'))
      btn.classList.add('sb-preset-pill--active')
      sbRecalculate()
    })
  })
}

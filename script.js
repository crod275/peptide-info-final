// ── SUPABASE CLIENT ───────────────────────────────────────────────────────────
const _supabase = window.supabase.createClient(
  'https://kjvkntwyzxqqazsfcafn.supabase.co',
  'sb_publishable_eLi7yz1OksG-tdkiyFzePA_BBFIZFAg'
)

let _currentUser    = null
let _userFavorites  = new Set() // 'peptide:bpc-157', 'blend:glow', 'stack:tb-500-bpc-157'
let _detailPageInfo = null      // { type, slug, name } — set by detail render fns for late-auth tracking

// ── HARDCODED DATA (popular sections + blends/stacks) ──────────────────────

const peptides = [
  { id: 'bpc-157',          name: 'BPC-157',            desc: 'Accelerates healing of tendons, ligaments, and gut tissue.',               category: 'Healing',          popular: true  },
  { id: 'tb-500',           name: 'TB-500',             desc: 'Promotes systemic tissue repair and reduces inflammation.',                  category: 'Healing',          popular: true  },
  { id: 'thymosin-alpha-1', name: 'Thymosin Alpha-1',   desc: 'Immunomodulatory peptide that enhances T-cell and NK-cell function.',       category: 'Healing',          popular: false },
  { id: 'ipamorelin',       name: 'Ipamorelin',         desc: 'Selective growth hormone secretagogue with minimal side effects.',          category: 'Muscle Growth',    popular: false },
  { id: 'cjc-1295',         name: 'CJC-1295',           desc: 'GHRH analogue that extends growth hormone pulse duration.',                category: 'Muscle Growth',    popular: true  },
  { id: 'igf-1-lr3',        name: 'IGF-1 LR3',          desc: 'Long-acting IGF-1 variant promoting muscle cell growth.',                  category: 'Muscle Growth',    popular: false },
  { id: 'sermorelin',       name: 'Sermorelin',         desc: 'Stimulates natural GH release; used in anti-aging protocols.',             category: 'Muscle Growth',    popular: false },
  { id: 'hexarelin',        name: 'Hexarelin',          desc: 'Potent GH secretagogue with additional cardioprotective effects.',         category: 'Muscle Growth',    popular: false },
  { id: 'aod-9604',         name: 'AOD-9604',           desc: 'HGH fragment targeting fat metabolism without affecting IGF-1.',           category: 'Fat Loss',         popular: false },
  { id: 'frag-176-191',     name: 'Fragment 176-191',   desc: 'Isolated HGH fragment that stimulates lipolysis in fat cells.',            category: 'Fat Loss',         popular: false },
  { id: 'ghk-cu',           name: 'GHK-Cu',             desc: 'Copper peptide supporting skin regeneration and collagen synthesis.',      category: 'Anti-Aging',       popular: true  },
  { id: 'epitalon',         name: 'Epitalon',           desc: 'Activates telomerase to support cellular longevity.',                      category: 'Anti-Aging',       popular: false },
  { id: 'semax',            name: 'Semax',              desc: 'Nootropic peptide enhancing BDNF and cognitive function.',                 category: 'Cognitive',        popular: false },
  { id: 'selank',           name: 'Selank',             desc: 'Anxiolytic peptide derived from tuftsin; reduces stress without sedation.', category: 'Cognitive',       popular: false },
  { id: 'dihexa',           name: 'Dihexa',             desc: 'Highly potent cognitive enhancer; promotes synaptogenesis.',              category: 'Cognitive',        popular: false },
  { id: 'dsip',             name: 'DSIP',               desc: 'Delta sleep-inducing peptide; supports deep sleep cycles.',                category: 'Sleep & Recovery', popular: false },
  { id: 'epithalon',        name: 'Epithalon',          desc: 'Supports circadian rhythm regulation and melatonin production.',          category: 'Sleep & Recovery', popular: false },
  { id: 'semaglutide',      name: 'Semaglutide',        desc: 'GLP-1 receptor agonist studied for metabolic regulation and appetite control.', category: 'Fat Loss',      popular: true  },
  { id: 'retatrutide',      name: 'Retatrutide',        desc: 'Triple GLP-1/GIP/glucagon receptor agonist studied for significant weight reduction.', category: 'Fat Loss',    popular: false },
  { id: 'tirzepatide',      name: 'Tirzepatide',        desc: 'Dual GIP/GLP-1 receptor agonist studied for weight management and metabolic health.',   category: 'Fat Loss',      popular: false },
  { id: 'mots-c',           name: 'MOTS-C',             desc: 'Mitochondria-derived peptide supporting metabolic health and cellular longevity.',       category: 'Anti-Aging',   popular: false },
  { id: 'tesamorelin',      name: 'Tesamorelin',        desc: 'GHRH analogue that stimulates growth hormone production for body composition.',          category: 'Muscle Growth', popular: false },
  { id: 'pt-141',           name: 'PT-141',             desc: 'Melanocortin receptor agonist used for sexual dysfunction.',               category: 'Hormonal',         popular: false },
  { id: 'melanotan-ii',     name: 'Melanotan II',       desc: 'Stimulates melanin production and affects libido.',                       category: 'Hormonal',         popular: false },
  { id: 'kisspeptin-10',    name: 'Kisspeptin-10',      desc: 'Regulates GnRH release; studied for hormonal and reproductive health.',   category: 'Hormonal',         popular: false },
]

const blends = [
  { id: 'blend-aod-cjc-ipa',  name: 'AOD-9604 + CJC-1295 + Ipamorelin', desc: 'Fat metabolism paired with amplified GH release for lean body recomposition.', category: 'Fat Loss'      },
  { id: 'blend-cagrili-sema', name: 'Cagrilintide + Semaglutide',         desc: 'Dual GLP-1 and amylin receptor activation for appetite and weight management.',  category: 'Fat Loss'      },
  { id: 'blend-cjc-ghrp2',    name: 'CJC-1295 + GHRP-2',                 desc: 'Synergistic GHRH and ghrelin receptor activation for strong GH pulses.',         category: 'Muscle Growth' },
  { id: 'blend-glow',         name: 'Glow Blend',                         desc: 'Skin regeneration, collagen support, and anti-aging peptide combination.',       category: 'Anti-Aging'   },
  { id: 'blend-neuroxelin',   name: 'Neuroxelin',                         desc: 'Multi-peptide cognitive enhancement and neuroprotection blend.',                 category: 'Cognitive'    },
  { id: 'blend-tri-heal',     name: 'Tri-Heal',                           desc: 'Three-peptide healing formula targeting tissue, gut, and systemic recovery.',    category: 'Healing'      },
]

const stacks = [
  { id: 'stack-bpc-tb500',      name: 'BPC-157 + TB-500',           desc: 'Comprehensive tissue repair and systemic healing support.',               category: 'Healing'          },
  { id: 'stack-cjc-ipa',        name: 'CJC-1295 + Ipamorelin',      desc: 'Synergistic GH release for muscle growth and recovery.',                  category: 'Muscle Growth'    },
  { id: 'stack-pt141-mt2',      name: 'PT-141 + Melanotan II',      desc: 'Dual melanocortin activation for hormonal support.',                      category: 'Hormonal'         },
  { id: 'stack-aod-frag',       name: 'AOD-9604 + Fragment 176-191',desc: 'Targeted fat metabolism through complementary HGH fragment pathways.',    category: 'Fat Loss'         },
  { id: 'stack-ghkcu-epitalon', name: 'GHK-Cu + Epitalon',          desc: 'Skin regeneration and cellular longevity combined.',                      category: 'Anti-Aging'       },
  { id: 'stack-semax-selank',   name: 'Semax + Selank',             desc: 'Cognitive enhancement balanced with anxiolytic support.',                  category: 'Cognitive'        },
]

const categoryTagClass = {
  'Fat Loss':         'tag-fat-loss',
  'Weight Loss':      'tag-fat-loss',
  'Healing':          'tag-healing',
  'Muscle Growth':    'tag-muscle-growth',
  'Cognitive':        'tag-cognitive',
  'Anti-Aging':       'tag-anti-aging',
  'Sleep & Recovery': 'tag-sleep',
  'Hormonal':         'tag-hormonal',
  'Research':         'tag-research',
}

const PEPTIDE_CATEGORIES = ['Fat Loss', 'Healing', 'Muscle Growth', 'Cognitive', 'Anti-Aging', 'Sleep & Recovery', 'Hormonal']
const BLEND_CATEGORIES   = ['Fat Loss', 'Muscle Growth', 'Healing', 'Cognitive', 'Anti-Aging']
const STACK_CATEGORIES   = ['Fat Loss', 'Healing', 'Muscle Growth', 'Cognitive', 'Anti-Aging', 'Sleep & Recovery', 'Hormonal']

const combinationCategories = {
  'BPC-157 + TB-500':                  'Healing',
  'Cagrilintide + Semaglutide':        'Fat Loss',
  'CJC-1295 NO DAC + Ipamorelin':      'Muscle Growth',
  'GLOW':                              'Anti-Aging',
  'AOD-9604 + CJC-1295 + Ipamorelin': 'Fat Loss',
  'CJC-1295 + GHRP-2':                'Muscle Growth',
  'KLOW':                              'Anti-Aging',
  'Neuroxelin':                        'Cognitive',
  'Tesamorelin 5mg + Ipamorelin 5mg':  'Muscle Growth',
  'Tri-Heal':                          'Healing',
  'CJC-1295 DAC + Ipamorelin':         'Muscle Growth',
  'PT-141 + Melanotan II':             'Hormonal',
  'TB-500 + BPC-157':                  'Healing',
}

const singlePeptideCategories = {
  // Fat Loss
  '5-Amino-1MQ':      'Fat Loss',
  'Adipotide':        'Fat Loss',
  'AICAR':            'Fat Loss',
  'AOD-9604':         'Fat Loss',
  'Cagrilintide':     'Fat Loss',
  'Fragment 176-191': 'Fat Loss',
  'L-Carnitine':      'Fat Loss',
  'Mazdutide':        'Fat Loss',
  'Retatrutide':      'Fat Loss',
  'Semaglutide':      'Fat Loss',
  'Survodutide':      'Fat Loss',
  'Tirzepatide':      'Fat Loss',
  // Muscle Growth
  'CJC-1295 DAC':     'Muscle Growth',
  'CJC-1295 NO DAC':  'Muscle Growth',
  'GHRP-2':           'Muscle Growth',
  'GHRP-6':           'Muscle Growth',
  'Hexarelin':        'Muscle Growth',
  'IGF-1 LR3':        'Muscle Growth',
  'Ipamorelin':       'Muscle Growth',
  'MGF':              'Muscle Growth',
  'PEG-MGF':          'Muscle Growth',
  'Sermorelin':       'Muscle Growth',
  'SLU-PP-332':       'Muscle Growth',
  'Tesamorelin':      'Muscle Growth',
  // Healing
  'Ara-290':          'Healing',
  'BPC-157':          'Healing',
  'KPV':              'Healing',
  'LL-37':            'Healing',
  'TB-500':           'Healing',
  'Thymosin Alpha-1': 'Healing',
  // Cognitive
  'Adamax':           'Cognitive',
  'Cerebrolysin':     'Cognitive',
  'Dihexa':           'Cognitive',
  'PE-22-28':         'Cognitive',
  'Selank':           'Cognitive',
  'Semax':            'Cognitive',
  // Anti-Aging
  'Cartalax':         'Anti-Aging',
  'Chonluten':        'Anti-Aging',
  'Cortagen':         'Anti-Aging',
  'Epithalon':        'Anti-Aging',
  'Epitalon':         'Anti-Aging',
  'FOXO4-DRI':        'Anti-Aging',
  'GHK-Cu':           'Anti-Aging',
  'Glutathione':      'Anti-Aging',
  'Livagen':          'Anti-Aging',
  'MOTS-C':           'Anti-Aging',
  'NAD':              'Anti-Aging',
  'Ovagen':           'Anti-Aging',
  'Pinealon':         'Anti-Aging',
  'PNC-27':           'Anti-Aging',
  'Prostamax':        'Anti-Aging',
  'SNAP-8':           'Anti-Aging',
  'SS-31':            'Anti-Aging',
  'Testagen':         'Anti-Aging',
  'Vilon':            'Anti-Aging',
  // Sleep & Recovery
  'DSIP':             'Sleep & Recovery',
  'Oxytocin':         'Sleep & Recovery',
  // Hormonal
  'Gonadorelin':      'Hormonal',
  'HCG':              'Hormonal',
  'Kisspeptin-10':    'Hormonal',
  'Melanotan II':     'Hormonal',
  'PT-141':           'Hormonal',
}

// ── STATE ────────────────────────────────────────────────────────────────────

let peptideData       = null
let jsonPeptides      = []
let peptideByRouteSlug = new Map()
let slugToRouteSlug    = new Map()
let activeCategory    = 'All'
let searchQuery       = ''

let blendData         = null
let jsonBlends        = []
let blendByRouteSlug  = new Map()

let stackData         = null
let jsonStacks        = []
let stackByRouteSlug  = new Map()

let searchIndex = []

const SEARCH_SYNONYMS = {
  'healing':       ['recovery', 'repair', 'tissuerepair', 'woundhealing', 'injuryrecovery', 'softtissue'],
  'recovery':      ['healing', 'repair', 'musclerecovery', 'soreness', 'postworkout', 'injury'],
  'fat loss':      ['weightloss', 'metabolism', 'cutting', 'bodycomposition', 'lipolysis', 'adipose', 'nnmt'],
  'weight loss':   ['fatloss', 'metabolism', 'lipolysis', 'bodycomposition', 'appetite', 'satiety'],
  'sleep':         ['insomnia', 'circadian', 'deepsleep', 'melatonin', 'pineal'],
  'skin':          ['collagen', 'antiaging', 'wrinkles', 'elasticity', 'skinrepair', 'wound'],
  'anti aging':    ['longevity', 'collagen', 'skin', 'wrinkles', 'telomere', 'epigenetic', 'senescent'],
  'antiaging':     ['longevity', 'collagen', 'skin', 'wrinkles', 'telomere'],
  'muscle':        ['hypertrophy', 'anabolic', 'growthhormone', 'ghrh', 'igf', 'ghrelin'],
  'muscle growth': ['hypertrophy', 'anabolic', 'growthhormone', 'secretagogue'],
  'brain':         ['cognitive', 'neuroprotection', 'focus', 'memory', 'nootropic', 'bdnf'],
  'focus':         ['cognitive', 'brain', 'memory', 'mentalclarity', 'nootropic'],
  'gut':           ['digestion', 'intestinal', 'stomach', 'guthealth', 'mucosal'],
  'gut health':    ['digestion', 'intestinal', 'stomach', 'mucosal', 'gi'],
  'inflammation':  ['pain', 'swelling', 'joint', 'inflammatory', 'immune'],
  'libido':        ['sexualhealth', 'hormonal', 'melanocortin', 'testosterone', 'reproductive'],
  'hair':          ['hairgrowth', 'follicles', 'regrowth', 'hairloss', 'alopecia'],
  'hair growth':   ['follicles', 'regrowth', 'hairloss', 'alopecia'],
  'energy':        ['fatigue', 'stamina', 'endurance', 'performance', 'nad'],
  'joint pain':    ['joints', 'pain', 'inflammation', 'cartilage', 'injury'],
  'injury':        ['healing', 'repair', 'recovery', 'tissue', 'wound', 'pain'],
}

// ── DATA HELPERS ─────────────────────────────────────────────────────────────

function getPeptideRouteSlug(p) {
  return (p.slug + '-' + p.vial_strength)
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
}

function getBlendRouteSlug(blend) {
  return (blend.slug + '-' + blend.vial_strength)
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
}

function getStackRouteSlug(stack) {
  return (stack.slug + '-' + stack.vial_strength)
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/\+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
}

function deriveCategory(tags) {
  const all = (tags || []).join(' ').toLowerCase()
  if (/melanocortin|gnrh|testosterone|gonadal|reproductive|sexual|libido/.test(all))          return 'Hormonal'
  if (/growth hormone|ghrh|ghrelin|igf|secretagogue|anabolic|hgh/.test(all))                  return 'Muscle Growth'
  if (/cogn|bdnf|neuroprot|nootropic|neuroplastic|brain|memory/.test(all))                    return 'Cognitive'
  if (/collagen|skin|longevity|telomere|epigenetic|senesc/.test(all))                          return 'Anti-Aging'
  if (/immune|thymic|thymosin|healing|repair|wound|inflammation|tissue|gut/.test(all))         return 'Healing'
  if (/\bfat\b|weight.loss|adipos|lipolysis|obesity|satiety|appetite|\bnnmt\b|\bnad\b/.test(all)) return 'Fat Loss'
  if (/sleep|circadian|melatonin|pineal/.test(all))                                            return 'Sleep & Recovery'
  return 'Research'
}

function truncate(str, n) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

function normalizeSearchText(str) {
  return (str || '').toLowerCase().replace(/[\s\-_+]+/g, '').trim()
}

function scoreSearchItem(item, qNorm, synTerms) {
  if (!qNorm) return 0
  let score = 0
  const n     = item.norm.name
  const tags  = item.norm.tags
  const comps = item.norm.components

  // Name match — track whether/how the name matched
  let nameHit = 0 // 0=none, 1=contains, 2=startsWith, 3=exact
  if (n === qNorm)              { score += 100; nameHit = 3 }
  else if (n.startsWith(qNorm)) { score += 90;  nameHit = 2 }
  else if (n.includes(qNorm))   { score += 70;  nameHit = 1 }

  // Slug: only when name didn't match (slug is derived from name; adding it when
  // name already matched inflates blend/stack scores vs. the exact peptide page)
  if (nameHit === 0 && item.norm.slug && item.norm.slug.includes(qNorm)) score += 50

  if (item.norm.category && item.norm.category.includes(qNorm)) score += 40

  for (const t of tags) {
    if (t === qNorm)       { score += 65; break }
    if (t.includes(qNorm)) { score += 48; break }
  }

  // Component names: only when name didn't match at all, so a blend whose name
  // already starts with the query (e.g. "BPC-157 + TB-500") doesn't outscore
  // the single peptide page via a redundant component hit
  if (nameHit === 0) {
    for (const c of comps) {
      if (c === qNorm || c.includes(qNorm)) { score += 55; break }
    }
  }

  // Benefits/desc/overview: only when name didn't already match (avoids a blend's
  // benefits text mentioning a component name inflating its score above the actual page)
  if (nameHit === 0) {
    if (item.norm.benefits && item.norm.benefits.includes(qNorm)) score += 35
    if (item.norm.desc     && item.norm.desc.includes(qNorm))     score += 25
    if (item.norm.whatIsIt && item.norm.whatIsIt.includes(qNorm)) score += 15
  }

  for (const syn of synTerms) {
    for (const t of tags)  { if (t.includes(syn)) { score += 22; break } }
    for (const c of comps) { if (c.includes(syn)) { score += 18; break } }
    if (item.norm.category && item.norm.category.includes(syn)) score += 30
    if (item.norm.benefits && item.norm.benefits.includes(syn)) score += 14
    if (item.norm.desc     && item.norm.desc.includes(syn))     score += 9
    if (n.includes(syn))                                         score += 18
  }

  return score
}

const GUIDES_MANIFEST = [
  { slug: 'beginners-guide', title: "Beginner's Guide to Peptides",
    tags: ['introduction', 'education', 'gettingstarted', 'basics', 'beginner'] },
  { slug: 'reconstitution', title: 'How to Reconstitute Peptides',
    tags: ['reconstitution', 'preparation', 'bacteriostaticwater', 'vial', 'dosing', 'mixing'] },
  { slug: 'syringe-guide', title: 'Syringe & Measurement Guide',
    tags: ['syringe', 'injection', 'measurement', 'dosecalculation', 'administration', 'units'] },
]

function buildSearchIndex() {
  searchIndex = []

  for (const p of jsonPeptides) {
    const raw = peptideData?.peptides?.find(r => r.base_name === p.name)
    const benefitsText = (raw?.overview?.main_benefits?.items || [])
      .map(i => `${i.title || ''} ${i.description || ''}`).join(' ')
    const whatIsItText = raw?.overview?.what_is_it?.body || ''

    searchIndex.push({
      type: 'peptide',
      name: p.name,
      href: `peptide.html?slug=${p.routeSlug}`,
      badge: 'Peptide',
      norm: {
        name:       normalizeSearchText(p.name),
        slug:       normalizeSearchText(p.slug || ''),
        tags:       (p.themes || []).map(normalizeSearchText),
        category:   normalizeSearchText(p.category || ''),
        desc:       normalizeSearchText(p.desc || ''),
        benefits:   normalizeSearchText(benefitsText),
        whatIsIt:   normalizeSearchText(whatIsItText),
        components: [],
      }
    })
  }

  for (const b of jsonBlends) {
    const name = b.base_name || b.name || ''
    const benefitsText = (b.overview?.main_benefits?.items || [])
      .map(i => `${i.title || ''} ${i.description || ''}`).join(' ')
    // For blends, both root tags and hero.tags are component peptide names —
    // put them all in components (not tags) so name-based queries don't inflate scores
    const blendComponents = [...new Set([...(b.tags || []), ...(b.hero?.tags || [])])].map(normalizeSearchText)

    searchIndex.push({
      type: 'blend',
      name,
      href: `blend.html?slug=${getBlendRouteSlug(b)}`,
      badge: 'Blend',
      norm: {
        name:       normalizeSearchText(name),
        slug:       normalizeSearchText(b.slug || ''),
        tags:       [],
        category:   '',
        desc:       normalizeSearchText(b.hero?.subtitle || ''),
        benefits:   normalizeSearchText(benefitsText),
        whatIsIt:   '',
        components: blendComponents,
      }
    })
  }

  for (const s of jsonStacks) {
    const name = s.base_name || s.name || ''
    const benefitsText = (s.overview?.main_benefits?.items || [])
      .map(i => `${i.title || ''} ${i.description || ''}`).join(' ')
    // Same treatment for stacks: component names in components, not tags
    const stackComponents = [...new Set([...(s.tags || []), ...(s.hero?.tags || [])])].map(normalizeSearchText)

    searchIndex.push({
      type: 'stack',
      name,
      href: `stack.html?slug=${getStackRouteSlug(s)}`,
      badge: 'Stack',
      norm: {
        name:       normalizeSearchText(name),
        slug:       normalizeSearchText(s.slug || ''),
        tags:       [],
        category:   '',
        desc:       normalizeSearchText(s.hero?.subtitle || ''),
        benefits:   normalizeSearchText(benefitsText),
        whatIsIt:   '',
        components: stackComponents,
      }
    })
  }

  for (const g of GUIDES_MANIFEST) {
    searchIndex.push({
      type: 'guide',
      name: g.title,
      href: `guides.html?guide=${g.slug}`,
      badge: 'Guide',
      norm: {
        name:       normalizeSearchText(g.title),
        slug:       normalizeSearchText(g.slug),
        tags:       g.tags,
        category:   'guide',
        desc:       '',
        benefits:   '',
        whatIsIt:   '',
        components: [],
      }
    })
  }
}

async function loadPeptideData() {
  try {
    const res = await fetch('peptide_frontend_library_v2.json')
    peptideData = await res.json()

    // Build routeSlug lookup maps
    peptideByRouteSlug = new Map()
    slugToRouteSlug    = new Map()
    for (const p of peptideData.peptides) {
      const rs = getPeptideRouteSlug(p)
      peptideByRouteSlug.set(rs, p)
      if (!slugToRouteSlug.has(p.slug)) {
        slugToRouteSlug.set(p.slug, rs)
      }
    }

    // Deduplicate by base_name for index listing
    const seen = new Map()
    for (const p of peptideData.peptides) {
      if (!seen.has(p.base_name)) {
        seen.set(p.base_name, {
          routeSlug:     getPeptideRouteSlug(p),
          slug:          p.slug,
          name:          p.base_name,
          desc:          p.hero?.subtitle || '',
          category:      singlePeptideCategories[p.base_name] || deriveCategory(p.hero?.tags),
          themes:        p.hero?.tags || [],
          vialStrength:  p.vial_strength,
          evidenceLevel: p.hero?.evidence_level || '',
        })
      }
    }
    jsonPeptides = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name))

    // Expose raw peptide data for calculator.js data-sharing bridge
    window.__calcData = Object.assign(window.__calcData || {}, { peptides: peptideData.peptides || [] })

    if (document.getElementById('filter-pills')) {
      render()
      initFeatured() // Re-render with resolved route slugs
    }

    if (document.getElementById('pep-content')) {
      renderPeptidePage()
    }

    if (document.getElementById('peptide-library')) {
      renderPeptideLibrary()
    }

    renderSiteStats()
    buildSearchIndex()
    refreshRelatedResearchPanel()
    populatePeptidesDropdown()
  } catch (e) {
    console.error('Failed to load peptide data:', e)
  }
}

async function loadBlendData() {
  try {
    const res = await fetch('peptide_blends_frontend_library.json')
    blendData = await res.json()

    const blendsArr = Array.isArray(blendData) ? blendData : (blendData.peptides || [])

    blendByRouteSlug = new Map()
    for (const b of blendsArr) {
      blendByRouteSlug.set(getBlendRouteSlug(b), b)
    }
    jsonBlends = blendsArr

    // Expose raw blend data for calculator.js data-sharing bridge
    window.__calcData = Object.assign(window.__calcData || {}, { blends: blendsArr || [] })

    if (document.getElementById('blends-scroll')) {
      initBlendsFeatured()
    }

    if (document.getElementById('results-blends')) {
      render()
    }

    if (document.getElementById('blend-content')) {
      renderBlendPage()
    }

    if (document.getElementById('blend-library')) {
      renderBlendLibrary()
    }

    renderSiteStats()
    buildSearchIndex()
    refreshRelatedResearchPanel()
    populatePeptidesDropdown()
  } catch (e) {
    console.error('Failed to load blend data:', e)
  }
}

async function loadStackData() {
  try {
    const res = await fetch('peptide_stacks_frontend_library.json')
    stackData = await res.json()

    const stacksArr = stackData.peptides || []

    stackByRouteSlug = new Map()
    for (const s of stacksArr) {
      stackByRouteSlug.set(getStackRouteSlug(s), s)
    }
    jsonStacks = stacksArr

    if (document.getElementById('stacks-scroll')) {
      initStacksFeatured()
    }

    if (document.getElementById('stack-content')) {
      renderStackPage()
    }

    if (document.getElementById('stack-library')) {
      renderStackLibrary()
    }

    renderSiteStats()
    buildSearchIndex()
    refreshRelatedResearchPanel()
    populatePeptidesDropdown()
  } catch (e) {
    console.error('Failed to load stack data:', e)
  }
}

// ── SITE STATS ───────────────────────────────────────────────────────────────

function renderSiteStats() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val }
  if (jsonPeptides.length) set('stat-peptides', jsonPeptides.length)
  if (jsonStacks.length)   set('stat-stacks',   jsonStacks.length)
  if (jsonBlends.length)   set('stat-blends',   jsonBlends.length)
}

// ── SVG CONSTANTS ────────────────────────────────────────────────────────────

const CARD_ARROW_SVG = `<svg class="card-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
</svg>`

const VIAL_SVG = `<svg width="56" height="72" viewBox="0 0 56 72" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="18" y="1" width="20" height="7" rx="3.5" fill="var(--accent)" opacity="0.35"/>
  <path d="M16 8 H40 V18 Q40 20 38 20 H18 Q16 20 16 18 Z" fill="var(--accent)" opacity="0.2"/>
  <rect x="12" y="18" width="32" height="50" rx="7" fill="var(--accent-light)" stroke="var(--accent)" stroke-width="1.5" opacity="0.9"/>
  <rect x="12" y="46" width="32" height="22" fill="var(--accent)" opacity="0.10"/>
  <line x1="16" y1="40" x2="40" y2="40" stroke="var(--accent)" stroke-width="1" stroke-dasharray="3 3" opacity="0.4"/>
  <line x1="16" y1="33" x2="30" y2="33" stroke="var(--accent)" stroke-width="1" opacity="0.2"/>
</svg>`

const CHEVRON_SVG = `<svg class="accordion-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
</svg>`

const EXTERNAL_SVG = `<svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
  <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
</svg>`

const STACK_SVG = `<svg width="64" height="72" viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="1" width="16" height="6" rx="3" fill="var(--accent)" opacity="0.4"/>
  <path d="M2 7H22V16Q22 18 20 18H4Q2 18 2 16Z" fill="var(--accent)" opacity="0.18"/>
  <rect x="2" y="17" width="20" height="38" rx="5" fill="var(--accent-light)" stroke="var(--accent)" stroke-width="1.5" opacity="0.9"/>
  <rect x="2" y="38" width="20" height="17" fill="var(--accent)" opacity="0.12"/>
  <rect x="30" y="1" width="16" height="6" rx="3" fill="var(--accent)" opacity="0.4"/>
  <path d="M28 7H48V16Q48 18 46 18H30Q28 18 28 16Z" fill="var(--accent)" opacity="0.18"/>
  <rect x="28" y="17" width="20" height="38" rx="5" fill="var(--accent-light)" stroke="var(--accent)" stroke-width="1.5" opacity="0.9"/>
  <rect x="28" y="38" width="20" height="17" fill="var(--accent)" opacity="0.12"/>
  <circle cx="56" cy="30" r="7" fill="var(--accent-light)" stroke="var(--accent)" stroke-width="1.5" opacity="0.85"/>
  <path d="M52.5 30h7M56 26.5v7" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round"/>
</svg>`

// ── SUPPLY ICONS ─────────────────────────────────────────────────────────────

const SUPPLIER_LINKS = {
  syringe: {
    url: 'https://www.amazon.com/dp/B082MRS196?ref=cm_sw_r_cp_ud_dp_B6W6SM7GTP89ZYR8G882_1&ref_=cm_sw_r_cp_ud_dp_B6W6SM7GTP89ZYR8G882_1&social_share=cm_sw_r_cp_ud_dp_B6W6SM7GTP89ZYR8G882_1&_encoding=UTF8&psc=1&skipTwisterOG=1',
    label: 'Recommended sterile U-100 syringes'
  },
  swab: {
    url: 'https://www.amazon.com/dp/B00B3RLPOE?ref=cm_sw_r_cp_ud_dp_2002YN62404SKC74SBAW&ref_=cm_sw_r_cp_ud_dp_2002YN62404SKC74SBAW&social_share=cm_sw_r_cp_ud_dp_2002YN62404SKC74SBAW&_encoding=UTF8&skipTwisterOG=1&th=1',
    label: 'Recommended alcohol prep wipes'
  }
}

function getSupplierLink(name) {
  const n = (name || '').toLowerCase()
  if (/syringe|needle|insulin/.test(n)) return SUPPLIER_LINKS.syringe
  if (/swab|alcohol|wipe/.test(n)) return SUPPLIER_LINKS.swab
  return null
}

function getSupplyIcon(name) {
  const n = (name || '').toLowerCase()
  if (/syringe|needle|insulin/.test(n)) return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2l4 4-1.5 1.5-4-4L18 2z"/><path d="M15.5 4.5L19.5 8.5"/><path d="M13 7l4 4-8.5 8.5-1.5 1.5-3-3 1.5-1.5L13 7z"/><path d="M2 22l3.5-3.5"/></svg>`
  if (/water|bac|bacteriostatic/.test(n)) return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>`
  if (/swab|alcohol|wipe/.test(n)) return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 12h6m-3-3v6"/></svg>`
  if (/sharps|container|disposal|waste/.test(n)) return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`
  if (/vial|peptide|compound/.test(n)) return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M9 3v3L5 20a1 1 0 001 1h12a1 1 0 001-1L15 6V3M9 3h6"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>`
}

// ── HOMEPAGE CARD BUILDERS ───────────────────────────────────────────────────

function buildCard(p) {
  const routeSlug = slugToRouteSlug.get(p.id) || p.id
  const tagClass  = categoryTagClass[p.category] || 'tag-research'
  return `
    <a class="peptide-list-item" href="peptide.html?slug=${routeSlug}">
      <span class="peptide-list-name">${p.name}</span>
      <span class="item-list-tag ${tagClass}">${p.category}</span>
      <svg class="peptide-list-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
      </svg>
    </a>`
}

function buildJsonCard(p) {
  const tagClass = categoryTagClass[p.category] || 'tag-research'
  const evClass  = evidenceLevelClass(p.evidenceLevel)
  const evBadge  = p.evidenceLevel
    ? `<span class="ev-chip ${evClass}">${p.evidenceLevel}</span>`
    : ''
  return `
    <a class="card" href="peptide.html?slug=${p.routeSlug}">
      <div class="card-top">
        <span class="card-name">${p.name}</span>
        ${CARD_ARROW_SVG}
      </div>
      ${p.vialStrength ? `<span class="card-vial-strength">${p.vialStrength}</span>` : ''}
      <p class="card-desc">${truncate(p.desc, 110)}</p>
      <div class="card-tag-row">
        <span class="card-tag ${tagClass}">${p.category}</span>
        ${evBadge}
      </div>
    </a>`
}

function buildBlendJsonCard(b) {
  const category = combinationCategories[b.base_name] || deriveCategory(b.hero?.tags)
  const tagClass  = categoryTagClass[category] || 'tag-research'
  const slug      = getBlendRouteSlug(b)
  return `
    <a class="item-list-row" href="blend.html?slug=${slug}">
      <span class="item-list-name">${b.base_name || b.name}</span>
      <span class="item-list-tag ${tagClass}">${category}</span>
      <svg class="item-list-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
      </svg>
    </a>`
}

function buildBlendCard(b) {
  return `
    <a class="item-list-row" href="#${b.id}">
      <span class="item-list-name">${b.name}</span>
      <span class="item-list-meta">${b.category}</span>
      <svg class="item-list-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
      </svg>
    </a>`
}

function buildStackCard(s) {
  return `
    <a class="item-list-row" href="#${s.id}">
      <span class="item-list-name">${s.name}</span>
      <span class="item-list-meta">${s.category}</span>
      <svg class="item-list-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
      </svg>
    </a>`
}

function buildStackJsonCard(s) {
  const category = combinationCategories[s.base_name] || deriveCategory(s.hero?.tags)
  const tagClass  = categoryTagClass[category] || 'tag-research'
  const slug      = getStackRouteSlug(s)
  return `
    <a class="item-list-row" href="stack.html?slug=${slug}">
      <span class="item-list-name">${s.base_name || s.name}</span>
      <span class="item-list-tag ${tagClass}">${category}</span>
      <svg class="item-list-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
      </svg>
    </a>`
}

// Result cards for blend/stack in the filtered results grid (matches peptide .card style)
function buildBlendResultCard(b) {
  const category = combinationCategories[b.base_name] || deriveCategory(b.hero?.tags)
  const tagClass = categoryTagClass[category] || 'tag-research'
  const evLevel  = b.hero?.evidence_level || ''
  const evBadge  = evLevel ? `<span class="ev-chip ${evidenceLevelClass(evLevel)}">${evLevel}</span>` : ''
  return `
    <a class="card" href="blend.html?slug=${getBlendRouteSlug(b)}">
      <div class="card-top">
        <span class="card-name">${b.base_name || b.name}</span>
        ${CARD_ARROW_SVG}
      </div>
      ${b.vial_strength ? `<span class="card-vial-strength">${b.vial_strength}</span>` : ''}
      <p class="card-desc">${truncate(b.hero?.subtitle || '', 110)}</p>
      <div class="card-tag-row">
        <span class="card-tag ${tagClass}">${category}</span>
        ${evBadge}
      </div>
    </a>`
}

function buildStackResultCard(s) {
  const category = combinationCategories[s.base_name] || deriveCategory(s.hero?.tags)
  const tagClass = categoryTagClass[category] || 'tag-research'
  const evLevel  = s.hero?.evidence_level || ''
  const evBadge  = evLevel ? `<span class="ev-chip ${evidenceLevelClass(evLevel)}">${evLevel}</span>` : ''
  return `
    <a class="card" href="stack.html?slug=${getStackRouteSlug(s)}">
      <div class="card-top">
        <span class="card-name">${s.base_name || s.name}</span>
        ${CARD_ARROW_SVG}
      </div>
      ${s.vial_strength ? `<span class="card-vial-strength">${s.vial_strength}</span>` : ''}
      <p class="card-desc">${truncate(s.hero?.subtitle || '', 110)}</p>
      <div class="card-tag-row">
        <span class="card-tag ${tagClass}">${category}</span>
        ${evBadge}
      </div>
    </a>`
}

// ── DROPDOWN ─────────────────────────────────────────────────────────────────

// Dedupe combination (blend/stack) rows by base_name into lightweight {name, href} nav items
function dedupeCombinationNavItems(arr, routeSlugFn, detailPage) {
  const seen = new Set()
  const items = []
  for (const item of arr) {
    if (!item.base_name || seen.has(item.base_name)) continue
    seen.add(item.base_name)
    items.push({ name: item.base_name, href: `${detailPage}?slug=${routeSlugFn(item)}` })
  }
  return sortLibraryItems(items)
}

function dropdownColumn(label, libraryHref, items) {
  const list = items.length
    ? items.map(i => `<a class="dropdown-item" href="${i.href}">${i.name}</a>`).join('')
    : `<span class="dropdown-item-empty">Loading…</span>`
  return `
    <div class="dropdown-col">
      <div class="dropdown-col-head">
        <a class="dropdown-col-header" href="${libraryHref}">${label} →</a>
        <a class="dropdown-col-viewall" href="${libraryHref}">View all ${label.toLowerCase()}</a>
      </div>
      <div class="dropdown-scroll">${list}</div>
    </div>`
}

function populatePeptidesDropdown() {
  const menu = document.getElementById('peptides-dropdown-menu')
  if (!menu) return

  const singles = jsonPeptides.length
    ? sortLibraryItems(jsonPeptides.map(p => ({ name: p.name, href: `peptide.html?slug=${p.routeSlug}` })))
    : []
  const blends = jsonBlends.length ? dedupeCombinationNavItems(jsonBlends, getBlendRouteSlug, 'blend.html') : []
  const stacks = jsonStacks.length ? dedupeCombinationNavItems(jsonStacks, getStackRouteSlug, 'stack.html') : []

  menu.innerHTML = `
    <div class="dropdown-cols-layout">
      ${dropdownColumn('Singles', 'peptides-library.html', singles)}
      ${dropdownColumn('Blends', 'blends-library.html', blends)}
      ${dropdownColumn('Stacks', 'stacks-library.html', stacks)}
    </div>`
}

// ── LIBRARY HELPERS ──────────────────────────────────────────────────────────

function libSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function evClass(level) {
  if (!level) return 'ev-unknown'
  const l = level.toLowerCase()
  if (l.includes('human')) return 'ev-human'
  if (l.includes('mixed')) return 'ev-mixed'
  if (l.includes('pre')) return 'ev-preclinical'
  return 'ev-unknown'
}

function renderLibraryShell(categories) {
  return `
    <div class="lib-controls">
      <div class="lib-search-wrap">
        <svg class="lib-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
        <input class="lib-search-input" type="text" placeholder="Search…" aria-label="Search" autocomplete="off">
        <div class="search-dropdown lib-search-dropdown" role="listbox" hidden></div>
      </div>
      <div class="filter-pills lib-pills">
        <button class="pill active" data-cat="All">All</button>
        ${categories.map(c => `<button class="pill" data-cat="${c}">${c}</button>`).join('')}
      </div>
    </div>
    <div class="lib-results"></div>`
}

function sortLibraryItems(items) {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true })
  )
}

// items: [{ name, category, searchText, ...fields used by cardFn }]
function initLibraryInteractivity(container, items, itemType, cardFn, itemNoun) {
  const searchInput = container.querySelector('.lib-search-input')
  const dropEl      = container.querySelector('.lib-search-dropdown')
  const pills       = container.querySelectorAll('.lib-pills .pill')
  const resultsEl   = container.querySelector('.lib-results')

  let activeCat = 'All'
  let searchVal = ''

  function renderResults() {
    let list = activeCat === 'All' ? items : items.filter(i => i.category === activeCat)
    if (searchVal) list = list.filter(i => i.searchText.includes(searchVal))
    list = sortLibraryItems(list)

    if (!list.length) {
      resultsEl.innerHTML = `<div class="empty-state">No ${itemNoun}s found${searchVal ? ' for your search' : ' in this category'}.</div>`
      return
    }

    const grid = `<div class="peptide-grid lib-grid">${list.map(cardFn).join('')}</div>`

    if (activeCat === 'All') {
      resultsEl.innerHTML = grid
    } else {
      resultsEl.innerHTML = `
        <section class="lib-category" id="cat-${libSlug(activeCat)}" data-category="${activeCat}">
          <div class="lib-cat-header">
            <span class="lib-cat-label ${categoryTagClass[activeCat] || ''}">${activeCat}</span>
            <span class="lib-cat-count">${list.length} ${itemNoun}${list.length !== 1 ? 's' : ''}</span>
          </div>
          ${grid}
        </section>`
    }
  }

  function updateLibDropdown(q) {
    if (!dropEl) return
    if (!q || q.trim().length === 0) {
      dropEl.hidden = true
      return
    }

    const qNorm    = normalizeSearchText(q)
    const qKey     = q.toLowerCase().trim()
    const synTerms = SEARCH_SYNONYMS[qKey] || SEARCH_SYNONYMS[qNorm] || []

    const scored = searchIndex
      .filter(item => item.type === itemType)
      .map(item => ({ item, score: scoreSearchItem(item, qNorm, synTerms) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)

    if (scored.length === 0) {
      dropEl.innerHTML = `<div class="search-dropdown-empty">No results found</div>`
      dropEl.hidden = false
      return
    }

    dropEl.innerHTML = scored.slice(0, 10).map(({ item }) =>
      `<a class="search-dropdown-item" href="${item.href}" role="option">
        <span class="search-dropdown-name">${item.name}</span>
        <span class="search-dropdown-badge">${item.badge}</span>
      </a>`
    ).join('')

    dropEl.hidden = false
  }

  function closeLibDropdown() {
    if (dropEl) dropEl.hidden = true
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'))
      pill.classList.add('active')
      activeCat = pill.dataset.cat
      renderResults()
    })
  })

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchVal = searchInput.value.toLowerCase().trim()
      renderResults()
      updateLibDropdown(searchInput.value)
    })

    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeLibDropdown()
        searchInput.blur()
      } else if (e.key === 'ArrowDown' && dropEl && !dropEl.hidden) {
        e.preventDefault()
        const first = dropEl.querySelector('.search-dropdown-item')
        if (first) first.focus()
      }
    })

    document.addEventListener('click', e => {
      if (!dropEl || dropEl.hidden) return
      if (!dropEl.contains(e.target) && e.target !== searchInput) {
        closeLibDropdown()
      }
    })
  }

  renderResults()
}

// ── LIBRARY RENDER FUNCTIONS ──────────────────────────────────────────────────

function peptideLibCard(p) {
  return `
    <a class="card lib-card" href="peptide.html?slug=${p.routeSlug}">
      <div class="card-top">
        <span class="card-name">${p.name}</span>
        <svg class="card-arrow" fill="none" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M7 5l5 5-5 5"/></svg>
      </div>
      <p class="card-desc">${p.desc || ''}</p>
      <div class="lib-card-footer">
        <span class="card-tag ${categoryTagClass[p.category] || 'tag-research'}">${p.category}</span>
        ${p.evidenceLevel ? `<span class="ev-chip ${evClass(p.evidenceLevel)}">${p.evidenceLevel}</span>` : ''}
        <span class="lib-view-btn">View Research</span>
      </div>
    </a>`
}

function renderPeptideLibrary() {
  const container = document.getElementById('peptide-library')
  if (!container || !jsonPeptides.length) return

  const items = jsonPeptides.map(p => ({
    ...p,
    searchText: [p.name, p.desc, p.category, p.evidenceLevel].join(' ').toLowerCase(),
  }))

  container.className = 'lib-content'
  container.innerHTML = renderLibraryShell(PEPTIDE_CATEGORIES)
  initLibraryInteractivity(container, items, 'peptide', peptideLibCard, 'peptide')
}

function blendLibCard(b) {
  return `
    <a class="card lib-card" href="${b.href}">
      <div class="card-top">
        <span class="card-name">${b.name}</span>
        <svg class="card-arrow" fill="none" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M7 5l5 5-5 5"/></svg>
      </div>
      ${b.tagsLine ? `<p class="lib-components">${b.tagsLine}</p>` : ''}
      <p class="card-desc">${b.subtitle}</p>
      <div class="lib-card-footer">
        <span class="card-tag ${categoryTagClass[b.category] || 'tag-research'}">${b.category}</span>
        <span class="lib-view-btn">View Blend</span>
      </div>
    </a>`
}

function renderBlendLibrary() {
  const container = document.getElementById('blend-library')
  if (!container || !jsonBlends.length) return

  const seen = new Set()
  const items = []
  for (const b of jsonBlends) {
    if (seen.has(b.base_name)) continue
    seen.add(b.base_name)
    const category = combinationCategories[b.base_name] || deriveCategory(b.hero?.tags) || 'Research'
    const tagsLine = b.hero?.tags?.length ? b.hero.tags.join(' · ') : ''
    const subtitle = b.hero?.subtitle || ''
    items.push({
      name: b.base_name,
      category,
      href: `blend.html?slug=${getBlendRouteSlug(b)}`,
      tagsLine,
      subtitle,
      searchText: [b.base_name, subtitle, category, tagsLine].join(' ').toLowerCase(),
    })
  }

  container.className = 'lib-content'
  container.innerHTML = renderLibraryShell(BLEND_CATEGORIES)
  initLibraryInteractivity(container, items, 'blend', blendLibCard, 'blend')
}

function stackLibCard(s) {
  return `
    <a class="card lib-card" href="${s.href}">
      <div class="card-top">
        <span class="card-name">${s.name}</span>
        <svg class="card-arrow" fill="none" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M7 5l5 5-5 5"/></svg>
      </div>
      ${s.componentsLine ? `<p class="lib-components">${s.componentsLine}</p>` : ''}
      <p class="card-desc">${s.subtitle}</p>
      <div class="lib-card-footer">
        <span class="card-tag ${categoryTagClass[s.category] || 'tag-research'}">${s.category}</span>
        <span class="lib-view-btn">View Stack</span>
      </div>
    </a>`
}

function renderStackLibrary() {
  const container = document.getElementById('stack-library')
  if (!container || !jsonStacks.length) return

  const seen = new Set()
  const items = []
  for (const s of jsonStacks) {
    if (seen.has(s.base_name)) continue
    seen.add(s.base_name)
    const category = combinationCategories[s.base_name] || deriveCategory(s.hero?.tags) || 'Research'
    const componentsLine = s.stack_details?.components?.map(c => c.name).join(' · ') || s.hero?.tags?.join(' · ') || ''
    const subtitle = s.hero?.subtitle || ''
    items.push({
      name: s.base_name,
      category,
      href: `stack.html?slug=${getStackRouteSlug(s)}`,
      componentsLine,
      subtitle,
      searchText: [s.base_name, subtitle, category, componentsLine].join(' ').toLowerCase(),
    })
  }

  container.className = 'lib-content'
  container.innerHTML = renderLibraryShell(STACK_CATEGORIES)
  initLibraryInteractivity(container, items, 'stack', stackLibCard, 'stack')
}

// ── HOMEPAGE INIT ─────────────────────────────────────────────────────────────

// Universal scroll-reveal: adds .will-reveal + stagger, fires .is-visible on intersection
function initRevealObserver(els, staggerMs) {
  staggerMs = staggerMs === undefined ? 70 : staggerMs
  const items = Array.from(els)
  if (!items.length) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(el => { el.classList.remove('will-reveal'); el.classList.add('is-visible') })
    return
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target
        setTimeout(() => el.classList.add('is-visible'), parseInt(el.dataset.revealDelay || '0', 10))
        observer.unobserve(el)
      }
    })
  }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' })

  items.forEach((el, i) => {
    el.classList.add('will-reveal')
    el.dataset.revealDelay = i * staggerMs
    observer.observe(el)
  })
}

const POPULAR_PEPTIDE_IDS = ['retatrutide', 'tirzepatide', 'bpc-157', 'mots-c', 'tesamorelin', 'ghk-cu']

function initFeatured() {
  const container = document.getElementById('featured-scroll')
  if (!container) return
  const byId = new Map(peptides.map(p => [p.id, p]))
  container.innerHTML = POPULAR_PEPTIDE_IDS
    .map(id => byId.get(id))
    .filter(Boolean)
    .map(buildCard)
    .join('')

  const items = container.querySelectorAll('.peptide-list-item')
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target
        setTimeout(() => el.classList.add('is-visible'), parseInt(el.dataset.revealDelay || '0', 10))
        observer.unobserve(el)
      }
    })
  }, { threshold: 0.06 })

  items.forEach((el, i) => {
    el.dataset.revealDelay = i * 80
    observer.observe(el)
  })
}

function initStacksFeatured() {
  const container = document.getElementById('stacks-scroll')
  if (!container) return
  if (jsonStacks.length) {
    container.innerHTML = jsonStacks.map(buildStackJsonCard).join('')
  } else {
    container.innerHTML = stacks.map(buildStackCard).join('')
  }
  initRevealObserver(container.querySelectorAll('.item-list-row'), 70)
}

const FEATURED_BLENDS = ['BPC-157 + TB-500', 'Cagrilintide + Semaglutide', 'CJC-1295 NO DAC + Ipamorelin', 'GLOW']

function initBlendsFeatured() {
  const container = document.getElementById('blends-scroll')
  if (!container) return
  if (jsonBlends.length) {
    const seen = new Set()
    const featured = jsonBlends.filter(b => {
      if (!FEATURED_BLENDS.includes(b.base_name) || seen.has(b.base_name)) return false
      seen.add(b.base_name)
      return true
    })
    featured.sort((a, b) => FEATURED_BLENDS.indexOf(a.base_name) - FEATURED_BLENDS.indexOf(b.base_name))
    container.innerHTML = featured.map(buildBlendJsonCard).join('')
  } else {
    container.innerHTML = blends.map(buildBlendCard).join('')
  }
  initRevealObserver(container.querySelectorAll('.item-list-row'), 70)
}

function peptideSearchScore(p, q) {
  const name = p.name.toLowerCase()
  if (name === q) return 0
  if (name.startsWith(q)) return 1
  if (name.includes(q)) return 2
  if (p.slug.includes(q)) return 3
  return 4
}

function combinationSearchScore(name, q) {
  if (name === q) return 0
  if (name.startsWith(q)) return 1
  if (name.includes(q)) return 2
  return 3
}

function render() {
  const isFiltering = activeCategory !== 'All'
  const isSearching = searchQuery.length > 0
  const showCurated = !isFiltering && !isSearching

  const whyPr    = document.getElementById('why-pr')
  const featured = document.getElementById('featured')
  const stacksEl = document.getElementById('stacks')
  const blendsEl = document.getElementById('blends')
  const resultsEl = document.getElementById('results')

  if (!resultsEl) return

  if (whyPr)    whyPr.style.display    = showCurated ? '' : 'none'
  if (featured) featured.style.display = showCurated ? '' : 'none'
  if (stacksEl) stacksEl.style.display = showCurated ? '' : 'none'
  if (blendsEl) blendsEl.style.display = showCurated ? '' : 'none'
  resultsEl.style.display = showCurated ? 'none' : ''

  if (!showCurated) {
    const q      = searchQuery.toLowerCase()
    const qNorm  = normalizeSearchText(q)
    const synExp = [qNorm, ...(SEARCH_SYNONYMS[q.trim()] || SEARCH_SYNONYMS[qNorm] || [])]

    const filteredPeptides = jsonPeptides
      .filter(p => {
        const matchesCat    = !isFiltering || p.category === activeCategory
        const matchesSearch = !isSearching || synExp.some(term =>
          normalizeSearchText(p.name).includes(term) ||
          normalizeSearchText(p.slug || '').includes(term) ||
          normalizeSearchText(p.desc || '').includes(term) ||
          (p.themes || []).some(t => normalizeSearchText(t).includes(term)) ||
          normalizeSearchText(p.category || '').includes(term)
        )
        return matchesCat && matchesSearch
      })
      .sort((a, b) => isSearching ? peptideSearchScore(a, q) - peptideSearchScore(b, q) : 0)

    const stackSource = jsonStacks.length ? jsonStacks : stacks
    const filteredStacks = stackSource
      .filter(s => {
        if (jsonStacks.length) {
          const category      = combinationCategories[s.base_name] || deriveCategory(s.hero?.tags)
          const matchesCat    = !isFiltering || category === activeCategory
          const matchesSearch = !isSearching || synExp.some(term =>
            normalizeSearchText(s.base_name || s.name || '').includes(term) ||
            normalizeSearchText(s.hero?.subtitle || '').includes(term) ||
            (s.hero?.tags || []).some(t => normalizeSearchText(t).includes(term)) ||
            (s.tags || []).some(t => normalizeSearchText(t).includes(term))
          )
          return matchesCat && matchesSearch
        }
        const matchesCat    = !isFiltering || s.category === activeCategory
        const matchesSearch = !isSearching ||
          s.name.toLowerCase().includes(q) ||
          s.desc.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        return matchesCat && matchesSearch
      })
      .sort((a, b) => {
        if (!isSearching) return 0
        const an = (a.base_name || a.name || '').toLowerCase()
        const bn = (b.base_name || b.name || '').toLowerCase()
        return combinationSearchScore(an, q) - combinationSearchScore(bn, q)
      })

    const blendSource = jsonBlends.length ? jsonBlends : blends
    const filteredBlends = blendSource
      .filter(b => {
        if (jsonBlends.length) {
          const category      = combinationCategories[b.base_name] || deriveCategory(b.hero?.tags)
          const matchesCat    = !isFiltering || category === activeCategory
          const matchesSearch = !isSearching || synExp.some(term =>
            normalizeSearchText(b.name || b.base_name || '').includes(term) ||
            normalizeSearchText(b.hero?.subtitle || '').includes(term) ||
            (b.hero?.tags || []).some(t => normalizeSearchText(t).includes(term)) ||
            (b.tags || []).some(t => normalizeSearchText(t).includes(term))
          )
          return matchesCat && matchesSearch
        }
        const matchesCat    = !isFiltering || b.category === activeCategory
        const matchesSearch = !isSearching ||
          b.name.toLowerCase().includes(q) ||
          b.desc.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
        return matchesCat && matchesSearch
      })
      .sort((a, b) => {
        if (!isSearching) return 0
        const an = (a.name || a.base_name || '').toLowerCase()
        const bn = (b.name || b.base_name || '').toLowerCase()
        return combinationSearchScore(an, q) - combinationSearchScore(bn, q)
      })

    document.getElementById('results-title').textContent =
      isFiltering && !isSearching ? `${activeCategory} Peptides, Stacks & Blends` : 'Search Results'

    const peptidesGroup = document.getElementById('results-peptides-group')
    if (filteredPeptides.length > 0) {
      peptidesGroup.style.display = ''
      document.getElementById('results-peptides').innerHTML = filteredPeptides.map(buildJsonCard).join('')
    } else {
      peptidesGroup.style.display = 'none'
    }

    const stacksGroup = document.getElementById('results-stacks-group')
    if (filteredStacks.length > 0) {
      stacksGroup.style.display = ''
      document.getElementById('results-stacks').innerHTML = filteredStacks.map(
        s => jsonStacks.length ? buildStackResultCard(s) : buildStackCard(s)
      ).join('')
    } else {
      stacksGroup.style.display = 'none'
    }

    const blendsGroup = document.getElementById('results-blends-group')
    if (filteredBlends.length > 0) {
      blendsGroup.style.display = ''
      document.getElementById('results-blends').innerHTML = filteredBlends.map(
        b => jsonBlends.length ? buildBlendResultCard(b) : buildBlendCard(b)
      ).join('')
    } else {
      blendsGroup.style.display = 'none'
    }

    const isEmpty = filteredPeptides.length === 0 && filteredStacks.length === 0 && filteredBlends.length === 0
    document.getElementById('results-empty').style.display = isEmpty ? '' : 'none'

    const filterAnnounce = document.getElementById('filter-announce')
    if (filterAnnounce) {
      const total = filteredPeptides.length + filteredStacks.length + filteredBlends.length
      filterAnnounce.textContent = total > 0
        ? `Showing ${total} ${isFiltering && !isSearching ? activeCategory : 'search'} result${total === 1 ? '' : 's'}`
        : 'No results found'
    }

    // Stagger-reveal all newly injected result items
    initRevealObserver(document.querySelectorAll('#results-peptides .card, #results-peptides .peptide-list-item'), 60)
    initRevealObserver(document.querySelectorAll('#results-stacks .card, #results-stacks .item-list-row'), 60)
    initRevealObserver(document.querySelectorAll('#results-blends .card, #results-blends .item-list-row'), 60)
  }
}

function initSectionReveals() {
  initRevealObserver(document.querySelectorAll('.section-header'), 0)
  initRevealObserver(document.querySelectorAll('#site-stats'), 0)
}

function initStaticPageReveals() {
  initRevealObserver(document.querySelectorAll('.why-section'), 0)
}

function initFilters() {
  const container = document.getElementById('filter-pills')
  if (!container) return
  const categories = ['All', 'Fat Loss', 'Healing', 'Muscle Growth', 'Cognitive', 'Anti-Aging', 'Sleep & Recovery', 'Hormonal']
  container.innerHTML = categories.map(cat =>
    `<button class="pill${cat === 'All' ? ' active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('')

  container.addEventListener('click', e => {
    const btn = e.target.closest('.pill')
    if (!btn) return
    activeCategory = btn.dataset.cat
    container.querySelectorAll('.pill').forEach(p => p.classList.toggle('active', p === btn))
    render()
    if (activeCategory !== 'All') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      document.getElementById('results').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
    }
  })
}

// ── PEPTIDE DETAIL HELPERS ───────────────────────────────────────────────────

function inferEvidenceType(label, href, title) {
  const text = [label || '', href || '', title || ''].join(' ').toLowerCase()
  if (/\bcdc\b|\bfda\b|\bwho\b|\bema\b|\.gov\//.test(text)) return 'Regulatory Document'
  if (/bookshelf|nlm\.nih\.gov\/books/.test(text)) return 'Educational Resource'
  if (/pharmacokinetic|bioavailability|lc.?ms|pk.?study/.test(text)) return 'Pharmacokinetic Study'
  if (/\breview\b|meta.?anal|systematic/.test(text)) return 'Review Paper'
  if (/animal.?model|mouse\b|mice\b|\brat\b|rodent/.test(text)) return 'Animal Study'
  if (/clinical.?trial|randomized|\brct\b|human.?trial/.test(text)) return 'Human Trial'
  if (/mechanism|molecular|in.?vitro|cell.?culture/.test(text)) return 'Mechanistic Study'
  return 'Research Reference'
}

function evidenceBadgeClass(type) {
  return {
    'Human Trial':           'badge-human-trial',
    'Animal Study':          'badge-animal',
    'Review Paper':          'badge-review',
    'Mechanistic Study':     'badge-mechanistic',
    'Pharmacokinetic Study': 'badge-pk',
    'Regulatory Document':   'badge-regulatory',
    'Educational Resource':  'badge-educational',
    'Research Reference':    'badge-research-ref',
  }[type] || 'badge-research-ref'
}

function isPureLab(r) {
  return /purelabpeptides\.com/i.test(r.href || '') ||
         /pure\s*lab\s*peptides/i.test(r.label || '')
}

function groupProtocols(protocols) {
  if (!protocols.length) return []

  // Stack pattern: every label is "ComponentName: phase"
  const allPrefixed = protocols.every(p => /^[^:]+:/.test(p.label || ''))
  if (allPrefixed) {
    const groups = new Map()
    for (const p of protocols) {
      const prefix = (p.label || '').split(':')[0].trim()
      if (!groups.has(prefix)) groups.set(prefix, [])
      groups.get(prefix).push(p)
    }
    return Array.from(groups.entries()).map(([name, rows]) => ({ name, rows }))
  }

  // Repetition detection: new group starts when a label reappears
  const tiers = []
  const seen = new Set()
  let current = []

  for (const p of protocols) {
    const key = (p.label || p.timeframe || '').trim()
    if (key && seen.has(key) && current.length > 0) {
      tiers.push(current)
      current = [p]
      seen.clear()
    } else {
      current.push(p)
    }
    if (key) seen.add(key)
  }
  if (current.length > 0) tiers.push(current)

  if (tiers.length === 1) return [{ name: '', rows: tiers[0] }]
  if (tiers.length === 2) return [
    { name: 'Standard Protocol', rows: tiers[0] },
    { name: 'Escalated Protocol', rows: tiers[1] },
  ]
  return tiers.map((rows, i) => ({ name: `Protocol ${i + 1}`, rows }))
}

function evidenceLevelClass(level) {
  if (!level) return ''
  const l = level.toLowerCase()
  if (/\bhuman\b/.test(l) && !/preclinical/.test(l)) return 'ev-human'
  if (/preclinical.*human|human.*preclinical|early human|mixed/.test(l)) return 'ev-mixed'
  if (/preclinical/.test(l)) return 'ev-preclinical'
  return 'ev-unknown'
}

// ── INLINE CITATION PARSER ────────────────────────────────────────────────────

function parseCitations(text, resources) {
  if (!text || typeof text !== 'string') return text || ''
  const resArr = resources || []
  return text.replace(/\[(\d+)\]/g, (match, num) => {
    const n = parseInt(num, 10)
    const found = resArr.some(r => Number(r.source_number) === n)
    if (found) {
      return `<a class="inline-citation" href="#source-${n}">[${n}]</a>`
    }
    return `<span class="inline-citation-text">[${n}]</span>`
  })
}

// ── RELATED RESEARCH RECOMMENDATIONS ────────────────────────────────────────
// Reuses jsonPeptides/jsonBlends/jsonStacks + the existing category/tag metadata
// (no new data structures). Blends/stacks store their member peptide names in
// hero.tags, which doubles as a ready-made "frequently paired" signal.

const RELATED_TYPE_LABEL = { peptide: 'Peptide', blend: 'Blend', stack: 'Research Stack' }
const RELATED_TYPE_HREF  = { peptide: 'peptide.html', blend: 'blend.html', stack: 'stack.html' }

// Dedupe a raw blends/stacks array by base_name (mirrors the jsonPeptides dedup)
// and normalize it to the same shape used for scoring.
function buildRelatedCandidates(rawArr, getRouteSlug, type) {
  const seen = new Map()
  for (const item of (rawArr || [])) {
    const baseName = item.base_name || item.name
    if (seen.has(baseName)) continue
    seen.set(baseName, {
      type,
      baseName,
      routeSlug:  getRouteSlug(item),
      category:   combinationCategories[baseName] || deriveCategory(item.hero?.tags),
      components: item.hero?.tags || [], // member peptide names
      themes:     [],
    })
  }
  return [...seen.values()]
}

function getRelatedCandidatePool() {
  const peps = jsonPeptides.map(p => ({
    type: 'peptide',
    baseName: p.name,
    routeSlug: p.routeSlug,
    category: p.category,
    components: [],
    themes: p.themes || [],
  }))
  const blends = buildRelatedCandidates(jsonBlends, getBlendRouteSlug, 'blend')
  const stacks = buildRelatedCandidates(jsonStacks, getStackRouteSlug, 'stack')
  return [...peps, ...blends, ...stacks]
}

// Scores every candidate against the current compound and returns the top matches.
// Tiers (highest first): frequently-paired component match > shared research
// category > overlapping topical tags > fallback fill so the panel is never sparse.
function getRelatedResearch(type, baseName, limit) {
  limit = limit || 4
  const pool = getRelatedCandidatePool()
  const self = pool.find(x => x.type === type && x.baseName === baseName)
  if (!self) return []

  // Peptide names that co-occur with self in some blend/stack (e.g. TB-500 for
  // BPC-157) — scored as their own tier so the individual peptide surfaces
  // alongside the blend/stack card, not just buried inside it.
  const coOccurring = new Set()
  if (self.type === 'peptide') {
    for (const cand of pool) {
      if (cand.type !== 'peptide' && cand.components.includes(self.baseName)) {
        cand.components.forEach(c => { if (c !== self.baseName) coOccurring.add(c) })
      }
    }
  }

  const scored = []
  for (const cand of pool) {
    if (cand.type === self.type && cand.baseName === self.baseName) continue

    // Score additively across tiers so, e.g., a same-category candidate that also
    // shares topical tags outranks a same-category candidate that shares none —
    // the displayed reason still shows only the single strongest signal.
    let score = 0
    let pairingReason  = ''
    let categoryReason = ''
    let tagReason       = ''

    if (self.type === 'peptide' && cand.components.includes(self.baseName)) {
      score += 40
      pairingReason = `Includes ${self.baseName}`
    } else if (self.type === 'peptide' && cand.type === 'peptide' && coOccurring.has(cand.baseName)) {
      score += 36
      pairingReason = `Frequently paired with ${self.baseName}`
    } else if (self.type !== 'peptide' && cand.type === 'peptide' && self.components.includes(cand.baseName)) {
      score += 40
      pairingReason = `One of the compounds in ${self.baseName}`
    } else if (self.type !== 'peptide' && cand.type !== 'peptide') {
      const shared = cand.components.find(c => self.components.includes(c))
      if (shared) { score += 32; pairingReason = `Also features ${shared}` }
    }

    if (cand.category && cand.category === self.category) {
      score += 10
      categoryReason = `Also researched for ${self.category}`
    }

    if (self.type === 'peptide' && cand.type === 'peptide') {
      const overlap = self.themes.filter(t => cand.themes.includes(t))
      if (overlap.length) { score += overlap.length; tagReason = `Shares ${overlap[0]} research focus` }
    }

    const reason = pairingReason || categoryReason || tagReason
    if (score > 0) scored.push({ ...cand, score, reason })
  }

  scored.sort((a, b) => b.score - a.score)

  if (scored.length < limit) {
    const already = new Set(scored.map(s => s.type + ':' + s.baseName))
    for (const cand of pool) {
      if (scored.length >= limit) break
      const key = cand.type + ':' + cand.baseName
      if (key === self.type + ':' + self.baseName || already.has(key)) continue
      scored.push({ ...cand, score: 1, reason: 'Related research compound' })
      already.add(key)
    }
  }

  return scored.slice(0, limit)
}

function renderRelatedResearchPanel(type, baseName) {
  const items = getRelatedResearch(type, baseName, 4)
  if (!items.length) return ''

  const chips = items.map(item => `
        <a class="related-chip" href="${RELATED_TYPE_HREF[item.type]}?slug=${item.routeSlug}"
           aria-label="${item.baseName} — ${RELATED_TYPE_LABEL[item.type]} — ${item.reason}" title="${item.reason}">
          ${item.baseName}
        </a>`).join('')

  return `
      <p class="related-compact-label">Related Research</p>
      <div class="related-chip-row">${chips}</div>`
}

// Re-renders the panel once more datasets finish loading (peptide/blend/stack JSON
// fetch independently, so the panel may initially render before all three arrive).
function refreshRelatedResearchPanel() {
  if (!_detailPageInfo) return
  const el = document.getElementById('related-research-panel')
  if (!el) return
  el.innerHTML = renderRelatedResearchPanel(_detailPageInfo.type, _detailPageInfo.name)
}

// ── PEPTIDE DETAIL RENDERERS ─────────────────────────────────────────────────

// Single source of truth for page-section links — used by both the desktop
// sidebar TOC and the hero section-nav pills, so they can never drift out of
// sync and no section list is ever hardcoded in more than one place.
function renderTOCNavLinks(hasStackDetails) {
  return `
        <a class="toc-link" href="#overview">Overview</a>
        <a class="toc-link" href="#supplies">Supplies Needed</a>
        <a class="toc-link" href="#dosing">Dosing &amp; Reconstitution</a>
        ${hasStackDetails ? '<a class="toc-link" href="#stack-details">Stack Details</a>' : ''}
        <a class="toc-link" href="#storage">Storage &amp; Handling</a>
        <a class="toc-link" href="#research">References &amp; Research</a>`
}

function renderDetailTOC(hasStackDetails) {
  return `
    <aside class="pep-toc">
      <p class="toc-label">On this page</p>
      <nav>${renderTOCNavLinks(hasStackDetails)}</nav>
      <div class="pep-sidebar-calc-container" id="pep-sidebar-calc"></div>
    </aside>`
}

function renderHero(p, otherVials) {
  const hero = p.hero || {}
  const res  = p.research?.resources || []
  const ct   = t => parseCitations(t, res)

  const otherVialsHTML = otherVials.length
    ? `<div class="pep-other-vials">
        <span class="pep-other-vials-label">Also available:</span>
        ${otherVials.map(v =>
          `<a class="pep-other-vial-link" href="peptide.html?slug=${v.routeSlug}">${v.name}</a>`
        ).join('')}
      </div>`
    : ''

  const evClass = evidenceLevelClass(hero.evidence_level)

  return `
    <div class="pep-hero-wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a href="index.html">Peptides</a>
        <span class="breadcrumb-sep">›</span>
        <span>${p.base_name}</span>
      </nav>

      <div class="pep-hero-split">
        <div class="pep-hero-content">
          <span class="pep-eyebrow">${hero.eyebrow || 'Peptide Research Library'}</span>
          <h1 class="pep-hero-title">${hero.title || p.base_name}</h1>
          <div class="pep-hero-vial-row">
            <span class="pep-vial-badge pep-vial-badge-hero">${p.vial_strength}</span>
            ${otherVialsHTML}
          </div>
          <p class="pep-subtitle">${ct(hero.subtitle || '')}</p>
          ${hero.evidence_level ? `<div class="pep-evidence-level ${evClass}"><span class="ev-dot"></span>${hero.evidence_level}</div>` : ''}
          <div class="hero-related-compact" id="related-research-panel">
            ${renderRelatedResearchPanel('peptide', p.base_name)}
          </div>
          <nav class="hero-nav-pills" aria-label="Page sections">${renderTOCNavLinks()}</nav>
        </div>
        <div class="pep-hero-right">
          <div class="pep-vial-card">
            <div class="pep-vial-card-icon">${VIAL_SVG}</div>
            <div class="pep-vial-card-name">${p.base_name}</div>
            <div class="pep-vial-card-strength">${p.vial_strength}</div>
          </div>
        </div>
      </div>
    </div>`
}

function renderGlobalDisclaimer(text) {
  if (!text) return ''
  return `<div class="global-disclaimer-banner">${text}</div>`
}

function renderOverviewAccordion(p) {
  const ov  = p.overview || {}
  const wi  = ov.what_is_it || {}
  const mb  = ov.main_benefits || {}
  const hw  = ov.how_it_works || {}
  const se  = ov.side_effects || {}
  const res = p.research?.resources || []
  const ct  = t => parseCitations(t, res)

  // Main Benefits content
  const benefitItems = mb.items || []
  const benefitsContent = benefitItems.length
    ? `<div class="benefits-grid">${benefitItems.map(item => `
        <div class="benefit-card">
          <div class="benefit-title">${item.title}</div>
          <p class="benefit-desc">${ct(item.description)}</p>
        </div>`).join('')}
      </div>`
    : `<p class="empty-field-note">No benefit summary available from source material.</p>`

  // Side Effects content
  const seItems = se.items || []
  let seContent = ''
  if (seItems.length) {
    seContent += `<ul class="side-effects-list">${seItems.map(i => `<li>${ct(i)}</li>`).join('')}</ul>`
  }
  if (se.note) {
    seContent += `<p class="side-effects-note">${ct(se.note)}</p>`
  }
  if (!seContent) seContent = `<p class="empty-field-note">No side effect data available from source material.</p>`

  const items = [
    { heading: wi.heading || `What is ${p.base_name}?`,  content: wi.body ? `<p>${ct(wi.body)}</p>` : '' },
    { heading: 'Potential Benefits',                       content: benefitsContent },
    { heading: hw.heading || 'How It Works',              content: hw.body ? `<p>${ct(hw.body)}</p>` : '' },
    { heading: se.heading || 'Potential Side Effects',    content: seContent },
  ]

  const accordionItems = items.map((item, i) => `
    <div class="accordion-item${i === 0 ? ' open' : ''}">
      <button class="accordion-header" aria-expanded="${i === 0}">
        <span>${item.heading}</span>
        ${CHEVRON_SVG}
      </button>
      <div class="accordion-body">
        <div class="accordion-body-inner">
          <div class="accordion-body-content">
            ${item.content || '<p class="empty-field-note">No information available from source material.</p>'}
          </div>
        </div>
      </div>
    </div>`).join('')

  return `
    <div id="overview" class="pep-section-block">
      <h2 class="section-heading">Overview</h2>
      <div class="accordion">${accordionItems}</div>
    </div>`
}

function renderDosingSection(p) {
  const dr          = p.dosing_and_reconstitution || {}
  const protocols   = dr.dosage_protocols || []
  const recon       = dr.reconstitution_guide || {}
  const freq        = dr.injection_frequency || {}
  const recommended = dr.recommended_for || []
  const res         = p.research?.resources || []
  const ct          = t => parseCitations(t, res)

  // ── A. Dosage Protocols
  let protocolsHTML
  if (protocols.length) {
    const groups = groupProtocols(protocols)
    protocolsHTML = groups.map(group => {
      const hasDose  = group.rows.some(r => r.dose && r.dose.trim())
      const hasNotes = group.rows.some(r => r.notes && r.notes.trim())

      const rowsHTML = group.rows.map(r => {
        const dose  = hasDose ? (r.dose || '—') : null
        const vol   = r.units_or_volume || ''
        const notes = hasNotes ? (r.notes || '') : null
        const label = r.label || r.timeframe || '—'
        return `
          <div class="protocol-row">
            <span class="protocol-row-phase">${label}</span>
            ${dose !== null ? `<span class="protocol-row-dose">${dose}</span>` : ''}
            <span class="protocol-row-vol">${vol}</span>
            ${notes !== null ? `<span class="protocol-row-notes">${notes}</span>` : ''}
          </div>`
      }).join('')

      const freqChip = (() => {
        if (groups.length > 1) return ''
        const opts = (freq.options || []).filter(o => o && o.trim().length <= 45)
        return opts.length === 1 ? `<div class="protocol-group-freq">${opts[0]}</div>` : ''
      })()

      return `
        <div class="protocol-group">
          ${group.name ? `<div class="protocol-group-name">${group.name}</div>` : ''}
          ${freqChip}
          <div class="protocol-rows">
            <div class="protocol-rows-header">
              <span>Phase</span>
              ${hasDose ? '<span>Dose</span>' : ''}
              <span>Units / Volume</span>
              ${hasNotes ? `<span>${hasDose ? 'Notes' : 'Dose & Notes'}</span>` : ''}
            </div>
            ${rowsHTML}
          </div>
        </div>`
    }).join('')
  } else {
    protocolsHTML = `<p class="empty-field-note">No dosage protocol table was available in the source material.</p>`
  }

  // ── B. Reconstitution Guide
  // Stack entries have per-component recon in renderStackDetailsSection — suppress the
  // single-vial stats card and combined steps here to avoid the "—" placeholder display.
  const isStack = !!p.stack_details

  const reconStatsHTML = isStack ? '' : `
    <div class="recon-stats">
      <div class="recon-stat">
        <span class="recon-stat-label">Vial Amount</span>
        <span class="recon-stat-value">${recon.vial_amount || '—'}</span>
      </div>
      <div class="recon-stat">
        <span class="recon-stat-label">Bacteriostatic Water</span>
        <span class="recon-stat-value">${recon.bacteriostatic_water || '—'}</span>
      </div>
      <div class="recon-stat">
        <span class="recon-stat-label">Concentration</span>
        <span class="recon-stat-value">${recon.resulting_concentration || '—'}</span>
      </div>
    </div>`

  const reconStepsHTML = isStack ? '' : ((recon.steps || []).length
    ? `<ol class="recon-steps">${recon.steps.map(s => `<li>${ct(s)}</li>`).join('')}</ol>`
    : '')

  const reconHTML = `
    ${reconStatsHTML}
    ${recon.summary ? `<p class="recon-summary">${ct(recon.summary)}</p>` : ''}
    ${reconStepsHTML}`

  // ── C. Injection Frequency
  const freqChipsHTML = (freq.options || []).map(opt =>
    `<span class="option-chip">${opt}</span>`
  ).join('')

  const freqSummaryText = (freq.summary || '').trim()
  const isLabelFragment = freqSummaryText.toLowerCase() === 'frequency:'
    || freqSummaryText.toLowerCase() === 'frequency'
  const freqHTML = `
    ${freqSummaryText && !isLabelFragment ? `<p class="dosing-text">${ct(freq.summary)}</p>` : ''}
    ${freqChipsHTML ? `<div class="option-chips">${freqChipsHTML}</div>` : ''}`

  // ── D. Recommended For
  const recommendedHTML = recommended.length
    ? `<div class="recommended-grid">${recommended.slice(0, 3).map(item => `
        <div class="recommended-card">
          <div class="recommended-type">${item.type}</div>
          <p class="recommended-desc">${ct(item.description)}</p>
        </div>`).join('')}
      </div>`
    : ''

  return `
    <div id="dosing" class="pep-section-block">
      <h2 class="section-heading">Dosing &amp; Reconstitution</h2>

      ${dr.disclaimer ? `<div class="info-callout">${ct(dr.disclaimer)}</div>` : ''}

      <div class="dosing-subsections">
        <div class="dosing-subsection">
          <h3 class="dosing-subsection-label">Dosage Protocols</h3>
          ${protocolsHTML}
        </div>

        <div class="dosing-subsection">
          <h3 class="dosing-subsection-label">Reconstitution Guide</h3>
          ${reconHTML}
        </div>

        <div class="dosing-subsection">
          <h3 class="dosing-subsection-label">Injection Frequency</h3>
          ${freqHTML}
        </div>

        ${recommendedHTML ? `
        <div class="dosing-subsection">
          <h3 class="dosing-subsection-label">Research Context</h3>
          ${recommendedHTML}
        </div>` : ''}
      </div>
    </div>`
}

function renderSuppliesSection(p) {
  const sn  = p.supplies_needed || {}
  const items = sn.items || []
  const res = p.research?.resources || []
  const ct  = t => parseCitations(t, res)

  const itemsHTML = items.length
    ? `<div class="supplies-grid">${items.map(item => {
        const link = getSupplierLink(item.name)
        const linkHTML = link
          ? `<a class="supply-resource-link" href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label} ↗</a>`
          : ''
        return `
        <div class="supply-card">
          <div class="supply-icon">${getSupplyIcon(item.name)}</div>
          <div class="supply-content">
            <div class="supply-name">${item.name}</div>
            <p class="supply-purpose">${ct(item.purpose)}</p>
            <span class="supply-qty">${item.quantity_guidance}</span>
            ${linkHTML}
          </div>
        </div>`
      }).join('')}
      </div>`
    : `<p class="empty-field-note">No supply list was available in the source material.</p>`

  return `
    <div id="supplies" class="pep-section-block">
      <h2 class="section-heading">${sn.section_title || 'Supplies Needed'}</h2>
      ${sn.summary ? `<p class="section-summary">${ct(sn.summary)}</p>` : ''}
      ${itemsHTML}
    </div>`
}

function renderStorageSection(p) {
  const sh  = p.storage_and_handling || {}
  const res = p.research?.resources || []
  const ct  = t => parseCitations(t, res)

  const tipsHTML = (sh.handling_tips || []).length
    ? `<ul class="storage-tips-list">${(sh.handling_tips).map(t => `<li>${ct(t)}</li>`).join('')}</ul>`
    : ''

  const safetyHTML = (sh.safety_notes || []).length
    ? `<ul class="storage-tips-list">${(sh.safety_notes).map(n => `<li>${ct(n)}</li>`).join('')}</ul>`
    : ''

  return `
    <div id="storage" class="pep-section-block">
      <h2 class="section-heading">${sh.section_title || 'Storage &amp; Handling'}</h2>

      <div class="storage-cards">
        <div class="storage-card">
          <div class="storage-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </div>
          <div class="storage-card-label">Before Reconstitution</div>
          <div class="storage-card-value">${sh.lyophilized_storage || 'See source material.'}</div>
        </div>
        <div class="storage-card storage-card-recon">
          <div class="storage-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>
          </div>
          <div class="storage-card-label">After Reconstitution</div>
          <div class="storage-card-value">${sh.reconstituted_storage || 'See source material.'}</div>
        </div>
      </div>

      <div class="storage-tips-grid">
        ${tipsHTML ? `<div class="storage-tips-block"><h3 class="storage-tips-heading">Handling Tips</h3>${tipsHTML}</div>` : ''}
        ${safetyHTML ? `<div class="storage-tips-block"><h3 class="storage-tips-heading">Safety Notes</h3>${safetyHTML}</div>` : ''}
      </div>
    </div>`
}

function renderResearchSection(p) {
  const res       = p.research || {}
  const resources         = res.resources || []
  const filteredResources = resources.filter(r => !isPureLab(r))
  const ct                = t => parseCitations(t, filteredResources)

  const evidenceSummaryHTML = res.evidence_summary
    ? `<p class="evidence-summary">${ct(res.evidence_summary)}</p>`
    : ''

  let resourcesHTML
  if (filteredResources.length) {
    const cards = filteredResources.map(r => {
      const type  = inferEvidenceType(r.label, r.href, r.title)
      const cls   = evidenceBadgeClass(type)
      const isClickable = r.is_clickable !== false && r.href
      const linkBtn = isClickable
        ? `<a class="resource-link" href="${r.href}" target="_blank" rel="noopener noreferrer">View Source ${EXTERNAL_SVG}</a>`
        : `<span class="resource-link disabled">Source URL unavailable</span>`
      return `
        <div class="resource-card" id="source-${r.source_number}">
          <div class="resource-card-top">
            <span class="resource-num">${r.source_number}</span>
            <span class="resource-badge ${cls}">${type}</span>
          </div>
          <p class="resource-label-text">${r.label || 'Research Source'}</p>
          ${r.title ? `<p class="resource-title">${r.title}</p>` : ''}
          <div class="resource-card-footer">${linkBtn}</div>
        </div>`
    }).join('')

    resourcesHTML = `
      <div class="references-header">
        <h3 class="references-subheading">References</h3>
        <span class="references-count">${filteredResources.length} sources</span>
      </div>
      <p class="references-intro">Sources used in compiling this research overview. External links open in a new tab. Source quality and study type vary — interpret findings in context of evidence stage.</p>
      <div class="resource-grid">${cards}</div>`
  } else {
    resourcesHTML = `<p class="empty-field-note">No reference links were included in the source material.</p>`
  }

  return `
    <div id="research" class="pep-section-block">
      <h2 class="section-heading">${res.section_title || 'Research &amp; References'}</h2>
      ${evidenceSummaryHTML}
      ${resourcesHTML}
    </div>`
}

// ── PEPTIDE DETAIL PAGE INIT ──────────────────────────────────────────────────

function renderCalcSection(itemSlug, displayName) {
  return `
    <div id="pep-calculator" class="pep-section-block pep-calc-section pep-calc-inline-only">
      <h2 class="section-heading">Dosage Calculator</h2>
      <p class="pep-calc-section-sub">Choose your vial setup to get your exact syringe draw amount.</p>
      <div id="pep-calc-container"></div>
    </div>`
}

function renderStackCalcSection(stack) {
  const stackPresets = window.CALC_PRESETS && window.CALC_PRESETS[stack.slug]
  const components   = (stackPresets && stackPresets.components) || []

  if (!components.length) return renderCalcSection(stack.slug, stack.base_name || stack.name)

  const pairHTML = components.map((slug, i) => `
    <div class="stack-calc-item">
      <div id="stack-sb-calc-${i}"></div>
    </div>`
  ).join('')

  return `
    <div id="pep-calculator" class="pep-section-block pep-calc-section pep-calc-inline-only">
      <h2 class="section-heading">Dosage Calculator</h2>
      <p class="pep-calc-section-sub">Each peptide is a separate vial — calculate doses for each component below.</p>
      <div class="stack-calc-pair">${pairHTML}</div>
    </div>`
}

function renderPeptidePage() {
  if (!peptideData) return

  const params    = new URLSearchParams(window.location.search)
  const slugParam = params.get('slug')
  const contentEl = document.getElementById('pep-content')
  if (!slugParam || !contentEl) return

  // Primary lookup by full routeSlug; fallback by base slug (supports old-style links)
  let p = peptideByRouteSlug.get(slugParam)
  if (!p) {
    p = peptideData.peptides.find(ep => ep.slug === slugParam)
  }

  contentEl.classList.remove('pep-loading-state')

  if (!p) {
    contentEl.innerHTML = `<div class="peptide-page"><p class="pep-not-found">Peptide not found.</p></div>`
    return
  }

  // Update SEO
  document.title = p.seo?.title || `${p.name} — PeptideGuidelines`
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc && p.seo?.description) metaDesc.setAttribute('content', p.seo.description)

  // Find other vial strengths for the same base peptide
  const otherVials = peptideData.peptides
    .filter(op => op.slug === p.slug && op.id !== p.id)
    .map(op => ({ name: op.vial_strength, routeSlug: getPeptideRouteSlug(op) }))

  const disclaimer = peptideData.global_disclaimer || ''

  contentEl.innerHTML = `
    <div class="peptide-page">
      <div class="pep-layout">
        ${renderDetailTOC()}
        <div class="pep-main">
          ${renderHero(p, otherVials)}
          ${renderGlobalDisclaimer(disclaimer)}
          ${renderOverviewAccordion(p)}
          ${renderSuppliesSection(p)}
          ${renderDosingSection(p)}
          ${renderStorageSection(p)}
          ${renderResearchSection(p)}
          ${renderCalcSection(p.slug, p.base_name || p.name)}
        </div>
      </div>
    </div>`

  initAccordion()
  initTOCLinks()
  initTOCScroll()
  initRevealObserver(contentEl.querySelectorAll('.pep-section-block'), 80)

  const calcContainer = document.getElementById('pep-calc-container')
  if (calcContainer && typeof renderInlineCalculator === 'function') {
    renderInlineCalculator(calcContainer, { initialSlug: p.slug, mode: 'detail' })
  }

  const sidebarCalcEl = document.getElementById('pep-sidebar-calc')
  if (sidebarCalcEl && typeof renderSidebarCalculator === 'function') {
    renderSidebarCalculator(sidebarCalcEl, { slug: p.slug, displayName: p.base_name || p.name })
  }

  _detailPageInfo = { type: 'peptide', slug: p.slug, name: p.base_name || p.name }
  _trackRecentlyViewed('peptide', p.slug, p.base_name || p.name)
  _trackEvent('detail_view', { item_type: 'peptide', item_slug: p.slug })
}

// ── BLEND DETAIL PAGE ──────────────────────────────────────────────────────────

function renderBlendHero(blend, otherVials) {
  const hero = blend.hero || {}
  const res  = blend.research?.resources || []
  const ct   = t => parseCitations(t, res)

  const otherVialsHTML = otherVials.length
    ? `<div class="pep-other-vials">
        <span class="pep-other-vials-label">Also available:</span>
        ${otherVials.map(v =>
          `<a class="pep-other-vial-link" href="blend.html?slug=${v.routeSlug}">${v.name}</a>`
        ).join('')}
      </div>`
    : ''

  const evClass = evidenceLevelClass(hero.evidence_level)

  return `
    <div class="pep-hero-wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a href="index.html#blends">Peptide Blends</a>
        <span class="breadcrumb-sep">›</span>
        <span>${blend.base_name}</span>
      </nav>

      <div class="pep-hero-split">
        <div class="pep-hero-content">
          <span class="pep-eyebrow">${hero.eyebrow || 'Peptide Blend Research Library'}</span>
          <h1 class="pep-hero-title">${hero.title || blend.base_name}</h1>
          <div class="pep-hero-vial-row">
            <span class="pep-vial-badge pep-vial-badge-hero">${blend.vial_strength}</span>
            ${otherVialsHTML}
          </div>
          <p class="pep-subtitle">${ct(hero.subtitle || '')}</p>
          ${hero.evidence_level ? `<div class="pep-evidence-level ${evClass}"><span class="ev-dot"></span>${hero.evidence_level}</div>` : ''}
          <div class="hero-related-compact" id="related-research-panel">
            ${renderRelatedResearchPanel('blend', blend.base_name)}
          </div>
          <nav class="hero-nav-pills" aria-label="Page sections">${renderTOCNavLinks()}</nav>
        </div>
        <div class="pep-hero-right">
          <div class="pep-vial-card">
            <div class="pep-vial-card-icon">${VIAL_SVG}</div>
            <div class="pep-vial-card-name">${blend.base_name}</div>
            <div class="pep-vial-card-strength">${blend.vial_strength}</div>
          </div>
        </div>
      </div>
    </div>`
}

function renderBlendPage() {
  if (!blendData) return

  const params    = new URLSearchParams(window.location.search)
  const slugParam = params.get('slug')
  const contentEl = document.getElementById('blend-content')
  if (!slugParam || !contentEl) return

  const blend = blendByRouteSlug.get(slugParam)

  contentEl.classList.remove('pep-loading-state')

  if (!blend) {
    contentEl.innerHTML = `<div class="peptide-page"><p class="pep-not-found">Blend not found.</p></div>`
    return
  }

  document.title = blend.seo?.title || `${blend.name} — PeptideGuidelines`
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc && blend.seo?.description) metaDesc.setAttribute('content', blend.seo.description)

  const otherVials = jsonBlends
    .filter(ob => ob.slug === blend.slug && ob.id !== blend.id)
    .map(ob => ({ name: ob.vial_strength, routeSlug: getBlendRouteSlug(ob) }))

  const disclaimer = blendData.global_disclaimer || ''

  contentEl.innerHTML = `
    <div class="peptide-page">
      <div class="pep-layout">
        ${renderDetailTOC()}
        <div class="pep-main">
          ${renderBlendHero(blend, otherVials)}
          ${renderGlobalDisclaimer(disclaimer)}
          ${renderOverviewAccordion(blend)}
          ${renderSuppliesSection(blend)}
          ${renderDosingSection(blend)}
          ${renderStorageSection(blend)}
          ${renderResearchSection(blend)}
          ${renderCalcSection(blend.slug, blend.base_name || blend.name)}
        </div>
      </div>
    </div>`

  initAccordion()
  initTOCLinks()
  initTOCScroll()
  initRevealObserver(contentEl.querySelectorAll('.pep-section-block'), 80)

  const calcContainer = document.getElementById('pep-calc-container')
  if (calcContainer && typeof renderInlineCalculator === 'function') {
    renderInlineCalculator(calcContainer, { initialSlug: blend.slug, mode: 'detail' })
  }

  const sidebarCalcEl = document.getElementById('pep-sidebar-calc')
  if (sidebarCalcEl && typeof renderSidebarCalculator === 'function') {
    renderSidebarCalculator(sidebarCalcEl, { slug: blend.slug, displayName: blend.base_name || blend.name })
  }

  _detailPageInfo = { type: 'blend', slug: blend.slug, name: blend.base_name || blend.name }
  _trackRecentlyViewed('blend', blend.slug, blend.base_name || blend.name)
  _trackEvent('detail_view', { item_type: 'blend', item_slug: blend.slug })
}

// ── STACK DETAIL PAGE ──────────────────────────────────────────────────────────

function renderStackHero(stack, otherVials, hasStackDetails) {
  const hero = stack.hero || {}
  const res  = stack.research?.resources || []
  const ct   = t => parseCitations(t, res)
  const componentsHTML = (hero.tags || []).map(t =>
    `<span class="stack-hero-component">${t}</span>`
  ).join('')

  const otherVialsHTML = otherVials.length
    ? `<div class="pep-other-vials">
        <span class="pep-other-vials-label">Also available:</span>
        ${otherVials.map(v =>
          `<a class="pep-other-vial-link" href="stack.html?slug=${v.routeSlug}">${v.name}</a>`
        ).join('')}
      </div>`
    : ''

  const evClass = evidenceLevelClass(hero.evidence_level)

  return `
    <div class="pep-hero-wrap">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">Home</a>
        <span class="breadcrumb-sep">›</span>
        <a href="index.html#stacks">Peptide Stacks</a>
        <span class="breadcrumb-sep">›</span>
        <span>${stack.base_name}</span>
      </nav>

      <div class="pep-hero-split">
        <div class="pep-hero-content">
          <span class="pep-eyebrow">${hero.eyebrow || 'Peptide Stack Research Library'}</span>
          <h1 class="pep-hero-title">${hero.title || stack.base_name}</h1>
          <div class="pep-hero-vial-row">
            <span class="pep-vial-badge pep-vial-badge-hero">${stack.vial_strength}</span>
            ${otherVialsHTML}
          </div>
          <p class="pep-subtitle">${ct(hero.subtitle || '')}</p>
          ${hero.evidence_level ? `<div class="pep-evidence-level ${evClass}"><span class="ev-dot"></span>${hero.evidence_level}</div>` : ''}
          <div class="hero-related-compact" id="related-research-panel">
            ${renderRelatedResearchPanel('stack', stack.base_name)}
          </div>
          <nav class="hero-nav-pills" aria-label="Page sections">${renderTOCNavLinks(hasStackDetails)}</nav>
        </div>
        <div class="pep-hero-right">
          <div class="pep-vial-card pep-stack-vial-card">
            <div class="pep-vial-card-icon">${STACK_SVG}</div>
            <div class="pep-vial-card-name">${stack.base_name}</div>
            <div class="pep-vial-card-strength">${stack.vial_strength}</div>
            ${componentsHTML ? `<div class="stack-hero-components">${componentsHTML}</div>` : ''}
          </div>
        </div>
      </div>
    </div>`
}

function renderStackDetailsSection(stack) {
  const sd               = stack.stack_details || {}
  const components       = sd.components || []
  const combinedSchedule = sd.combined_schedule || []

  if (!components.length && !combinedSchedule.length) return ''

  // Combined Schedule — dynamic column headers
  let combinedHTML = ''
  if (combinedSchedule.length) {
    const headers = Object.keys(combinedSchedule[0])
    combinedHTML = `
      <div class="dosing-subsection">
        <h3 class="dosing-subsection-label">Combined Protocol Schedule</h3>
        <div class="dosing-table-wrap">
          <table class="dosing-table">
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${combinedSchedule.map(row => `
                <tr>${headers.map((h, i) => `<td${i === 0 ? ' class="protocol-label"' : ''}>${row[h] || '—'}</td>`).join('')}</tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>`
  }

  // Per-component breakdown
  let componentsHTML = ''
  if (components.length) {
    const compCards = components.map(comp => {
      const compHeaders = comp.dosing_table?.[0] ? Object.keys(comp.dosing_table[0]) : []
      const compTableHTML = comp.dosing_table?.length && compHeaders.length
        ? `<div class="dosing-table-wrap">
            <table class="dosing-table">
              <thead><tr>${compHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>
              <tbody>${comp.dosing_table.map(row => `
                <tr>${compHeaders.map((h, i) => `<td${i === 0 ? ' class="protocol-label"' : ''}>${row[h] || '—'}</td>`).join('')}</tr>`
              ).join('')}</tbody>
            </table>
          </div>`
        : ''
      const reconStepsHTML = (comp.reconstitution_steps || []).length
        ? `<ol class="recon-steps">${comp.reconstitution_steps.map(s => `<li>${s}</li>`).join('')}</ol>`
        : ''
      return `
        <div class="stack-component-card">
          <div class="stack-component-header">
            <span class="stack-component-name">${comp.name}</span>
            ${comp.vial_strength ? `<span class="pep-vial-badge">${comp.vial_strength}</span>` : ''}
          </div>
          ${comp.route_or_frequency ? `<div class="stack-component-route">${comp.route_or_frequency}</div>` : ''}
          ${comp.reconstitution ? `<p class="stack-component-recon">${comp.reconstitution}</p>` : ''}
          ${compTableHTML}
          ${reconStepsHTML}
        </div>`
    }).join('')

    componentsHTML = `
      <div class="dosing-subsection">
        <h3 class="dosing-subsection-label">Component Details</h3>
        <div class="stack-components-grid">${compCards}</div>
      </div>`
  }

  return `
    <div id="stack-details" class="pep-section-block">
      <h2 class="section-heading">Stack Protocol Details</h2>
      <div class="dosing-subsections">
        ${combinedHTML}
        ${componentsHTML}
      </div>
    </div>`
}

function renderStackPage() {
  if (!stackData) return

  const params    = new URLSearchParams(window.location.search)
  const slugParam = params.get('slug')
  const contentEl = document.getElementById('stack-content')
  if (!slugParam || !contentEl) return

  const stack = stackByRouteSlug.get(slugParam)

  contentEl.classList.remove('pep-loading-state')

  if (!stack) {
    contentEl.innerHTML = `<div class="peptide-page"><p class="pep-not-found">Stack not found.</p></div>`
    return
  }

  document.title = stack.seo?.title || `${stack.name} — PeptideGuidelines`
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc && stack.seo?.description) metaDesc.setAttribute('content', stack.seo.description)

  const otherVials = jsonStacks
    .filter(os => os.slug === stack.slug && os.id !== stack.id)
    .map(os => ({ name: os.vial_strength, routeSlug: getStackRouteSlug(os) }))

  const disclaimer      = stackData.global_disclaimer || ''
  const hasStackDetails = (stack.stack_details?.components?.length || 0) + (stack.stack_details?.combined_schedule?.length || 0) > 0

  contentEl.innerHTML = `
    <div class="peptide-page">
      <div class="pep-layout">
        ${renderDetailTOC(hasStackDetails)}
        <div class="pep-main">
          ${renderStackHero(stack, otherVials, hasStackDetails)}
          ${renderGlobalDisclaimer(disclaimer)}
          ${renderOverviewAccordion(stack)}
          ${renderSuppliesSection(stack)}
          ${renderDosingSection(stack)}
          ${hasStackDetails ? renderStackDetailsSection(stack) : ''}
          ${renderStorageSection(stack)}
          ${renderResearchSection(stack)}
          ${renderStackCalcSection(stack)}
        </div>
      </div>
    </div>`

  initAccordion()
  initTOCLinks()
  initTOCScroll()
  initRevealObserver(contentEl.querySelectorAll('.pep-section-block'), 80)

  const stackPresets = window.CALC_PRESETS && window.CALC_PRESETS[stack.slug]
  const components   = (stackPresets && stackPresets.components) || []

  if (components.length && typeof renderSidebarCalculator === 'function') {
    // Inline section (shown on mobile): two side-by-side compact calcs
    components.forEach((slug, i) => {
      const el = document.getElementById(`stack-sb-calc-${i}`)
      const compPresets  = window.CALC_PRESETS && window.CALC_PRESETS[slug]
      const displayName  = (compPresets && compPresets.baseName) || slug
      if (el) renderSidebarCalculator(el, { slug, displayName })
    })

    // Sidebar (shown on desktop): two stacked compact calcs
    const sidebarCalcEl = document.getElementById('pep-sidebar-calc')
    if (sidebarCalcEl) {
      sidebarCalcEl.innerHTML = components.map((_, i) =>
        `<div id="pep-sidebar-calc-comp-${i}"></div>`
      ).join('')
      components.forEach((slug, i) => {
        const el = document.getElementById(`pep-sidebar-calc-comp-${i}`)
        const compPresets = window.CALC_PRESETS && window.CALC_PRESETS[slug]
        const displayName = (compPresets && compPresets.baseName) || slug
        if (el) renderSidebarCalculator(el, { slug, displayName })
      })
    }
  } else {
    // Fallback: single inline + single sidebar calculator
    const calcContainer = document.getElementById('pep-calc-container')
    if (calcContainer && typeof renderInlineCalculator === 'function') {
      renderInlineCalculator(calcContainer, { initialSlug: stack.slug, mode: 'detail' })
    }

    const sidebarCalcEl = document.getElementById('pep-sidebar-calc')
    if (sidebarCalcEl && typeof renderSidebarCalculator === 'function') {
      renderSidebarCalculator(sidebarCalcEl, { slug: stack.slug, displayName: stack.base_name || stack.name })
    }
  }

  _detailPageInfo = { type: 'stack', slug: stack.slug, name: stack.base_name || stack.name }
  _trackRecentlyViewed('stack', stack.slug, stack.base_name || stack.name)
  _trackEvent('detail_view', { item_type: 'stack', item_slug: stack.slug })
}

function initAccordion() {
  document.querySelectorAll('.accordion-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.accordion-item')
      const isOpen = item.classList.contains('open')
      document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('open')
        i.querySelector('.accordion-header')?.setAttribute('aria-expanded', 'false')
      })
      if (!isOpen) {
        item.classList.add('open')
        btn.setAttribute('aria-expanded', 'true')
      }
    })
  })
}

function initTOCLinks() {
  document.querySelectorAll('.toc-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const target = document.querySelector(link.getAttribute('href'))
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })
}

function initTOCScroll() {
  const links = document.querySelectorAll('.toc-link')
  if (!links.length) return

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => {
          l.classList.toggle('toc-active', l.getAttribute('href') === `#${entry.target.id}`)
        })
      }
    })
  }, { rootMargin: '-5% 0px -80% 0px', threshold: 0 })

  document.querySelectorAll('.pep-section-block').forEach(el => observer.observe(el))
}

// ── NAV + INIT ────────────────────────────────────────────────────────────────

function closeAllNavDropdowns() {
  document.querySelectorAll('.nav-dropdown').forEach(d => {
    d.classList.remove('open')
    d.querySelector('.nav-btn')?.setAttribute('aria-expanded', 'false')
  })
}

function initNavDropdowns() {
  // ── Dropdown toggle (desktop + mobile inline) ──
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    const btn  = dropdown.querySelector('.nav-btn')
    const menu = dropdown.querySelector('.dropdown-menu')
    if (btn && menu) {
      if (!menu.id) menu.id = 'nav-submenu-' + Math.random().toString(36).slice(2, 8)
      btn.setAttribute('aria-expanded', 'false')
      btn.setAttribute('aria-controls', menu.id)
    }
    btn.addEventListener('click', e => {
      e.stopPropagation()
      const isOpen = dropdown.classList.contains('open')
      closeAllNavDropdowns()
      if (!isOpen) {
        dropdown.classList.add('open')
        btn.setAttribute('aria-expanded', 'true')
      }
    })
  })

  document.addEventListener('click', e => {
    const nav = document.getElementById('main-nav')
    if (nav && nav.contains(e.target)) return
    closeAllNavDropdowns()
  })

  // ── Hamburger toggle ──
  const hamburger = document.getElementById('nav-hamburger')
  const header    = hamburger ? hamburger.closest('.header') : null
  if (!hamburger || !header) return

  function closeMobileNav() {
    header.classList.remove('nav-open')
    document.body.classList.remove('nav-open')
    hamburger.setAttribute('aria-expanded', 'false')
    hamburger.setAttribute('aria-label', 'Open navigation menu')
    closeAllNavDropdowns()
  }

  hamburger.addEventListener('click', e => {
    e.stopPropagation()
    const opening = !header.classList.contains('nav-open')
    header.classList.toggle('nav-open')
    document.body.classList.toggle('nav-open')
    hamburger.setAttribute('aria-expanded', String(opening))
    hamburger.setAttribute('aria-label', opening ? 'Close navigation menu' : 'Open navigation menu')
  })

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && header.classList.contains('nav-open')) {
      closeMobileNav()
      hamburger.focus()
    }
  })

  // Close nav when a leaf link is tapped on mobile. Delegated (not bound per-element) so it
  // keeps working for dropdown content that gets re-rendered after data loads (e.g. the
  // Peptides mega-menu, which is (re)populated asynchronously as JSON arrives).
  const MOBILE_CLOSE_LINK_SELECTOR = '.nav-link, .dropdown-item, .dropdown-col-header, .dropdown-col-viewall'
  document.getElementById('main-nav')?.addEventListener('click', e => {
    if (window.innerWidth > 768) return
    if (e.target.closest(MOBILE_CLOSE_LINK_SELECTOR)) closeMobileNav()
  })

  // Snap back to desktop state on resize
  window.addEventListener('resize', () => { if (window.innerWidth > 768) closeMobileNav() })
}

// ── ANALYTICS PLACEHOLDER ─────────────────────────────────────────────────────
// Called only after the user accepts cookies.
// Wire up GA4, Plausible, or another provider here when ready.
function initAnalytics() {
  // TODO: initialize analytics provider
  // Example (GA4):
  //   const s = document.createElement('script')
  //   s.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX'
  //   s.async = true
  //   document.head.appendChild(s)
  //   window.dataLayer = window.dataLayer || []
  //   function gtag(){ dataLayer.push(arguments) }
  //   gtag('js', new Date()); gtag('config', 'G-XXXXXXXX')
}

// ── COOKIE CONSENT BANNER ─────────────────────────────────────────────────────
function initCookieBanner() {
  if (localStorage.getItem('cookieConsent')) {
    if (localStorage.getItem('cookieConsent') === 'accepted') initAnalytics()
    return
  }

  const banner = document.createElement('div')
  banner.id = 'cookie-banner'
  banner.className = 'cookie-banner'
  banner.setAttribute('role', 'region')
  banner.setAttribute('aria-label', 'Cookie consent')
  banner.innerHTML = `
    <p class="cookie-banner-text">We use cookies and analytics to improve the research experience and understand site usage.</p>
    <div class="cookie-banner-actions">
      <button class="cookie-btn-decline" id="cookie-decline">Decline</button>
      <button class="cookie-btn-accept" id="cookie-accept">Accept</button>
    </div>`
  document.body.appendChild(banner)

  requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('is-visible')))

  function dismiss(choice) {
    localStorage.setItem('cookieConsent', choice)
    banner.classList.remove('is-visible')
    setTimeout(() => banner.remove(), 300)
    if (choice === 'accepted') initAnalytics()
  }

  document.getElementById('cookie-accept').addEventListener('click', () => dismiss('accepted'))
  document.getElementById('cookie-decline').addEventListener('click', () => dismiss('declined'))
}

// ── CONTACT MODAL ─────────────────────────────────────────────────────────────
let _contactModalPreviousFocus = null

function openContactModal() {
  _contactModalPreviousFocus = document.activeElement
  const modal = document.getElementById('contact-modal')
  if (!modal) return
  modal.classList.add('is-open')
  document.body.classList.add('modal-open')
  const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]')
  if (firstFocusable) firstFocusable.focus()
}

function closeContactModal() {
  const modal = document.getElementById('contact-modal')
  if (!modal) return
  modal.classList.remove('is-open')
  document.body.classList.remove('modal-open')
  if (_contactModalPreviousFocus) {
    _contactModalPreviousFocus.focus()
    _contactModalPreviousFocus = null
  }
  setTimeout(() => {
    const form    = modal.querySelector('#contact-form')
    const success = modal.querySelector('#contact-success')
    if (form)    { form.hidden = false; form.reset() }
    if (success) { success.hidden = true }
  }, 220)
}

function initContactModal() {
  const modal = document.createElement('div')
  modal.id = 'contact-modal'
  modal.className = 'modal-overlay'
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')
  modal.setAttribute('aria-labelledby', 'contact-modal-title')
  modal.innerHTML = `
    <div class="modal-panel">
      <div class="modal-header">
        <h2 id="contact-modal-title" class="modal-title">Contact PeptideGuidelines</h2>
        <button class="modal-close" aria-label="Close dialog">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <p class="modal-subtitle">Have a question, or interested in login or sign-up access? We'd love to hear from you.</p>
      <form class="modal-form" id="contact-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="contact-name">Name</label>
          <input class="form-input" type="text" id="contact-name" name="name" autocomplete="name" placeholder="Your name" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="contact-email">Email</label>
          <input class="form-input" type="email" id="contact-email" name="email" autocomplete="email" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="contact-interest">I'm reaching out about</label>
          <select class="form-select" id="contact-interest" name="interest">
            <option value="general">General Contact</option>
            <option value="login">Login Access</option>
            <option value="signup">Sign Up Interest</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="contact-message">Message</label>
          <textarea class="form-input form-textarea" id="contact-message" name="message" placeholder="How can we help?" rows="4" required></textarea>
        </div>
        <p class="form-error" id="contact-error"></p>
        <button class="form-submit" type="submit">Send Message</button>
      </form>
      <div class="modal-success" id="contact-success" hidden>
        <div class="modal-success-icon" aria-hidden="true">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3>Message received</h3>
        <p>Thanks for reaching out. We'll be in touch soon.</p>
      </div>
    </div>`
  document.body.appendChild(modal)

  // Backdrop click closes modal
  modal.addEventListener('click', e => { if (e.target === modal) closeContactModal() })

  // Close button
  modal.querySelector('.modal-close').addEventListener('click', closeContactModal)

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeContactModal()
  })

  // Basic focus trap — keep Tab inside the panel
  modal.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return
    const focusable = Array.from(modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter(el => !el.disabled)
    if (!focusable.length) return
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus()
    }
  })

  // Form submit — Supabase insert
  document.getElementById('contact-form').addEventListener('submit', async e => {
    e.preventDefault()
    const btn   = e.target.querySelector('.form-submit')
    const errEl = document.getElementById('contact-error')
    errEl.textContent = ''
    btn.disabled = true
    btn.textContent = 'Sending…'
    const { data: { user } } = await _supabase.auth.getUser()
    const { error } = await _supabase.from('contact_submissions').insert([{
      name:          document.getElementById('contact-name').value.trim(),
      email:         document.getElementById('contact-email').value.trim(),
      interest_type: document.getElementById('contact-interest').value,
      message:       document.getElementById('contact-message').value.trim(),
      user_id:       user?.id ?? null,
      page_source:   window.location.pathname + window.location.search,
    }])
    btn.disabled = false
    btn.textContent = 'Send Message'
    if (error) {
      console.error('Contact form error:', error)
      errEl.textContent = 'Something went wrong. Please try again.'
      return
    }
    document.getElementById('contact-form').hidden = true
    document.getElementById('contact-success').hidden = false
  })

  // Inject Contact button into every .nav on the page
  document.querySelectorAll('.nav').forEach(nav => {
    const btn = document.createElement('button')
    btn.className = 'nav-contact-btn'
    btn.textContent = 'Contact'
    btn.addEventListener('click', openContactModal)
    nav.appendChild(btn)
  })

  // Wire footer Contact links (href="#" with text "Contact")
  document.querySelectorAll('.footer-col a').forEach(a => {
    if (a.textContent.trim() === 'Contact') {
      a.addEventListener('click', e => { e.preventDefault(); openContactModal() })
    }
  })
}

// ── AUTH ─────────────────────────────────────────────────────────────────────

function updateNavAuth(session) {
  _currentUser = session?.user ?? null
  if (_currentUser) { _loadUserFavorites(); renderSavedCalcs() }
  else { _userFavorites = new Set(); renderSavedCalcs() }
  document.querySelectorAll('.nav-auth-group').forEach(el => el.remove())
  document.querySelectorAll('.nav').forEach(nav => {
    const group = document.createElement('div')
    group.className = 'nav-auth-group'
    if (session) {
      const email   = session.user.email || ''
      const display = email.length > 22 ? email.slice(0, 20) + '…' : email
      group.innerHTML = `
        <span class="nav-user-email">${display}</span>
        <button class="nav-auth-btn nav-auth-btn--secondary nav-logout-btn">Log Out</button>
      `
      group.querySelector('.nav-logout-btn').addEventListener('click', () => _supabase.auth.signOut())
    } else {
      group.innerHTML = `
        <button class="nav-auth-btn nav-auth-btn--secondary nav-login-open-btn">Log In</button>
        <button class="nav-auth-btn nav-auth-btn--primary nav-signup-open-btn">Sign Up</button>
      `
      group.querySelector('.nav-login-open-btn').addEventListener('click', openLoginModal)
      group.querySelector('.nav-signup-open-btn').addEventListener('click', openSignupModal)
    }
    nav.appendChild(group)
  })
}

// ── FAVORITES ────────────────────────────────────────────────────────────────

async function renderSavedCalcs() {
  const section  = document.getElementById('saved-calcs-section')
  const listEl   = document.getElementById('saved-calcs-list')
  if (!section || !listEl) return

  if (!_currentUser) { section.hidden = true; return }
  section.hidden = false

  listEl.innerHTML = '<p class="saved-calcs-loading">Loading…</p>'

  const { data, error } = await _supabase
    .from('saved_calculations')
    .select('*')
    .eq('user_id', _currentUser.id)
    .order('created_at', { ascending: false })

  if (error) {
    listEl.innerHTML = '<p class="saved-calcs-empty">Could not load saved calculations.</p>'
    return
  }

  if (!data || data.length === 0) {
    listEl.innerHTML = '<p class="saved-calcs-empty">No saved calculations yet. Fill in the calculator above and click "Save calculation."</p>'
    return
  }

  listEl.innerHTML = data.map(c => {
    const date     = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const doseDisp = c.dose_value < 1000
      ? `${Math.round(c.dose_value)} mcg`
      : `${(c.dose_value / 1000).toFixed(2).replace(/\.?0+$/, '')} mg`
    const concDisp = Number(c.concentration_mg_ml).toFixed(2).replace(/\.?0+$/, '') + ' mg/mL'
    return `
      <div class="saved-calc-card" data-id="${c.id}">
        <div class="saved-calc-top">
          <div class="saved-calc-name">${c.peptide_name || c.peptide_slug || '—'}</div>
          <span class="saved-calc-date">${date}</span>
        </div>
        <div class="saved-calc-values">
          <div class="saved-calc-val"><span class="saved-calc-val-label">Dose</span><span class="saved-calc-val-num">${doseDisp}</span></div>
          <div class="saved-calc-val"><span class="saved-calc-val-label">Draw to</span><span class="saved-calc-val-num">${Math.round(c.draw_units)} units</span></div>
          <div class="saved-calc-val"><span class="saved-calc-val-label">Volume</span><span class="saved-calc-val-num">${Number(c.draw_ml).toFixed(2)} mL</span></div>
          <div class="saved-calc-val"><span class="saved-calc-val-label">Concentration</span><span class="saved-calc-val-num">${concDisp}</span></div>
          <div class="saved-calc-val"><span class="saved-calc-val-label">Vial</span><span class="saved-calc-val-num">${c.vial_mg} mg / ${c.water_ml} mL water</span></div>
          ${c.doses_per_vial ? `<div class="saved-calc-val"><span class="saved-calc-val-label">Doses/vial</span><span class="saved-calc-val-num">${c.doses_per_vial}</span></div>` : ''}
        </div>
        <div class="saved-calc-actions">
          <button class="saved-calc-delete" data-id="${c.id}" aria-label="Delete saved calculation">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Delete
          </button>
        </div>
      </div>`
  }).join('')

  listEl.querySelectorAll('.saved-calc-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id
      btn.disabled = true
      btn.textContent = 'Deleting…'
      const { error } = await _supabase
        .from('saved_calculations')
        .delete()
        .eq('id', id)
        .eq('user_id', _currentUser.id)
      if (!error) renderSavedCalcs()
      else { btn.disabled = false; btn.textContent = 'Error' }
    })
  })

  const refreshBtn = document.getElementById('saved-calcs-refresh')
  if (refreshBtn) {
    refreshBtn.onclick = () => renderSavedCalcs()
  }
}

async function _loadUserFavorites() {
  const { data } = await _supabase
    .from('favorite_items')
    .select('item_type, item_slug')
    .eq('user_id', _currentUser.id)
  _userFavorites = new Set((data || []).map(f => `${f.item_type}:${f.item_slug}`))
  const btn = document.getElementById('detail-fav-btn')
  if (btn) _updateFavBtn(btn)
  // If auth resolved after the detail page already rendered, track the view now
  if (_detailPageInfo) _trackRecentlyViewed(_detailPageInfo.type, _detailPageInfo.slug, _detailPageInfo.name)
}

function _updateFavBtn(btn) {
  const isFav = _userFavorites.has(`${btn.dataset.type}:${btn.dataset.slug}`)
  btn.classList.toggle('is-favorited', isFav)
  btn.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites')
  const label = btn.querySelector('.fav-btn-label')
  if (label) label.textContent = isFav ? 'Saved' : 'Save'
}

async function _toggleFavorite(btn, itemName) {
  if (!_currentUser) { openLoginModal(); return }
  const { type, slug } = btn.dataset
  const key   = `${type}:${slug}`
  const isFav = _userFavorites.has(key)
  if (isFav) _userFavorites.delete(key)
  else _userFavorites.add(key)
  _updateFavBtn(btn)
  if (isFav) {
    await _supabase.from('favorite_items').delete()
      .eq('user_id', _currentUser.id).eq('item_type', type).eq('item_slug', slug)
  } else {
    await _supabase.from('favorite_items').insert({
      user_id: _currentUser.id, item_type: type, item_slug: slug, item_name: itemName
    })
  }
}

// ── RECENTLY VIEWED ───────────────────────────────────────────────────────────

async function _trackRecentlyViewed(type, slug, name) {
  if (!_currentUser) return
  await _supabase.from('recently_viewed').delete()
    .eq('user_id', _currentUser.id).eq('item_type', type).eq('item_slug', slug)
  await _supabase.from('recently_viewed').insert({
    user_id: _currentUser.id, item_type: type, item_slug: slug, item_name: name
  })
}

// The search dropdown visually overlaps the hero's browse link below the search bar — hide it while open.
function setHeroBelowSearchHidden(hidden) {
  document.querySelectorAll('.hero-secondary-link').forEach(el => {
    el.classList.toggle('is-hidden', hidden)
  })
}

function showBrowseDropdown() {
  const dropEl = document.getElementById('search-dropdown')
  if (!dropEl) return

  const pepSource  = jsonPeptides.length ? jsonPeptides : peptides
  const popularPeps = POPULAR_PEPTIDE_IDS
    .map(id => pepSource.find(p => (p.slug || p.id || '') === id || p.name.toLowerCase() === id))
    .filter(Boolean)
  const popularSet = new Set(popularPeps.map(p => p.name))
  const restPeps   = pepSource.filter(p => !popularSet.has(p.name))
  const pepItems   = [...popularPeps, ...restPeps].slice(0, 6)
  const blendItems = jsonBlends.slice(0, 3)
  const stackItems = (jsonStacks.length ? jsonStacks : stacks).slice(0, 3)

  const rows = []
  for (const p of pepItems) {
    const href = p.routeSlug ? `peptide.html?slug=${p.routeSlug}` : `peptide.html?slug=${p.id}`
    rows.push({ name: p.name, href, badge: 'Peptide' })
  }
  for (const b of blendItems) {
    rows.push({ name: b.base_name || b.name || '', href: `blend.html?slug=${getBlendRouteSlug(b)}`, badge: 'Blend' })
  }
  for (const s of stackItems) {
    const href = jsonStacks.length ? `stack.html?slug=${getStackRouteSlug(s)}` : `#${s.id}`
    rows.push({ name: s.base_name || s.name || '', href, badge: 'Stack' })
  }

  if (!rows.length) return

  dropEl.innerHTML =
    `<div class="search-dropdown-label">Popular</div>` +
    rows.map(r => `<a class="search-dropdown-item" href="${r.href}" role="option">
      <span class="search-dropdown-name">${r.name}</span>
      <span class="search-dropdown-badge">${r.badge}</span>
    </a>`).join('') +
    `<div class="search-dropdown-more" role="button" tabindex="0">See all peptides, stacks &amp; blends ↓</div>`

  dropEl.hidden = false
  setHeroBelowSearchHidden(true)

  const moreEl = dropEl.querySelector('.search-dropdown-more')
  if (moreEl) {
    const scrollToResults = () => {
      dropEl.hidden = true
      const resultsEl = document.getElementById('results') || document.getElementById('featured')
      if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    moreEl.addEventListener('click', scrollToResults)
    moreEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') scrollToResults() })
  }
}

async function showRecentlyViewedInDropdown() {
  const dropEl = document.getElementById('search-dropdown')
  if (!dropEl || !_currentUser) return

  const { data, error } = await _supabase
    .from('recently_viewed')
    .select('*')
    .eq('user_id', _currentUser.id)
    .order('viewed_at', { ascending: false })
    .limit(6)

  if (error || !data || data.length === 0) return

  const clockSvg = `<svg class="rv-clock-icon" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2"/></svg>`

  dropEl.innerHTML = data.map(item => {
    const href = item.item_type === 'blend'
      ? `blend.html?slug=${item.item_slug}`
      : item.item_type === 'stack'
        ? `stack.html?slug=${item.item_slug}`
        : `peptide.html?slug=${item.item_slug}`
    return `<a class="search-dropdown-item" href="${href}" role="option">
      ${clockSvg}
      <span class="search-dropdown-name">${item.item_name || item.item_slug}</span>
      <span class="search-dropdown-badge">${item.item_type}</span>
    </a>`
  }).join('')

  dropEl.hidden = false
  setHeroBelowSearchHidden(true)
}

// ── ANALYTICS EVENTS ──────────────────────────────────────────────────────────

function _trackEvent(eventType, eventData = {}) {
  _supabase.from('analytics_events').insert({
    user_id:    _currentUser?.id ?? null,
    event_type: eventType,
    event_data: eventData,
    page:       window.location.pathname + window.location.search,
  }).then(() => {})
}

let _authModalPreviousFocus = null

function openLoginModal() {
  _authModalPreviousFocus = document.activeElement
  const modal = document.getElementById('login-modal')
  if (!modal) return
  modal.classList.add('is-open')
  document.body.classList.add('modal-open')
  const first = modal.querySelector('input')
  if (first) first.focus()
}

function closeLoginModal() {
  const modal = document.getElementById('login-modal')
  if (!modal) return
  modal.classList.remove('is-open')
  document.body.classList.remove('modal-open')
  if (_authModalPreviousFocus) { _authModalPreviousFocus.focus(); _authModalPreviousFocus = null }
  setTimeout(() => {
    const form = modal.querySelector('#login-form')
    const err  = modal.querySelector('#login-error')
    if (form) { form.hidden = false; form.reset() }
    if (err)  err.textContent = ''
  }, 220)
}

function openSignupModal() {
  _authModalPreviousFocus = document.activeElement
  const modal = document.getElementById('signup-modal')
  if (!modal) return
  modal.classList.add('is-open')
  document.body.classList.add('modal-open')
  const first = modal.querySelector('input')
  if (first) first.focus()
}

function closeSignupModal() {
  const modal = document.getElementById('signup-modal')
  if (!modal) return
  modal.classList.remove('is-open')
  document.body.classList.remove('modal-open')
  if (_authModalPreviousFocus) { _authModalPreviousFocus.focus(); _authModalPreviousFocus = null }
  setTimeout(() => {
    const form = modal.querySelector('#signup-form')
    const err  = modal.querySelector('#signup-error')
    if (form) { form.hidden = false; form.reset() }
    if (err)  err.textContent = ''
  }, 220)
}

function initAuth() {
  // ── LOGIN MODAL ──
  const loginModal = document.createElement('div')
  loginModal.id = 'login-modal'
  loginModal.className = 'modal-overlay'
  loginModal.setAttribute('role', 'dialog')
  loginModal.setAttribute('aria-modal', 'true')
  loginModal.setAttribute('aria-labelledby', 'login-modal-title')
  loginModal.innerHTML = `
    <div class="modal-panel">
      <div class="modal-header">
        <h2 id="login-modal-title" class="modal-title">Log in to PeptideGuidelines</h2>
        <button class="modal-close" aria-label="Close dialog">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <form class="modal-form" id="login-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="login-email">Email</label>
          <input class="form-input" type="email" id="login-email" name="email" autocomplete="email" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="login-password">Password</label>
          <input class="form-input" type="password" id="login-password" name="password" autocomplete="current-password" placeholder="Your password" required />
        </div>
        <p class="form-error" id="login-error"></p>
        <button class="form-submit" type="submit">Log In</button>
      </form>
      <div class="modal-success" id="login-success" hidden>
        <div class="modal-success-icon" aria-hidden="true">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3>Logged in</h3>
        <p>Welcome back.</p>
      </div>
    </div>`
  document.body.appendChild(loginModal)
  loginModal.addEventListener('click', e => { if (e.target === loginModal) closeLoginModal() })
  loginModal.querySelector('.modal-close').addEventListener('click', closeLoginModal)
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && loginModal.classList.contains('is-open')) closeLoginModal()
  })
  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault()
    const btn   = e.target.querySelector('.form-submit')
    const errEl = document.getElementById('login-error')
    errEl.textContent = ''
    btn.disabled = true
    btn.textContent = 'Logging in…'
    const { error } = await _supabase.auth.signInWithPassword({
      email:    document.getElementById('login-email').value.trim(),
      password: document.getElementById('login-password').value,
    })
    btn.disabled = false
    btn.textContent = 'Log In'
    if (error) {
      errEl.textContent = error.message || 'Login failed. Check your email and password.'
      return
    }
    document.getElementById('login-form').hidden = true
    document.getElementById('login-success').hidden = false
    setTimeout(closeLoginModal, 1200)
  })

  // ── SIGNUP MODAL ──
  const signupModal = document.createElement('div')
  signupModal.id = 'signup-modal'
  signupModal.className = 'modal-overlay'
  signupModal.setAttribute('role', 'dialog')
  signupModal.setAttribute('aria-modal', 'true')
  signupModal.setAttribute('aria-labelledby', 'signup-modal-title')
  signupModal.innerHTML = `
    <div class="modal-panel">
      <div class="modal-header">
        <h2 id="signup-modal-title" class="modal-title">Create an account</h2>
        <button class="modal-close" aria-label="Close dialog">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <form class="modal-form" id="signup-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="signup-email">Email</label>
          <input class="form-input" type="email" id="signup-email" name="email" autocomplete="email" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="signup-password">Password</label>
          <input class="form-input" type="password" id="signup-password" name="password" autocomplete="new-password" placeholder="Choose a password" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="signup-confirm">Confirm password</label>
          <input class="form-input" type="password" id="signup-confirm" name="confirm" autocomplete="new-password" placeholder="Repeat your password" required />
        </div>
        <p class="form-error" id="signup-error"></p>
        <button class="form-submit" type="submit">Create Account</button>
      </form>
      <div class="modal-success" id="signup-success" hidden>
        <div class="modal-success-icon" aria-hidden="true">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3>Account created</h3>
        <p>Check your email to confirm your address.</p>
      </div>
    </div>`
  document.body.appendChild(signupModal)
  signupModal.addEventListener('click', e => { if (e.target === signupModal) closeSignupModal() })
  signupModal.querySelector('.modal-close').addEventListener('click', closeSignupModal)
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && signupModal.classList.contains('is-open')) closeSignupModal()
  })
  document.getElementById('signup-form').addEventListener('submit', async e => {
    e.preventDefault()
    const btn      = e.target.querySelector('.form-submit')
    const errEl    = document.getElementById('signup-error')
    errEl.textContent = ''
    const password = document.getElementById('signup-password').value
    const confirm  = document.getElementById('signup-confirm').value
    if (password !== confirm) {
      errEl.textContent = 'Passwords do not match.'
      return
    }
    if (password.length < 6) {
      errEl.textContent = 'Password must be at least 6 characters.'
      return
    }
    btn.disabled = true
    btn.textContent = 'Creating account…'
    const { error } = await _supabase.auth.signUp({
      email:    document.getElementById('signup-email').value.trim(),
      password,
    })
    btn.disabled = false
    btn.textContent = 'Create Account'
    if (error) {
      errEl.textContent = error.message || 'Sign up failed. Please try again.'
      return
    }
    document.getElementById('signup-form').hidden = true
    document.getElementById('signup-success').hidden = false
  })

  // ── SESSION STATE ──
  _supabase.auth.getSession().then(({ data: { session } }) => updateNavAuth(session))
  _supabase.auth.onAuthStateChange((_event, session) => updateNavAuth(session))
}

document.addEventListener('DOMContentLoaded', () => {
  initNavDropdowns()
  populatePeptidesDropdown()
  initCookieBanner()
  initContactModal()
  initAuth()
  loadPeptideData()
  loadBlendData()
  loadStackData()

  if (document.querySelector('.why-section')) {
    initStaticPageReveals()
  }

  if (document.getElementById('filter-pills')) {
    initFilters()
    initFeatured()
    initStacksFeatured()
    initBlendsFeatured()
    initSectionReveals()
    render()

    const searchEl = document.getElementById('search')
    if (searchEl) {
      searchEl.addEventListener('focus', () => {
        setHeroBelowSearchHidden(true)
        if (!searchEl.value.trim()) {
          if (_currentUser) showRecentlyViewedInDropdown()
          else showBrowseDropdown()
        }
      })

      searchEl.addEventListener('input', e => {
        searchQuery = e.target.value
        render()
        updateSearchDropdown(searchQuery)
      })

      searchEl.addEventListener('keydown', e => {
        const dropEl = document.getElementById('search-dropdown')
        if (e.key === 'Escape') {
          closeSearchDropdown()
          searchEl.blur()
        } else if (e.key === 'ArrowDown' && dropEl && !dropEl.hidden) {
          e.preventDefault()
          const first = dropEl.querySelector('.search-dropdown-item')
          if (first) first.focus()
        }
      })
    }

    document.addEventListener('click', e => {
      const dropEl = document.getElementById('search-dropdown')
      if (!dropEl || dropEl.hidden) return
      if (!dropEl.contains(e.target) && e.target !== searchEl) {
        closeSearchDropdown()
      }
    })
  }
})

function closeSearchDropdown() {
  const dropEl = document.getElementById('search-dropdown')
  if (dropEl) dropEl.hidden = true
  setHeroBelowSearchHidden(false)
}

function updateSearchDropdown(q) {
  const dropEl = document.getElementById('search-dropdown')
  if (!dropEl) return

  if (!q || q.trim().length === 0) {
    dropEl.hidden = true
    setHeroBelowSearchHidden(false)
    return
  }

  const qNorm    = normalizeSearchText(q)
  const qKey     = q.toLowerCase().trim()
  const synTerms = SEARCH_SYNONYMS[qKey] || SEARCH_SYNONYMS[qNorm] || []

  const scored = searchIndex
    .map(item => ({ item, score: scoreSearchItem(item, qNorm, synTerms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  if (scored.length === 0) {
    dropEl.innerHTML = `<div class="search-dropdown-empty">No results — try: <em>healing, fat loss, sleep, skin, muscle, gut health</em></div>`
    dropEl.hidden = false
    setHeroBelowSearchHidden(true)
    return
  }

  const MAX     = 15
  const visible = scored.slice(0, MAX)
  const total   = scored.length

  dropEl.innerHTML =
    visible.map(({ item }) => `<a class="search-dropdown-item" href="${item.href}" role="option">
      <span class="search-dropdown-name">${item.name}</span>
      <span class="search-dropdown-badge">${item.badge}</span>
    </a>`).join('') +
    (total > MAX
      ? `<div class="search-dropdown-more" role="button" tabindex="0">See all ${total} results ↓</div>`
      : '')

  dropEl.hidden = false
  setHeroBelowSearchHidden(true)

  const moreEl = dropEl.querySelector('.search-dropdown-more')
  if (moreEl) {
    const scrollToResults = () => {
      dropEl.hidden = true
      const resultsEl = document.getElementById('results')
      if (resultsEl) resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    moreEl.addEventListener('click', scrollToResults)
    moreEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') scrollToResults() })
  }
}

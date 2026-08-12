// Calculator preset data — sourced from each peptide's dosing_and_reconstitution
// section in the JSON library files.
// Keys match the `slug` field in peptide_frontend_library_v2.json and
// peptide_blends_frontend_library.json / peptide_stacks_frontend_library.json.
//
// Dose presets use neutral language ("Normal" / "High") and reflect common
// research ranges from the protocol data. This is not medical advice.
// If no clear Normal/High range is available, dosePresets is null and the
// calculator falls back to manual-entry mode for that peptide.
//
// vialOptions: available vial sizes in mg
// waterOptions: available BAC water amounts in mL
// doseOptions: available dose amounts in mcg (values >= 1000 are displayed as mg)
// doseUnit: always 'mcg' internally; display logic converts >= 1000 to mg

window.CALC_PRESETS = {

  // ─── SINGLE PEPTIDES ──────────────────────────────────────────────────────

  '5-amino-1mq': {
    baseName: '5-Amino-1MQ',
    defaultVialMg: 10,
    defaultBacWaterMl: 2.0,
    vialOptions: [10],
    waterOptions: [1, 2, 3],
    doseOptions: [1250, 2500, 3750, 5000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 2.0, valueMcg: 2500, label: 'Normal' },
      high:   { vialMg: 10, waterMl: 2.0, valueMcg: 5000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'adamax': {
    baseName: 'Adamax',
    defaultVialMg: 10,
    defaultBacWaterMl: 3.0,
    vialOptions: [10],
    waterOptions: [2, 3, 5],
    doseOptions: [300, 500, 750, 1000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 3.0, valueMcg: 300,  label: 'Normal' },
      high:   { vialMg: 10, waterMl: 3.0, valueMcg: 1000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'adipotide': {
    baseName: 'Adipotide',
    defaultVialMg: 10,
    defaultBacWaterMl: 3.0,
    vialOptions: [10],
    waterOptions: [2, 3, 5],
    doseOptions: [250, 500, 750, 1000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 3.0, valueMcg: 250,  label: 'Normal' },
      high:   { vialMg: 10, waterMl: 3.0, valueMcg: 1000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'aicar': {
    baseName: 'AICAR',
    defaultVialMg: 50,
    defaultBacWaterMl: 3.0,
    vialOptions: [50],
    waterOptions: [3, 5],
    doseOptions: [1000, 2000, 3000, 5000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 50, waterMl: 3.0, valueMcg: 1000, label: 'Normal' },
      high:   { vialMg: 50, waterMl: 3.0, valueMcg: 3000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'aod-9604': {
    baseName: 'AOD-9604',
    defaultVialMg: 2,
    defaultBacWaterMl: 3.0,
    vialOptions: [2, 5],
    waterOptions: [1, 2, 3],
    doseOptions: [150, 200, 250, 300, 500],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 2, waterMl: 3.0, valueMcg: 300, label: 'Normal' },
      high:   { vialMg: 2, waterMl: 3.0, valueMcg: 500, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'ara-290': {
    baseName: 'ARA-290',
    defaultVialMg: 16,
    defaultBacWaterMl: 2.0,
    vialOptions: [16],
    waterOptions: [2, 3],
    doseOptions: [1000, 2000, 3000, 4000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 16, waterMl: 2.0, valueMcg: 2000, label: 'Normal' },
      high:   { vialMg: 16, waterMl: 2.0, valueMcg: 4000, label: 'High' }
    },
    defaultFrequencyPerWeek: 3,
    defaultSyringeType: 'U-100'
  },

  'bpc-157': {
    baseName: 'BPC-157',
    defaultVialMg: 5,
    defaultBacWaterMl: 3.0,
    vialOptions: [2.5, 5, 10],
    waterOptions: [1, 2, 3, 5],
    doseOptions: [100, 150, 200, 250, 300, 500, 750, 1000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 3.0, valueMcg: 200, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 3.0, valueMcg: 600, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'cagrilintide': {
    baseName: 'Cagrilintide',
    defaultVialMg: 5,
    defaultBacWaterMl: 1.0,
    vialOptions: [5],
    waterOptions: [1, 2, 3],
    doseOptions: [600, 1200, 2400, 4500],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 1.0, valueMcg: 600,  label: 'Normal' },
      high:   { vialMg: 5, waterMl: 1.0, valueMcg: 2400, label: 'High' }
    },
    defaultFrequencyPerWeek: 1,
    defaultSyringeType: 'U-100'
  },

  'cartalax': {
    baseName: 'Cartalax',
    defaultVialMg: 20,
    defaultBacWaterMl: 3.0,
    vialOptions: [20],
    waterOptions: [2, 3, 5],
    doseOptions: [2000, 3000, 4000, 5000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 20, waterMl: 3.0, valueMcg: 2000, label: 'Normal' },
      high:   { vialMg: 20, waterMl: 3.0, valueMcg: 5000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'cerebrolysin': {
    baseName: 'Cerebrolysin',
    defaultVialMg: 60,
    defaultBacWaterMl: 3.0,
    vialOptions: [60],
    waterOptions: [3, 5],
    doseOptions: [20000, 24000, 28000, 32000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 60, waterMl: 3.0, valueMcg: 20000, label: 'Normal' },
      high:   { vialMg: 60, waterMl: 3.0, valueMcg: 28000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'chonluten': {
    baseName: 'Chonluten',
    defaultVialMg: 20,
    defaultBacWaterMl: 3.0,
    vialOptions: [20],
    waterOptions: [2, 3, 5],
    doseOptions: [250, 500, 1000, 1500],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 20, waterMl: 3.0, valueMcg: 250,  label: 'Normal' },
      high:   { vialMg: 20, waterMl: 3.0, valueMcg: 1000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'cjc-1295-dac': {
    baseName: 'CJC-1295 DAC',
    defaultVialMg: 2,
    defaultBacWaterMl: 1.0,
    vialOptions: [2, 5, 10],
    waterOptions: [1, 2, 3],
    doseOptions: [500, 1000, 1500, 2000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 2, waterMl: 1.0, valueMcg: 1000, label: 'Normal' },
      high:   { vialMg: 2, waterMl: 1.0, valueMcg: 2000, label: 'High' }
    },
    defaultFrequencyPerWeek: 1,
    defaultSyringeType: 'U-100'
  },

  'cjc-1295-no-dac': {
    baseName: 'CJC-1295 No DAC',
    defaultVialMg: 5,
    defaultBacWaterMl: 3.0,
    vialOptions: [5, 10],
    waterOptions: [2, 3],
    doseOptions: [100, 150, 200, 250, 300],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 3.0, valueMcg: 100, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 3.0, valueMcg: 250, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'cortagen': {
    baseName: 'Cortagen',
    defaultVialMg: 20,
    defaultBacWaterMl: 3.0,
    vialOptions: [20],
    waterOptions: [2, 3, 5],
    doseOptions: [1000, 2000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 20, waterMl: 3.0, valueMcg: 1000, label: 'Normal' },
      high:   { vialMg: 20, waterMl: 3.0, valueMcg: 2000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'dsip': {
    baseName: 'DSIP',
    defaultVialMg: 5,
    defaultBacWaterMl: 3.0,
    vialOptions: [5],
    waterOptions: [2, 3],
    doseOptions: [100, 150, 200, 250, 300],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 3.0, valueMcg: 100, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 3.0, valueMcg: 250, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'epitalon': {
    baseName: 'Epitalon',
    defaultVialMg: 10,
    defaultBacWaterMl: 2.0,
    vialOptions: [10],
    waterOptions: [2, 3],
    doseOptions: [1000, 2500, 5000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 2.0, valueMcg: 2500, label: 'Normal' },
      high:   { vialMg: 10, waterMl: 2.0, valueMcg: 5000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'foxo4-dri': {
    baseName: 'FOXO4-DRI',
    defaultVialMg: 10,
    defaultBacWaterMl: 3.0,
    vialOptions: [10],
    waterOptions: [2, 3, 5],
    doseOptions: [250, 375, 500],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 3.0, valueMcg: 250, label: 'Normal' },
      high:   { vialMg: 10, waterMl: 3.0, valueMcg: 500, label: 'High' }
    },
    defaultFrequencyPerWeek: 3,
    defaultSyringeType: 'U-100'
  },

  'ghk-cu': {
    baseName: 'GHK-Cu',
    defaultVialMg: 50,
    defaultBacWaterMl: 3.0,
    vialOptions: [25, 50, 100],
    waterOptions: [1, 2, 3, 5],
    doseOptions: [500, 1000, 1500, 2000, 3000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 50, waterMl: 3.0, valueMcg: 1000, label: 'Normal' },
      high:   { vialMg: 50, waterMl: 3.0, valueMcg: 2000, label: 'High' }
    },
    defaultFrequencyPerWeek: 5,
    defaultSyringeType: 'U-100'
  },

  'ghrp-2': {
    baseName: 'GHRP-2',
    defaultVialMg: 5,
    defaultBacWaterMl: 3.0,
    vialOptions: [5, 10],
    waterOptions: [2, 3, 5],
    doseOptions: [50, 100, 150, 200, 300],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 3.0, valueMcg: 100, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 3.0, valueMcg: 200, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'ghrp-6': {
    baseName: 'GHRP-6',
    defaultVialMg: 2,
    defaultBacWaterMl: 3.0,
    vialOptions: [2, 5],
    waterOptions: [2, 3, 5],
    doseOptions: [50, 100, 150, 200, 300],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 2, waterMl: 3.0, valueMcg: 100, label: 'Normal' },
      high:   { vialMg: 2, waterMl: 3.0, valueMcg: 300, label: 'High' }
    },
    defaultFrequencyPerWeek: 21,
    defaultSyringeType: 'U-100'
  },

  'glutathione': {
    baseName: 'Glutathione',
    defaultVialMg: 600,
    defaultBacWaterMl: 2.0,
    vialOptions: [600],
    waterOptions: [2, 3],
    doseOptions: [100000, 150000, 200000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 600, waterMl: 2.0, valueMcg: 100000, label: 'Normal' },
      high:   { vialMg: 600, waterMl: 2.0, valueMcg: 200000, label: 'High' }
    },
    defaultFrequencyPerWeek: 3,
    defaultSyringeType: 'U-100'
  },

  'gonadorelin': {
    baseName: 'Gonadorelin',
    defaultVialMg: 2,
    defaultBacWaterMl: 2.0,
    vialOptions: [2],
    waterOptions: [2],
    doseOptions: [50, 100, 150, 200],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 2, waterMl: 2.0, valueMcg: 50,  label: 'Normal' },
      high:   { vialMg: 2, waterMl: 2.0, valueMcg: 200, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  // HCG uses IU (not mg), so mcg-based presets are not applicable
  'hcg': {
    baseName: 'HCG',
    defaultVialMg: null,
    defaultBacWaterMl: 2.0,
    vialOptions: null,
    waterOptions: [2, 3],
    doseOptions: null,
    doseUnit: 'mcg',
    dosePresets: null,
    defaultFrequencyPerWeek: null,
    defaultSyringeType: 'U-100'
  },

  // HGH-191aa uses IU with no BAC water listed
  'hgh-191aa': {
    baseName: 'HGH 191aa',
    defaultVialMg: null,
    defaultBacWaterMl: null,
    vialOptions: null,
    waterOptions: null,
    doseOptions: null,
    doseUnit: 'mcg',
    dosePresets: null,
    defaultFrequencyPerWeek: null,
    defaultSyringeType: 'U-100'
  },

  // HMG uses IU with no BAC water listed
  'hmg': {
    baseName: 'HMG',
    defaultVialMg: null,
    defaultBacWaterMl: null,
    vialOptions: null,
    waterOptions: null,
    doseOptions: null,
    doseUnit: 'mcg',
    dosePresets: null,
    defaultFrequencyPerWeek: null,
    defaultSyringeType: 'U-100'
  },

  'igf-1-lr3': {
    baseName: 'IGF-1 LR3',
    defaultVialMg: 1,
    defaultBacWaterMl: 3.0,
    vialOptions: [0.5, 1],
    waterOptions: [1, 2, 3],
    doseOptions: [10, 20, 30, 40, 50, 80, 100],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 1, waterMl: 3.0, valueMcg: 20, label: 'Normal' },
      high:   { vialMg: 1, waterMl: 3.0, valueMcg: 50, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'ipamorelin': {
    baseName: 'Ipamorelin',
    defaultVialMg: 5,
    defaultBacWaterMl: 3.0,
    vialOptions: [2, 5, 10],
    waterOptions: [1, 2, 3],
    doseOptions: [50, 100, 150, 200, 250, 300],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 3.0, valueMcg: 100, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 3.0, valueMcg: 250, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'kisspeptin': {
    baseName: 'Kisspeptin',
    defaultVialMg: 10,
    defaultBacWaterMl: 3.0,
    vialOptions: [10],
    waterOptions: [2, 3, 5],
    doseOptions: [100, 200],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 3.0, valueMcg: 100, label: 'Normal' },
      high:   { vialMg: 10, waterMl: 3.0, valueMcg: 200, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'kpv': {
    baseName: 'KPV',
    defaultVialMg: 10,
    defaultBacWaterMl: 3.0,
    vialOptions: [10],
    waterOptions: [2, 3, 5],
    doseOptions: [200, 300, 400, 500],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 3.0, valueMcg: 200, label: 'Normal' },
      high:   { vialMg: 10, waterMl: 3.0, valueMcg: 500, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'l-carnitine': {
    baseName: 'L-Carnitine',
    defaultVialMg: 200,
    defaultBacWaterMl: 2.0,
    vialOptions: [200],
    waterOptions: [2],
    doseOptions: [50000, 75000, 100000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 200, waterMl: 2.0, valueMcg: 50000,  label: 'Normal' },
      high:   { vialMg: 200, waterMl: 2.0, valueMcg: 100000, label: 'High' }
    },
    defaultFrequencyPerWeek: 3,
    defaultSyringeType: 'U-100'
  },

  'livagen': {
    baseName: 'Livagen',
    defaultVialMg: 20,
    defaultBacWaterMl: 3.0,
    vialOptions: [20],
    waterOptions: [2, 3, 5],
    doseOptions: [500, 1000, 1500, 2000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 20, waterMl: 3.0, valueMcg: 500,  label: 'Normal' },
      high:   { vialMg: 20, waterMl: 3.0, valueMcg: 2000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'll-37': {
    baseName: 'LL-37',
    defaultVialMg: 5,
    defaultBacWaterMl: 3.0,
    vialOptions: [5],
    waterOptions: [2, 3],
    doseOptions: [50, 100, 150, 200],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 3.0, valueMcg: 50,  label: 'Normal' },
      high:   { vialMg: 5, waterMl: 3.0, valueMcg: 200, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'mazdutide': {
    baseName: 'Mazdutide',
    defaultVialMg: 5,
    defaultBacWaterMl: 1.0,
    vialOptions: [5],
    waterOptions: [1, 2, 3],
    doseOptions: [2500, 5000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 1.0, valueMcg: 2500, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 1.0, valueMcg: 5000, label: 'High' }
    },
    defaultFrequencyPerWeek: 1,
    defaultSyringeType: 'U-100'
  },

  'melanotan-ii': {
    baseName: 'Melanotan II',
    defaultVialMg: 10,
    defaultBacWaterMl: 3.0,
    vialOptions: [10],
    waterOptions: [2, 3, 5],
    doseOptions: [100, 250, 500, 750, 1000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 3.0, valueMcg: 250,  label: 'Normal' },
      high:   { vialMg: 10, waterMl: 3.0, valueMcg: 1000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'mgf': {
    baseName: 'MGF',
    defaultVialMg: 5,
    defaultBacWaterMl: 3.0,
    vialOptions: [5],
    waterOptions: [2, 3],
    doseOptions: [100, 150, 200, 250],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 3.0, valueMcg: 100, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 3.0, valueMcg: 250, label: 'High' }
    },
    defaultFrequencyPerWeek: 3,
    defaultSyringeType: 'U-100'
  },

  'mots-c': {
    baseName: 'MOTS-c',
    defaultVialMg: 5,
    defaultBacWaterMl: 3.0,
    vialOptions: [5],
    waterOptions: [2, 3],
    doseOptions: [500, 1000, 1500, 2000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 3.0, valueMcg: 500,  label: 'Normal' },
      high:   { vialMg: 5, waterMl: 3.0, valueMcg: 2000, label: 'High' }
    },
    defaultFrequencyPerWeek: 3,
    defaultSyringeType: 'U-100'
  },

  // NAD+ has no BAC water listing in research context
  'nad': {
    baseName: 'NAD+',
    defaultVialMg: null,
    defaultBacWaterMl: null,
    vialOptions: null,
    waterOptions: null,
    doseOptions: null,
    doseUnit: 'mcg',
    dosePresets: null,
    defaultFrequencyPerWeek: null,
    defaultSyringeType: 'U-100'
  },

  // Ovagen doses (10–100 µg) are too small to draw accurately on a U-100 syringe
  'ovagen': {
    baseName: 'Ovagen',
    defaultVialMg: 20,
    defaultBacWaterMl: 2.0,
    vialOptions: [20],
    waterOptions: [2, 3],
    doseOptions: null,
    doseUnit: 'mcg',
    dosePresets: null,
    defaultFrequencyPerWeek: null,
    defaultSyringeType: 'U-100'
  },

  'oxytocin': {
    baseName: 'Oxytocin',
    defaultVialMg: 5,
    defaultBacWaterMl: 3.0,
    vialOptions: [5],
    waterOptions: [2, 3],
    doseOptions: [100, 200, 300, 400],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 3.0, valueMcg: 100, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 3.0, valueMcg: 300, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'pe-22-28': {
    baseName: 'PE-22-28',
    defaultVialMg: 10,
    defaultBacWaterMl: 3.0,
    vialOptions: [10],
    waterOptions: [2, 3, 5],
    doseOptions: [50, 100, 150],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 3.0, valueMcg: 50,  label: 'Normal' },
      high:   { vialMg: 10, waterMl: 3.0, valueMcg: 150, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'peg-mgf': {
    baseName: 'PEG-MGF',
    defaultVialMg: 2,
    defaultBacWaterMl: 3.0,
    vialOptions: [2],
    waterOptions: [2, 3],
    doseOptions: [200, 300, 400, 500],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 2, waterMl: 3.0, valueMcg: 200, label: 'Normal' },
      high:   { vialMg: 2, waterMl: 3.0, valueMcg: 500, label: 'High' }
    },
    defaultFrequencyPerWeek: 3,
    defaultSyringeType: 'U-100'
  },

  'pinealon': {
    baseName: 'Pinealon',
    defaultVialMg: 20,
    defaultBacWaterMl: 3.0,
    vialOptions: [20],
    waterOptions: [2, 3, 5],
    doseOptions: [1000, 1500, 2000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 20, waterMl: 3.0, valueMcg: 1000, label: 'Normal' },
      high:   { vialMg: 20, waterMl: 3.0, valueMcg: 2000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'pnc-27': {
    baseName: 'PNC-27',
    defaultVialMg: 30,
    defaultBacWaterMl: 3.0,
    vialOptions: [30],
    waterOptions: [2, 3, 5],
    doseOptions: [100, 200, 300, 400],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 30, waterMl: 3.0, valueMcg: 100, label: 'Normal' },
      high:   { vialMg: 30, waterMl: 3.0, valueMcg: 300, label: 'High' }
    },
    defaultFrequencyPerWeek: 3,
    defaultSyringeType: 'U-100'
  },

  'prostamax': {
    baseName: 'Prostamax',
    defaultVialMg: 20,
    defaultBacWaterMl: 2.0,
    vialOptions: [20],
    waterOptions: [2, 3],
    doseOptions: [500, 750, 1000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 20, waterMl: 2.0, valueMcg: 500,  label: 'Normal' },
      high:   { vialMg: 20, waterMl: 2.0, valueMcg: 1000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'pt-141': {
    baseName: 'PT-141',
    defaultVialMg: 10,
    defaultBacWaterMl: 3.0,
    vialOptions: [10],
    waterOptions: [2, 3, 5],
    doseOptions: [250, 500, 750, 1000, 1500, 2000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 3.0, valueMcg: 500,  label: 'Normal' },
      high:   { vialMg: 10, waterMl: 3.0, valueMcg: 1500, label: 'High' }
    },
    defaultFrequencyPerWeek: 3,
    defaultSyringeType: 'U-100'
  },

  'retatrutide': {
    baseName: 'Retatrutide',
    defaultVialMg: 5,
    defaultBacWaterMl: 1.0,
    vialOptions: [5],
    waterOptions: [1, 2],
    doseOptions: [2000, 4000, 6000, 8000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 1.0, valueMcg: 2000, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 1.0, valueMcg: 4000, label: 'High' }
    },
    defaultFrequencyPerWeek: 1,
    defaultSyringeType: 'U-100'
  },

  'selank': {
    baseName: 'Selank',
    defaultVialMg: 5,
    defaultBacWaterMl: 3.0,
    vialOptions: [5],
    waterOptions: [2, 3],
    doseOptions: [300, 500],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 3.0, valueMcg: 300, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 3.0, valueMcg: 500, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'semaglutide': {
    baseName: 'Semaglutide',
    defaultVialMg: 5,
    defaultBacWaterMl: 2.0,
    vialOptions: [5, 10],
    waterOptions: [1, 2, 3, 5],
    doseOptions: [125, 250, 500, 750, 1000, 2000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 2.0, valueMcg: 250,  label: 'Normal' },
      high:   { vialMg: 5, waterMl: 2.0, valueMcg: 1000, label: 'High' }
    },
    defaultFrequencyPerWeek: 1,
    defaultSyringeType: 'U-100'
  },

  'semax': {
    baseName: 'Semax',
    defaultVialMg: 5,
    defaultBacWaterMl: 3.0,
    vialOptions: [5],
    waterOptions: [2, 3],
    doseOptions: [200, 300, 400, 500],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 3.0, valueMcg: 200, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 3.0, valueMcg: 500, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'sermorelin': {
    baseName: 'Sermorelin',
    defaultVialMg: 5,
    defaultBacWaterMl: 3.0,
    vialOptions: [5, 10],
    waterOptions: [2, 3, 5],
    doseOptions: [100, 150, 200, 300, 500],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 3.0, valueMcg: 200, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 3.0, valueMcg: 500, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'slu-pp-332': {
    baseName: 'SLU-PP-332',
    defaultVialMg: 5,
    defaultBacWaterMl: 3.0,
    vialOptions: [5],
    waterOptions: [2, 3],
    doseOptions: [1250, 2500],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 3.0, valueMcg: 1250, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 3.0, valueMcg: 2500, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'snap-8': {
    baseName: 'SNAP-8',
    defaultVialMg: 10,
    defaultBacWaterMl: 3.0,
    vialOptions: [10],
    waterOptions: [2, 3, 5],
    doseOptions: [330, 500, 1000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 3.0, valueMcg: 330,  label: 'Normal' },
      high:   { vialMg: 10, waterMl: 3.0, valueMcg: 1000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'ss-31': {
    baseName: 'SS-31',
    defaultVialMg: 10,
    defaultBacWaterMl: 1.0,
    vialOptions: [10],
    waterOptions: [1, 2],
    doseOptions: [5000, 10000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 1.0, valueMcg: 5000,  label: 'Normal' },
      high:   { vialMg: 10, waterMl: 1.0, valueMcg: 10000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'survodutide': {
    baseName: 'Survodutide',
    defaultVialMg: 10,
    defaultBacWaterMl: 2.0,
    vialOptions: [10],
    waterOptions: [1, 2, 3],
    doseOptions: [600, 1200, 1800, 2400],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 2.0, valueMcg: 600,  label: 'Normal' },
      high:   { vialMg: 10, waterMl: 2.0, valueMcg: 2400, label: 'High' }
    },
    defaultFrequencyPerWeek: 1,
    defaultSyringeType: 'U-100'
  },

  'tb-500': {
    baseName: 'TB-500',
    defaultVialMg: 5,
    defaultBacWaterMl: 3.0,
    vialOptions: [5, 10, 20],
    waterOptions: [2, 3, 5],
    doseOptions: [250, 500, 750, 1000, 1500, 2000, 5000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5,  waterMl: 3.0, valueMcg: 500,  label: 'Normal' },
      high:   { vialMg: 5,  waterMl: 3.0, valueMcg: 1000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'tesamorelin': {
    baseName: 'Tesamorelin',
    defaultVialMg: 5,
    defaultBacWaterMl: 2.5,
    vialOptions: [5, 10],
    waterOptions: [2, 2.5, 3],
    doseOptions: [500, 1000, 1500, 2000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 2.5, valueMcg: 1000, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 2.5, valueMcg: 2000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'testagen': {
    baseName: 'Testagen',
    defaultVialMg: 20,
    defaultBacWaterMl: 3.0,
    vialOptions: [20],
    waterOptions: [2, 3, 5],
    doseOptions: [100, 150, 200, 250, 300],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 20, waterMl: 3.0, valueMcg: 100, label: 'Normal' },
      high:   { vialMg: 20, waterMl: 3.0, valueMcg: 200, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'thymosin-alpha-1': {
    baseName: 'Thymosin Alpha-1',
    defaultVialMg: 5,
    defaultBacWaterMl: 3.0,
    vialOptions: [1.5, 5, 10],
    waterOptions: [1, 2, 3],
    doseOptions: [200, 300, 500, 750, 1000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 3.0, valueMcg: 300, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 3.0, valueMcg: 500, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'tirzepatide': {
    baseName: 'Tirzepatide',
    defaultVialMg: 5,
    defaultBacWaterMl: 2.0,
    vialOptions: [5, 10, 15],
    waterOptions: [1, 2, 3],
    doseOptions: [1250, 2500, 5000, 7500, 10000, 12500, 15000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 5, waterMl: 2.0, valueMcg: 2500, label: 'Normal' },
      high:   { vialMg: 5, waterMl: 2.0, valueMcg: 5000, label: 'High' }
    },
    defaultFrequencyPerWeek: 1,
    defaultSyringeType: 'U-100'
  },

  // Vesugen has no BAC water listed
  'vesugen': {
    baseName: 'Vesugen',
    defaultVialMg: 20,
    defaultBacWaterMl: null,
    vialOptions: [20],
    waterOptions: null,
    doseOptions: null,
    doseUnit: 'mcg',
    dosePresets: null,
    defaultFrequencyPerWeek: null,
    defaultSyringeType: 'U-100'
  },

  'vilon': {
    baseName: 'Vilon',
    defaultVialMg: 20,
    defaultBacWaterMl: 3.0,
    vialOptions: [20],
    waterOptions: [2, 3, 5],
    doseOptions: [67, 133, 200, 267],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 20, waterMl: 3.0, valueMcg: 67,  label: 'Normal' },
      high:   { vialMg: 20, waterMl: 3.0, valueMcg: 200, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  // ─── PEPTIDE BLENDS ───────────────────────────────────────────────────────────
  // Blends provide vial/water auto-fill, peptide-specific dose options, and
  // Normal/High presets representing conservative-start and therapeutic ranges.
  // Dose options are pre-computed as mcg = (units/100) * (vialMg/waterMl) * 1000
  // at standard reconstitution, yielding round unit counts (10u, 15u, 20u, 25u).

  'aod-9604-cjc-1295-ipamorelin': {
    baseName: 'AOD-9604 + CJC-1295 + Ipamorelin',
    defaultVialMg: 12,
    defaultBacWaterMl: 3.0,
    vialOptions: [12],
    waterOptions: [2, 3, 5],
    doseOptions: [400, 600, 800, 1000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 12, waterMl: 3.0, valueMcg: 400,  label: 'Normal' },
      high:   { vialMg: 12, waterMl: 3.0, valueMcg: 800,  label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'bpc-157-tb-500-10mg': {
    baseName: 'BPC-157 + TB-500 (10 mg)',
    defaultVialMg: 10,
    defaultBacWaterMl: 3.0,
    vialOptions: [10],
    waterOptions: [2, 3, 5],
    doseOptions: [333, 500, 667, 1000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 3.0, valueMcg: 333,  label: 'Normal' },
      high:   { vialMg: 10, waterMl: 3.0, valueMcg: 667,  label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'bpc-157-tb-500-20mg': {
    baseName: 'BPC-157 + TB-500 (20 mg)',
    defaultVialMg: 20,
    defaultBacWaterMl: 3.0,
    vialOptions: [20],
    waterOptions: [3, 5],
    doseOptions: [667, 1000, 1333, 1667],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 20, waterMl: 3.0, valueMcg: 667,  label: 'Normal' },
      high:   { vialMg: 20, waterMl: 3.0, valueMcg: 1333, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'cagrilintide-semaglutide': {
    baseName: 'Cagrilintide + Semaglutide',
    defaultVialMg: 10,
    defaultBacWaterMl: 3.0,
    vialOptions: [10],
    waterOptions: [2, 3, 5],
    doseOptions: [250, 333, 500, 667],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 3.0, valueMcg: 250,  label: 'Normal' },
      high:   { vialMg: 10, waterMl: 3.0, valueMcg: 500,  label: 'High' }
    },
    defaultFrequencyPerWeek: 1,
    defaultSyringeType: 'U-100'
  },

  'cjc-1295-ghrp-2': {
    baseName: 'CJC-1295 + GHRP-2',
    defaultVialMg: 10,
    defaultBacWaterMl: 3.0,
    vialOptions: [10],
    waterOptions: [2, 3, 5],
    doseOptions: [333, 500, 667, 1000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 3.0, valueMcg: 333,  label: 'Normal' },
      high:   { vialMg: 10, waterMl: 3.0, valueMcg: 667,  label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'cjc-1295-no-dac-ipamorelin': {
    baseName: 'CJC-1295 No DAC + Ipamorelin',
    defaultVialMg: 10,
    defaultBacWaterMl: 3.0,
    vialOptions: [10],
    waterOptions: [2, 3, 5],
    doseOptions: [333, 500, 667, 1000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 3.0, valueMcg: 333,  label: 'Normal' },
      high:   { vialMg: 10, waterMl: 3.0, valueMcg: 667,  label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'glow': {
    baseName: 'GLOW',
    defaultVialMg: 70,
    defaultBacWaterMl: 3.0,
    vialOptions: [70],
    waterOptions: [3, 5],
    doseOptions: [2333, 3500, 4667, 5833],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 70, waterMl: 3.0, valueMcg: 2333, label: 'Normal' },
      high:   { vialMg: 70, waterMl: 3.0, valueMcg: 3500, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'klow': {
    baseName: 'KLOW',
    defaultVialMg: 80,
    defaultBacWaterMl: 3.0,
    vialOptions: [80],
    waterOptions: [3, 5],
    doseOptions: [2667, 4000, 5333, 6667],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 80, waterMl: 3.0, valueMcg: 2667, label: 'Normal' },
      high:   { vialMg: 80, waterMl: 3.0, valueMcg: 4000, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'neuroxelin': {
    baseName: 'Neuroxelin',
    defaultVialMg: 48,
    defaultBacWaterMl: 3.0,
    vialOptions: [48],
    waterOptions: [3, 5],
    doseOptions: [1600, 2400, 3200, 4000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 48, waterMl: 3.0, valueMcg: 1600, label: 'Normal' },
      high:   { vialMg: 48, waterMl: 3.0, valueMcg: 2400, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'tesamorelin-5mg-ipamorelin-5mg': {
    baseName: 'Tesamorelin + Ipamorelin',
    defaultVialMg: 10,
    defaultBacWaterMl: 3.0,
    vialOptions: [10],
    waterOptions: [2, 3, 5],
    doseOptions: [333, 500, 667, 1000],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 10, waterMl: 3.0, valueMcg: 333,  label: 'Normal' },
      high:   { vialMg: 10, waterMl: 3.0, valueMcg: 667,  label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  'tri-heal': {
    baseName: 'Tri-Heal',
    defaultVialMg: 45,
    defaultBacWaterMl: 3.0,
    vialOptions: [45],
    waterOptions: [3, 5],
    doseOptions: [1500, 2250, 3000, 3750],
    doseUnit: 'mcg',
    dosePresets: {
      normal: { vialMg: 45, waterMl: 3.0, valueMcg: 1500, label: 'Normal' },
      high:   { vialMg: 45, waterMl: 3.0, valueMcg: 2250, label: 'High' }
    },
    defaultFrequencyPerWeek: 7,
    defaultSyringeType: 'U-100'
  },

  // ─── PEPTIDE STACKS ───────────────────────────────────────────────────────────
  // Stacks are two separate vials administered on different schedules.
  // The `components` array maps to individual peptide slugs in this preset file,
  // allowing the stack calculator to render one working calculator per component.

  'cjc-1295-dac-ipamorelin': {
    baseName: 'CJC-1295 DAC + Ipamorelin Stack',
    components: ['cjc-1295-dac', 'ipamorelin'],
    defaultVialMg: null,
    defaultBacWaterMl: null,
    vialOptions: null,
    waterOptions: null,
    doseOptions: null,
    doseUnit: 'mcg',
    dosePresets: null,
    defaultFrequencyPerWeek: null,
    defaultSyringeType: 'U-100'
  },

  'pt-141-melanotan-ii': {
    baseName: 'PT-141 + Melanotan II Stack',
    components: ['pt-141', 'melanotan-ii'],
    defaultVialMg: null,
    defaultBacWaterMl: null,
    vialOptions: null,
    waterOptions: null,
    doseOptions: null,
    doseUnit: 'mcg',
    dosePresets: null,
    defaultFrequencyPerWeek: null,
    defaultSyringeType: 'U-100'
  },

  'tb-500-bpc-157': {
    baseName: 'TB-500 + BPC-157 Stack',
    components: ['tb-500', 'bpc-157'],
    defaultVialMg: null,
    defaultBacWaterMl: null,
    vialOptions: null,
    waterOptions: null,
    doseOptions: null,
    doseUnit: 'mcg',
    dosePresets: null,
    defaultFrequencyPerWeek: null,
    defaultSyringeType: 'U-100'
  }

}

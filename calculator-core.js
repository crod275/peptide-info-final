const SYRINGE_UNITS = { 'U-100': 100, 'U-50': 50, 'U-40': 40 }
const SYRINGE_CAPACITY_ML = { 'U-100': 1.0, 'U-50': 1.0, 'U-40': 1.0 }

function parseMg(str) {
  if (typeof str === 'number') return str
  str = String(str).trim().toLowerCase()
  const mcg = str.match(/^([\d.]+)\s*mcg/)
  if (mcg) return parseFloat(mcg[1]) / 1000
  const mg = str.match(/^([\d.]+)\s*mg/)
  if (mg) return parseFloat(mg[1])
  const bare = str.match(/^[\d.]+$/)
  if (bare) return parseFloat(bare[0])
  return NaN
}

function parseMl(str) {
  if (typeof str === 'number') return str
  str = String(str).trim().toLowerCase()
  const ml = str.match(/^([\d.]+)\s*m[l]/)
  if (ml) return parseFloat(ml[1])
  const bare = str.match(/^[\d.]+$/)
  if (bare) return parseFloat(bare[0])
  return NaN
}

function calcConcentration(vialMg, waterMl) {
  return vialMg / waterMl
}

function calcInjectionVolumeMl(doseMg, concentrationMgMl) {
  return doseMg / concentrationMgMl
}

function calcSyringeUnits(injectionVolumeMl, syringeType) {
  return injectionVolumeMl * SYRINGE_UNITS[syringeType]
}

function calcDosesPerVial(vialMg, doseMg) {
  const exact = vialMg / doseMg
  return { exact, whole: Math.floor(exact) }
}

function calcVialDuration(dosesPerVial, frequencyPerWeek) {
  if (!frequencyPerWeek || frequencyPerWeek <= 0) return null
  return (dosesPerVial / frequencyPerWeek) * 7
}

function validateInputs({ vialMg, waterMl, doseMg, syringeType }) {
  const errors = []
  if (!Number.isFinite(vialMg) || vialMg <= 0) errors.push('Vial amount must be a positive number.')
  if (!Number.isFinite(waterMl) || waterMl <= 0) errors.push('BAC water volume must be a positive number.')
  if (!Number.isFinite(doseMg) || doseMg <= 0) errors.push('Desired dose must be a positive number.')
  if (Number.isFinite(doseMg) && Number.isFinite(vialMg) && doseMg > vialMg) errors.push('Dose exceeds total vial amount.')
  if (!SYRINGE_UNITS[syringeType]) errors.push('Invalid syringe type.')
  return { valid: errors.length === 0, errors }
}

function checkSyringeCapacity(injectionVolumeMl, syringeType) {
  const cap = SYRINGE_CAPACITY_ML[syringeType]
  return injectionVolumeMl > cap
}

function checkDoseRounding(syringeUnits) {
  return Math.round(syringeUnits) === 0
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseMg, parseMl, calcConcentration, calcInjectionVolumeMl,
    calcSyringeUnits, calcDosesPerVial, calcVialDuration, validateInputs,
    checkSyringeCapacity, checkDoseRounding, SYRINGE_UNITS, SYRINGE_CAPACITY_ML
  }
}

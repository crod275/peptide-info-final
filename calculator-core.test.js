const assert = require('assert')
const {
  parseMg, parseMl, calcConcentration, calcInjectionVolumeMl,
  calcSyringeUnits, calcDosesPerVial, calcVialDuration,
  validateInputs, checkSyringeCapacity, checkDoseRounding
} = require('./calculator-core.js')

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log('  PASS:', name)
    passed++
  } catch (e) {
    console.error('  FAIL:', name, '-', e.message)
    failed++
  }
}

console.log('\nparseMg')
test('"5 mg"', () => assert.strictEqual(parseMg('5 mg'), 5))
test('"500 mcg"', () => assert.strictEqual(parseMg('500 mcg'), 0.5))
test('"5000mcg"', () => assert.strictEqual(parseMg('5000mcg'), 5))
test('"2.5 mg"', () => assert.strictEqual(parseMg('2.5 mg'), 2.5))
test('bare number string "2.5"', () => assert.strictEqual(parseMg('2.5'), 2.5))
test('numeric argument 5', () => assert.strictEqual(parseMg(5), 5))
test('invalid string → NaN', () => assert.ok(isNaN(parseMg('abc'))))
test('"0.25 mg"', () => assert.strictEqual(parseMg('0.25 mg'), 0.25))
test('"250 mcg" → 0.25 mg', () => assert.strictEqual(parseMg('250 mcg'), 0.25))

console.log('\nparseMl')
test('"1.0 mL"', () => assert.strictEqual(parseMl('1.0 mL'), 1.0))
test('"3 ml"', () => assert.strictEqual(parseMl('3 ml'), 3))
test('"2.5 mL"', () => assert.strictEqual(parseMl('2.5 mL'), 2.5))
test('bare number "1.5"', () => assert.strictEqual(parseMl('1.5'), 1.5))
test('numeric argument 2', () => assert.strictEqual(parseMl(2), 2))
test('invalid string → NaN', () => assert.ok(isNaN(parseMl('xyz'))))

console.log('\ncalcConcentration')
test('5mg / 1mL = 5 mg/mL', () => assert.strictEqual(calcConcentration(5, 1), 5))
test('5mg / 3mL ≈ 1.667 mg/mL', () => assert.ok(Math.abs(calcConcentration(5, 3) - 1.6667) < 0.001))
test('10mg / 2mL = 5 mg/mL', () => assert.strictEqual(calcConcentration(10, 2), 5))

console.log('\ncalcInjectionVolumeMl')
test('0.25mg / 5mg/mL = 0.05mL', () => assert.strictEqual(calcInjectionVolumeMl(0.25, 5), 0.05))
test('0.25mg / 1.667mg/mL ≈ 0.15mL', () => assert.ok(Math.abs(calcInjectionVolumeMl(0.25, 1.667) - 0.1499) < 0.001))
test('2mg / 5mg/mL = 0.4mL', () => assert.strictEqual(calcInjectionVolumeMl(2, 5), 0.4))

console.log('\ncalcSyringeUnits')
test('U-100: 0.1mL = 10 units', () => assert.strictEqual(calcSyringeUnits(0.1, 'U-100'), 10))
test('U-50: 0.1mL = 5 units', () => assert.strictEqual(calcSyringeUnits(0.1, 'U-50'), 5))
test('U-40: 0.1mL = 4 units', () => assert.strictEqual(calcSyringeUnits(0.1, 'U-40'), 4))
test('U-100: 0.4mL = 40 units', () => assert.strictEqual(calcSyringeUnits(0.4, 'U-100'), 40))
test('U-100: 0.05mL = 5 units', () => assert.strictEqual(calcSyringeUnits(0.05, 'U-100'), 5))

console.log('\ncalcDosesPerVial')
test('5mg / 0.25mg = {exact:20, whole:20}', () => assert.deepStrictEqual(calcDosesPerVial(5, 0.25), { exact: 20, whole: 20 }))
test('5mg / 0.3mg → whole=16 (floor 16.66)', () => assert.strictEqual(calcDosesPerVial(5, 0.3).whole, 16))
test('5mg / 0.3mg → exact≈16.67', () => assert.ok(Math.abs(calcDosesPerVial(5, 0.3).exact - 16.667) < 0.001))

console.log('\ncalcVialDuration')
test('20 doses / 1×/week = 140 days', () => assert.strictEqual(calcVialDuration(20, 1), 140))
test('20 doses / 7×/week = 20 days', () => assert.strictEqual(calcVialDuration(20, 7), 20))
test('frequencyPerWeek=0 → null', () => assert.strictEqual(calcVialDuration(20, 0), null))
test('frequencyPerWeek=null → null', () => assert.strictEqual(calcVialDuration(20, null), null))

console.log('\nvalidateInputs — valid case')
test('all valid inputs pass', () => {
  const r = validateInputs({ vialMg: 5, waterMl: 1, doseMg: 0.25, syringeType: 'U-100' })
  assert.ok(r.valid)
  assert.strictEqual(r.errors.length, 0)
})

console.log('\nvalidateInputs — edge cases')
test('waterMl=0 → invalid, BAC water error', () => {
  const r = validateInputs({ vialMg: 5, waterMl: 0, doseMg: 0.25, syringeType: 'U-100' })
  assert.ok(!r.valid)
  assert.ok(r.errors.some(e => e.includes('BAC water')))
})
test('dose > vial → "Dose exceeds" error', () => {
  const r = validateInputs({ vialMg: 5, waterMl: 1, doseMg: 10, syringeType: 'U-100' })
  assert.ok(!r.valid)
  assert.ok(r.errors.some(e => e.includes('Dose exceeds')))
})
test('negative vial → invalid', () => {
  const r = validateInputs({ vialMg: -1, waterMl: 1, doseMg: 0.25, syringeType: 'U-100' })
  assert.ok(!r.valid)
})
test('NaN dose → invalid', () => {
  const r = validateInputs({ vialMg: 5, waterMl: 1, doseMg: NaN, syringeType: 'U-100' })
  assert.ok(!r.valid)
})
test('NaN waterMl → invalid', () => {
  const r = validateInputs({ vialMg: 5, waterMl: NaN, doseMg: 0.25, syringeType: 'U-100' })
  assert.ok(!r.valid)
})
test('invalid syringe type → invalid', () => {
  const r = validateInputs({ vialMg: 5, waterMl: 1, doseMg: 0.25, syringeType: 'U-200' })
  assert.ok(!r.valid)
  assert.ok(r.errors.some(e => e.includes('syringe')))
})
test('zero vial → invalid', () => {
  const r = validateInputs({ vialMg: 0, waterMl: 1, doseMg: 0.25, syringeType: 'U-100' })
  assert.ok(!r.valid)
})
test('negative dose → invalid', () => {
  const r = validateInputs({ vialMg: 5, waterMl: 1, doseMg: -0.1, syringeType: 'U-100' })
  assert.ok(!r.valid)
})

console.log('\ncheckSyringeCapacity')
test('1.5mL > U-100 1mL cap → true (warning)', () => assert.ok(checkSyringeCapacity(1.5, 'U-100')))
test('0.5mL U-100 → false (no warning)', () => assert.ok(!checkSyringeCapacity(0.5, 'U-100')))
test('1.0mL exactly = cap → false (no warning)', () => assert.ok(!checkSyringeCapacity(1.0, 'U-100')))

console.log('\ncheckDoseRounding')
test('0.004 units rounds to 0 → true (warning)', () => assert.ok(checkDoseRounding(0.004)))
test('0.5 units rounds to 1 → false (no warning)', () => assert.ok(!checkDoseRounding(0.5)))
test('5 units → false (no warning)', () => assert.ok(!checkDoseRounding(5)))

console.log('\n' + '─'.repeat(40))
console.log(`${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)

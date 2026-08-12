import { readFileSync, writeFileSync } from 'fs';

// ─── helpers ────────────────────────────────────────────────────────────────

function load(path) { return JSON.parse(readFileSync(path, 'utf8')); }
function save(path, data) { writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8'); }

const log = (msg) => console.log(msg);

// ─── Blends file ─────────────────────────────────────────────────────────────

const blendsPath = './peptide_blends_frontend_library.json';
const blends = load(blendsPath);

// A3 — Em dashes in glow overview.how_it_works.body
{
  const glow = blends.peptides.find(p => p.slug === 'glow');
  let body = glow.overview.how_it_works.body;

  // 1. "genomic modulator—it can" → semicolon (two independent clauses)
  body = body.replace('genomic modulator—it can', 'genomic modulator; it can');

  // 2. "inflammatory mediators—it lowers" → semicolon (two independent clauses)
  body = body.replace('inflammatory mediators—it lowers', 'inflammatory mediators; it lowers');

  // 3+4. "pathways—collagen synthesis...control—to create" → parentheses (parenthetical)
  body = body.replace(
    'pathways—collagen synthesis, cell migration, angiogenesis, and inflammation control—to create',
    'pathways (collagen synthesis, cell migration, angiogenesis, and inflammation control) to create'
  );

  glow.overview.how_it_works.body = body;
  log('A3 glow: 4 em dashes replaced');
}

// A9 — cagrilintide-semaglutide: move efficacy items from side_effects → main_benefits
{
  const entry = blends.peptides.find(p => p.slug === 'cagrilintide-semaglutide');
  const items = entry.overview.side_effects.items;

  // items[1] and [2] are efficacy data
  const weightItem = items[1]; // "Phase 2 trials report..."
  const glycemicItem = items[2]; // "In type 2 diabetes..."

  entry.overview.main_benefits.items.push(
    { title: 'Weight loss efficacy', description: weightItem },
    { title: 'Glycemic improvement', description: glycemicItem }
  );

  // Remove indices 1 and 2 (remove 2 first to not shift index)
  entry.overview.side_effects.items.splice(1, 2);

  log('A9 cagrilintide-semaglutide: 2 efficacy items moved to main_benefits');
}

// A9 — tri-heal: move efficacy items from side_effects → main_benefits
{
  const entry = blends.peptides.find(p => p.slug === 'tri-heal');
  const items = entry.overview.side_effects.items;

  // items[1], [2], [3] are efficacy data
  const tissueItem = items[1];
  const musculoItem = items[2];
  const antiInflamItem = items[3];

  entry.overview.main_benefits.items.push(
    { title: 'Tissue repair', description: tissueItem },
    { title: 'Musculoskeletal healing', description: musculoItem },
    { title: 'Anti-inflammatory activity', description: antiInflamItem }
  );

  entry.overview.side_effects.items.splice(1, 3);

  log('A9 tri-heal: 3 efficacy items moved to main_benefits');
}

save(blendsPath, blends);
log('Blends file saved.');

// ─── Stacks file ─────────────────────────────────────────────────────────────

const stacksPath = './peptide_stacks_frontend_library.json';
const stacks = load(stacksPath);

// A3 — Em dashes in both cjc-1295-dac-ipamorelin how_it_works.body
{
  let count = 0;
  stacks.peptides
    .filter(p => p.slug === 'cjc-1295-dac-ipamorelin')
    .forEach(p => {
      let body = p.overview.how_it_works.body;
      const before = body;
      body = body.replace(
        'pathways—GHRH receptor and ghrelin receptor—to synergistically',
        'pathways (GHRH receptor and ghrelin receptor) to synergistically'
      );
      if (body !== before) count++;
      p.overview.how_it_works.body = body;
    });
  log(`A3 cjc: ${count} entries updated (2 expected)`);
}

// A10 — Remove orphan "Potential Benefits & Side Effects" header from all 4 stack entries
{
  const ORPHAN = 'Potential Benefits & Side Effects';
  let count = 0;
  stacks.peptides.forEach(p => {
    const items = p.overview?.side_effects?.items;
    if (items && items[0] === ORPHAN) {
      items.splice(0, 1);
      count++;
      log(`A10 removed orphan header from: ${p.slug}`);
    }
  });
  log(`A10: ${count} orphan headers removed (4 expected)`);
}

// A11 — Rewrite injection_frequency.summary for both cjc entries
{
  const cjcEntries = stacks.peptides.filter(p => p.slug === 'cjc-1295-dac-ipamorelin');

  // Entry 0: 5 mg vial variant (dosage shows "1000 mcg (1.0 mg)")
  cjcEntries[0].dosing_and_reconstitution.injection_frequency.summary =
    'CJC-1295 DAC: 1 mg subcutaneously once per week on a consistent day. Ipamorelin: 100–300 mcg subcutaneously once daily.';

  // Entry 1: 2.5 mg vial variant (dosage shows "40 units (0.40 mL)")
  cjcEntries[1].dosing_and_reconstitution.injection_frequency.summary =
    'CJC-1295 DAC: 1 mg (40 units) subcutaneously once per week on a consistent day. Ipamorelin: 100–300 mcg subcutaneously once daily.';

  log('A11: injection_frequency.summary rewritten for both cjc entries');
}

save(stacksPath, stacks);
log('Stacks file saved.');
log('Phase 5 complete.');

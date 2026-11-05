import fs from 'fs';
import path from 'path';

const originals = JSON.parse(fs.readFileSync('./scripts/original_741_ids.json', 'utf8'));

export function verifyBatch(fileName) {
  const filePath = `./src/data/phones/${fileName}`;
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract all IDs from file
  const matches = [...content.matchAll(/[\"']?id[\"']?\s*:\s*['\"]([^'\"]+)['\"]/g)].map(m => m[1]);
  const originalIds = originals[fileName];

  console.log(`\n--- AUDIT VERIFICATION: ${fileName} ---`);
  console.log(`Original count: ${originalIds.length} | Current count: ${matches.length}`);

  if (matches.length !== originalIds.length) {
    console.error(`❌ COUNT MISMATCH in ${fileName}: expected ${originalIds.length}, found ${matches.length}`);
    return false;
  }

  // Check each original ID
  const currentSet = new Set(matches);
  const missing = originalIds.filter(id => !currentSet.has(id));
  if (missing.length > 0) {
    console.error(`❌ MISSING IDS in ${fileName}:`, missing);
    return false;
  }

  // Check duplicates
  if (currentSet.size !== matches.length) {
    console.error(`❌ DUPLICATE IDS DETECTED in ${fileName}!`);
    return false;
  }

  console.log(`✅ ALL ${originalIds.length} ORIGINAL IDS INTACT AND UNCHANGED in ${fileName}!`);
  return true;
}

if (process.argv[2]) {
  const ok = verifyBatch(process.argv[2]);
  process.exit(ok ? 0 : 1);
}

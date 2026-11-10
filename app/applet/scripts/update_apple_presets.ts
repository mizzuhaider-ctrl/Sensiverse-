import fs from 'fs';
import path from 'path';

interface Preset {
  id: string;
  name: string;
  values: [number, number, number, number, number, number];
}

const PRESETS: Preset[] = [
  { id: 'apple-11', name: 'iPhone 11', values: [140, 128, 122, 115, 75, 100] },
  { id: 'apple-11-pro', name: 'iPhone 11 Pro', values: [138, 126, 120, 114, 74, 98] },
  { id: 'apple-11-pm', name: 'iPhone 11 Pro Max', values: [136, 124, 118, 112, 73, 96] },
  { id: 'apple-12-mini', name: 'iPhone 12 Mini', values: [137, 125, 119, 113, 74, 97] },
  { id: 'apple-12', name: 'iPhone 12', values: [135, 123, 117, 111, 73, 96] },
  { id: 'apple-12-pro', name: 'iPhone 12 Pro', values: [133, 121, 115, 109, 72, 95] },
  { id: 'apple-12-pm', name: 'iPhone 12 Pro Max', values: [131, 119, 113, 107, 71, 94] },
  { id: 'apple-13-mini', name: 'iPhone 13 Mini', values: [134, 122, 116, 110, 72, 95] },
  { id: 'apple-13', name: 'iPhone 13', values: [132, 120, 114, 108, 71, 94] },
  { id: 'apple-13-pro', name: 'iPhone 13 Pro', values: [130, 118, 112, 106, 70, 93] },
  { id: 'apple-13-pm', name: 'iPhone 13 Pro Max', values: [128, 116, 110, 104, 69, 92] },
  { id: 'apple-14', name: 'iPhone 14', values: [131, 119, 113, 107, 70, 93] },
  { id: 'apple-14-plus', name: 'iPhone 14 Plus', values: [129, 117, 111, 105, 69, 92] },
  { id: 'apple-14-pro', name: 'iPhone 14 Pro', values: [127, 115, 109, 103, 68, 91] },
  { id: 'apple-14-pm', name: 'iPhone 14 Pro Max', values: [125, 113, 107, 101, 67, 90] },
  { id: 'apple-15', name: 'iPhone 15', values: [128, 116, 110, 104, 68, 91] },
  { id: 'apple-15-plus', name: 'iPhone 15 Plus', values: [126, 114, 108, 102, 67, 90] },
  { id: 'apple-15-pro', name: 'iPhone 15 Pro', values: [124, 112, 106, 100, 66, 89] },
  { id: 'apple-15-pm', name: 'iPhone 15 Pro Max', values: [122, 110, 104, 98, 65, 88] },
  { id: 'apple-16e', name: 'iPhone 16e', values: [125, 113, 107, 101, 66, 89] },
  { id: 'apple-16', name: 'iPhone 16', values: [123, 111, 105, 99, 65, 88] },
  { id: 'apple-16-plus', name: 'iPhone 16 Plus', values: [121, 109, 103, 97, 64, 87] },
  { id: 'apple-16-pro', name: 'iPhone 16 Pro', values: [119, 107, 101, 95, 63, 86] },
  { id: 'apple-16-pm', name: 'iPhone 16 Pro Max', values: [117, 105, 99, 93, 62, 85] },
  { id: 'apple-17e', name: 'iPhone 17e', values: [122, 110, 104, 98, 63, 86] },
  { id: 'apple-17', name: 'iPhone 17', values: [120, 108, 102, 96, 62, 85] },
  { id: 'apple-17-air', name: 'iPhone 17 Air', values: [118, 106, 100, 94, 61, 84] },
  { id: 'apple-17-pro', name: 'iPhone 17 Pro', values: [116, 104, 98, 92, 60, 83] },
  { id: 'apple-17-pm', name: 'iPhone 17 Pro Max', values: [114, 102, 96, 90, 59, 82] },
];

const filePath = path.resolve(process.cwd(), 'src/data/phones/apple.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Map for quick lookup
const presetMap = new Map(PRESETS.map(p => [p.id, p]));

// Update names first
content = content.replace('"name": "iPhone Air"', '"name": "iPhone 17 Air"');
content = content.replace('"name": "iPhone 13 mini"', '"name": "iPhone 13 Mini"');
content = content.replace('"name": "iPhone 12 mini"', '"name": "iPhone 12 Mini"');

// Split into phone model blocks
PRESETS.forEach(preset => {
  const idPattern = new RegExp(`("id":\\s*"${preset.id}",[\\s\\S]*?"name":\\s*"${preset.name}",[\\s\\S]*?)(auditNotes":\\s*"[^"]*")`);
  const match = content.match(idPattern);
  if (!match) {
    // Try without auditNotes if some model does not have auditNotes
    const altPattern = new RegExp(`("id":\\s*"${preset.id}",[\\s\\S]*?"name":\\s*"${preset.name}",[\\s\\S]*?)(popular":\\s*(?:true|false))`);
    const altMatch = content.match(altPattern);
    if (!altMatch) {
      console.error(`COULD NOT MATCH MODEL ${preset.id} (${preset.name})`);
      process.exit(1);
    }
    const [gen, red, s2x, s4x, snp, look] = preset.values;
    const presetStr = `,\n    "customSensitivityPreset": {\n      "general": ${gen},\n      "redDot": ${red},\n      "scope2x": ${s2x},\n      "scope4x": ${s4x},\n      "sniperScope": ${snp},\n      "freeLook": ${look}\n    }`;
    content = content.replace(altMatch[0], `${altMatch[1]}${altMatch[2]}${presetStr}`);
  } else {
    const [gen, red, s2x, s4x, snp, look] = preset.values;
    const presetStr = `,\n    "customSensitivityPreset": {\n      "general": ${gen},\n      "redDot": ${red},\n      "scope2x": ${s2x},\n      "scope4x": ${s4x},\n      "sniperScope": ${snp},\n      "freeLook": ${look}\n    }`;
    content = content.replace(match[0], `${match[1]}${match[2]}${presetStr}`);
  }
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated apple.ts with 29 presets!');

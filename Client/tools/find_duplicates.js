const fs = require('fs');
const path = require('path');

function walk(dir, files=[]) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full, files);
    else if (/\.jsx?$/.test(full)) files.push(full);
  });
  return files;
}

const files = walk(path.join(__dirname, '..', 'src'));
const declRe = /\b(const|let|var|function)\s+([A-Za-z_$][\w$]*)/g;

let any = false;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const map = new Map();
  let m;
  while ((m = declRe.exec(src))) {
    const name = m[2];
    const pos = src.substr(0, m.index).split('\n').length;
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(pos);
  }
  const duplicates = [...map.entries()].filter(([, arr]) => arr.length > 1);
  if (duplicates.length) {
    any = true;
    console.log(`File: ${f}`);
    for (const [name, arr] of duplicates) {
      console.log(`  ${name}: declared ${arr.length} times at lines ${arr.join(', ')}`);
    }
    console.log('');
  }
}
if (!any) console.log('No duplicate declarations found within single files.');

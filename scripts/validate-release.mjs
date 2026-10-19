import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const forbidden = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory() && name !== 'node_modules' && name !== '.git') walk(p);
    else if (st.isFile() && /\.(pdf|docx|rtf|odt)$/i.test(name)) forbidden.push(p);
  }
}
walk(root);
if (forbidden.length) throw new Error(`Documents sources interdits dans le release:\n${forbidden.join('\n')}`);
const bar = fs.readdirSync(path.join(root,'src/assets/corpus/barhout-pages')).filter(x=>x.endsWith('.jpg'));
const idr = fs.readdirSync(path.join(root,'src/assets/corpus/idrisiyya-pages')).filter(x=>x.endsWith('.jpg'));
if(bar.length!==34) throw new Error(`Barhout: ${bar.length}/34 pages`);
if(idr.length!==66) throw new Error(`Les Noms d’Idris: ${idr.length}/66 pages`);
const abjad = fs.readFileSync(path.join(root,'src/abjad.ts'),'utf8');
const letters=['ا','ب','ج','د','ه','و','ز','ح','ط','ي','ك','ل','م','ن','ص','ع','ف','ض','ق','ر','س','ت','ث','خ','ذ','ظ','غ','ش'];
for(const l of letters) if(!abjad.includes(l)) throw new Error(`Lettre absente: ${l}`);
console.log('RELEASE OK');

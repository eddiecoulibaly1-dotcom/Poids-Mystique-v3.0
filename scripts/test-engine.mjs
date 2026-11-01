import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

// Compile et exécute le véritable src/abjad.ts : aucune copie du moteur ici.
const source = await readFile(new URL('../src/abjad.ts', import.meta.url), 'utf8');
const compiled = ts.transpile(source, {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2020,
  strict: true
});
const exports = {};
vm.runInNewContext(compiled, { exports, module: { exports } });
const engine = exports;

const base = engine.calculateAbjad('محمد');
assert.equal(base.total, 92);
assert.deepEqual({ ...base.byElement }, { Feu: 80, Terre: 0, Air: 0, Eau: 12 });
assert.equal(base.letters.length, 4);

const withShadda = engine.calculateAbjad('مُحَمَّد', {
  ...engine.DEFAULT_NORMALIZATION,
  countShaddaAsDouble: true
});
assert.equal(withShadda.total, 132);
assert.equal(withShadda.byElement.Feu, 120);
assert.equal(withShadda.letters.length, 5);

const withoutShadda = engine.calculateAbjad('مُحَمَّد');
assert.equal(withoutShadda.total, 92);

const alifVariants = engine.calculateAbjad('أإآٱ');
assert.equal(alifVariants.total, 4);
assert.equal(alifVariants.normalized, 'اااا');

const distinctEndings = engine.calculateAbjad('ةى');
assert.equal(distinctEndings.total, 0);
assert.deepEqual([...distinctEndings.ignored], ['ة', 'ى']);

const normalizedEndings = engine.calculateAbjad('ةى', {
  ...engine.DEFAULT_NORMALIZATION,
  taMarbutaToHa: true,
  alifMaqsuraToYa: true
});
assert.equal(normalizedEndings.total, 15);

console.log('OK — tests exécutés sur src/abjad.ts');
console.log('محمد = 92 ; shadda activée = 132 ; variantes alif = 4 ; finales normalisées = 15');

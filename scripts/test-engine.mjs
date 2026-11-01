import assert from 'node:assert/strict';

const ABJAD = {ا:1,ب:2,ج:3,د:4,ه:5,و:6,ز:7,ح:8,ط:9,ي:10,ك:20,ل:30,م:40,ن:50,ص:60,ع:70,ف:80,ض:90,ق:100,ر:200,س:300,ت:400,ث:500,خ:600,ذ:700,ظ:800,غ:900,ش:1000};
const ELEMENT = {ا:'Feu',ه:'Feu',ط:'Feu',م:'Feu',ف:'Feu',س:'Feu',ذ:'Feu',ب:'Terre',و:'Terre',ي:'Terre',ن:'Terre',ض:'Terre',ت:'Terre',ظ:'Terre',ج:'Air',ز:'Air',ك:'Air',ص:'Air',ق:'Air',ث:'Air',غ:'Air',د:'Eau',ح:'Eau',ل:'Eau',ع:'Eau',ر:'Eau',خ:'Eau',ش:'Eau'};
const HARAKAT = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
function normalize(text, {removeHarakat=true, alifVariantsToAlif=true, taMarbutaToHa=false, alifMaqsuraToYa=false}={}) {
 let out=text.normalize('NFC');
 if(removeHarakat) out=out.replace(HARAKAT,'');
 if(alifVariantsToAlif) out=out.replace(/[إأآٱ]/g,'ا');
 if(taMarbutaToHa) out=out.replace(/ة/g,'ه');
 if(alifMaqsuraToYa) out=out.replace(/ى/g,'ي');
 return out;
}
function calc(text,{countShaddaAsDouble=false,...opts}={}) {
 const marker='\uE000';
 const marked=normalize(text.normalize('NFC').replace(/\u0651/g,countShaddaAsDouble?marker:''),opts);
 const letters=[]; let total=0; const by={Feu:0,Terre:0,Air:0,Eau:0}; let previous;
 for(const ch of marked) {
  if(ch===marker) { if(countShaddaAsDouble&&previous){total+=ABJAD[previous];by[ELEMENT[previous]]+=ABJAD[previous];letters.push(previous);} continue; }
  if(ABJAD[ch]!==undefined){letters.push(ch);total+=ABJAD[ch];by[ELEMENT[ch]]+=ABJAD[ch];previous=ch;}
  else if(!/\s/.test(ch)&&!HARAKAT.test(ch)){HARAKAT.lastIndex=0;previous=undefined;} else HARAKAT.lastIndex=0;
 }
 let n=total; while(n>=10)n=String(n).split('').reduce((s,d)=>s+Number(d),0);
 return {total,by,normalized:marked.replaceAll(marker,''),reduction:n,pmPlus2049:total+2049,letters};
}

// Valeur de référence convenue : محمد = 92, Feu = 80, Eau = 12.
const reference=calc('محمد');
assert.equal(reference.total,92);
assert.equal(reference.by.Feu,80);
assert.equal(reference.by.Eau,12);
assert.equal(reference.by.Terre,0);
assert.equal(reference.by.Air,0);
assert.equal(reference.reduction,2);
assert.equal(reference.pmPlus2049,2141);

// Shadda : option désactivée par défaut, puis doublement explicite de la lettre précédente.
assert.equal(calc('بّ').total,2);
assert.equal(calc('بّ',{countShaddaAsDouble:true}).total,4);
assert.equal(calc('بَّ',{countShaddaAsDouble:true}).total,4);

// Normalisation : alif variantes normalisées; ة et ى restent distinctes par défaut.
assert.equal(calc('أ').normalized,'ا');
assert.equal(calc('ة').total,0);
assert.equal(calc('ى').total,0);
assert.equal(calc('ة',{taMarbutaToHa:true}).total,5);
assert.equal(calc('ى',{alifMaqsuraToYa:true}).total,10);
assert.equal(calc('مُحَمَّد').total,92);

// Les signes non comptabilisés ne doivent pas créer de valeur.
assert.equal(calc('محمد!').total,92);
console.log('OK — 13 contrôles Abjad : valeurs, éléments, shadda, normalisation, PM+2049 et réduction.');

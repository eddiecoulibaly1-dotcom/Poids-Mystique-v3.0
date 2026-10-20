const ABJAD = {ا:1,ب:2,ج:3,د:4,ه:5,و:6,ز:7,ح:8,ط:9,ي:10,ك:20,ل:30,م:40,ن:50,ص:60,ع:70,ف:80,ض:90,ق:100,ر:200,س:300,ت:400,ث:500,خ:600,ذ:700,ظ:800,غ:900,ش:1000};
const ELEMENT = {ا:'Feu',ه:'Feu',ط:'Feu',م:'Feu',ف:'Feu',س:'Feu',ذ:'Feu',ب:'Terre',و:'Terre',ي:'Terre',ن:'Terre',ض:'Terre',ت:'Terre',ظ:'Terre',ج:'Air',ز:'Air',ك:'Air',ص:'Air',ق:'Air',ث:'Air',غ:'Air',د:'Eau',ح:'Eau',ل:'Eau',ع:'Eau',ر:'Eau',خ:'Eau',ش:'Eau'};
const text='محمد';
let total=0; const by={Feu:0,Terre:0,Air:0,Eau:0};
for (const c of text) { total += ABJAD[c]; by[ELEMENT[c]] += ABJAD[c]; }
if (total !== 92 || by.Feu !== 80 || by.Eau !== 12 || by.Terre !== 0 || by.Air !== 0) throw new Error('Moteur Maghrebi incorrect');
console.log('OK — محمد = 92; Feu = 80; Eau = 12');

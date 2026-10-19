const A={ا:1,ب:2,ج:3,د:4,ه:5,و:6,ز:7,ح:8,ط:9,ي:10,ك:20,ل:30,م:40,ن:50,ص:60,ع:70,ف:80,ض:90,ق:100,ر:200,س:300,ت:400,ث:500,خ:600,ذ:700,ظ:800,غ:900,ش:1000};
const E={ا:'Feu',ه:'Feu',ط:'Feu',م:'Feu',ف:'Feu',س:'Feu',ذ:'Feu',ب:'Terre',و:'Terre',ي:'Terre',ن:'Terre',ض:'Terre',ت:'Terre',ظ:'Terre',ج:'Air',ز:'Air',ك:'Air',ص:'Air',ق:'Air',ث:'Air',غ:'Air',د:'Eau',ح:'Eau',ل:'Eau',ع:'Eau',ر:'Eau',خ:'Eau',ش:'Eau'};
function calc(s){let total=0,c={Feu:0,Terre:0,Air:0,Eau:0};for(const x of s){if(A[x]){total+=A[x];c[E[x]]+=A[x]}}return{total,c}}
const r=calc('محمد');
if(r.total!==92) throw new Error('محمد should equal 92');
if(r.c.Feu!==80 || r.c.Eau!==12 || r.c.Terre!==0 || r.c.Air!==0) throw new Error('elemental split mismatch');
console.log('OK',r);

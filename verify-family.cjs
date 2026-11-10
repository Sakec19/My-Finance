// Runs the app's actual storage/migration/backup functions with an in-memory
// browser adapter. No production data, Firebase requests, or credentials.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/index.html','utf8').split('<script>')[1].split('</script>')[0];
function boot(seed={}){
 const data=new Map(Object.entries(seed)),elements=new Map();
 const element=()=>({value:'',dataset:{},classList:{toggle(){},add(){},remove(){},contains(){return false}},setAttribute(){},removeAttribute(){},addEventListener(){},replaceChildren(){},append(){},focus(){},close(){},showModal(){},scrollTo(){},style:{}});
 const document={getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},createElement:element,querySelectorAll:()=>[],querySelector:()=>null,body:element(),documentElement:{dataset:{}},addEventListener(){}};
 const context={document,localStorage:{getItem:k=>data.get(k)||null,setItem(k,v){data.set(k,v)}},window:{matchMedia:()=>({matches:false,addEventListener(){}}),scrollTo(){}},navigator:{},location:{protocol:'file:'},crypto:require('node:crypto').webcrypto,Intl,Date,console,alert(){},setInterval(){},setTimeout(){},clearTimeout(){},confirm:()=>false};
 context.window.window=context.window;
 // Replace only presentation functions in this storage test adapter.
 let script=source.replace('load();applyTheme();render();if(',`render=()=>{};applyCountry=()=>{};applyTheme=()=>{};renderFamily=()=>{};showTab=()=>{};updateCountryScreen=()=>{};load();if(`);
 script=script.replace(/\}\)\(\);\s*$/,`window.test={get:()=>({familyStore,activePerson,countryStore,state}),openPerson,backToFamily,persistProfiles,normalizeStore,validateFamily,editPerson};})();`);
 vm.runInNewContext(script,context);return {context,data,test:context.window.test,bridge:context.window.MyFinanceBridge,elements};
}
const profile=(balance)=>({transactions:[],accounts:[{id:'a',name:'Checking',opening:balance}],cards:[],goals:[],investments:[],payments:[],settings:{theme:'light'}});
const legacy={version:5,countries:{US:profile(120),IN:profile(980)},selectedCountries:['US','IN'],selectedCountry:'IN'};
let app=boot({'myfinance-country-profiles-v1':JSON.stringify(legacy)});
assert.equal(app.test.get().familyStore.people[0].name,'My finances');
assert.equal(app.test.get().state.accounts[0].opening,980);
assert.equal(app.data.get('myfinance-country-profiles-v1'),JSON.stringify(legacy));
const snapshot=app.bridge.exportSnapshot();
const photo='data:image/png;base64,'+fs.readFileSync(__dirname+'/icon-192.png').toString('base64');
snapshot.people[0].photo=photo;
snapshot.people.push({id:'second',name:'Second person',store:{countries:{US:profile(55)},selectedCountries:['US'],selectedCountry:'US'}});
app.bridge.importSnapshot(snapshot);app.test.openPerson('second');
assert.equal(app.test.get().state.accounts[0].opening,55);
app.test.get().state.accounts[0].opening=66;app.test.persistProfiles();app.test.openPerson('primary');
assert.equal(app.test.get().state.accounts[0].opening,980);
assert.equal(app.test.get().countryStore.countries.US.accounts[0].opening,120);
assert.equal(app.bridge.exportSnapshot().people[0].photo,photo);
const backup=JSON.stringify(app.bridge.exportSnapshot());
app=boot({'monviora-family-v1':backup});app.test.openPerson('second');assert.equal(app.test.get().state.accounts[0].opening,66);
assert.equal(app.bridge.exportSnapshot().people[0].photo,photo);
const prior=app.data.get('monviora-family-v1');
for(const invalid of [{version:6,people:[]},{version:6,people:[{id:'a',name:'A',store:{countries:{US:{accounts:'wrong'}}}}]},{version:6,people:[snapshot.people[0],snapshot.people[0]]},{version:6,people:[{...snapshot.people[0],photo:'data:image/svg+xml;base64,PHN2Zz4='}]},{version:6,people:[{...snapshot.people[0],photo:'data:image/jpeg;base64,'+'A'.repeat(80001)}]},{}]){
 assert.throws(()=>app.bridge.importSnapshot(invalid));assert.equal(app.data.get('monviora-family-v1'),prior);
}
app.bridge.importSnapshot(legacy);assert.equal(app.bridge.exportSnapshot().people.length,1);
app.bridge.importSnapshot(profile(222));assert.equal(app.test.get().state.accounts[0].opening,222);
assert.equal(app.bridge.hasLocalData(),true);
console.log('PASS: legacy migration, preserved safety copy, person/country isolation, edits, reload, full-family round trip, invalid-backup rejection, legacy import, profile photo persistence and validation, cloud bridge payload.');

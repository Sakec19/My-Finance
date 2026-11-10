/* MyFinance Firestore sync: opt-in, per-user, offline-first local app, revision-checked backups.
 * Browser Firebase SDK is CDN-hosted; the finance app remains locally usable even if it fails to load.
 * For production, bundle these modules locally so cloud auth can load without external JS hosting.
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import { getFirestore, doc, getDocFromServer, runTransaction, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

const byId=id=>document.getElementById(id);
const status=msg=>{byId('cloudStatus').textContent=msg};
const config=window.MYFINANCE_FIREBASE_CONFIG||{};
const configured=['apiKey','authDomain','projectId','appId'].every(k=>typeof config[k]==='string'&&config[k].trim());
const bridge=window.MyFinanceBridge;
let auth, db, user=null, revision=null, initialized=false, dirty=false, running=false, timer=null;
const online=()=>navigator.onLine;
const errText=e=>e?.message||String(e);
function ui(){
 byId('cloudLogin').classList.toggle('hidden',!!user);
 byId('cloudActions').classList.toggle('hidden',!user);
 byId('cloudConnection').textContent=!configured?'Setup required':user?'Signed in':'Not signed in';
}
function reference(){return doc(db,'users',user.uid,'private','financeSnapshot')}
function reset(){clearTimeout(timer);initialized=false;dirty=false;revision=null}
function validate(data){return data && ['transactions','accounts','cards','goals','investments','payments'].every(k=>data[k]===undefined||Array.isArray(data[k]))}
async function remote(){
 if(!online())throw Error('Offline: connect to the internet before cloud synchronization.');
 const result=await getDocFromServer(reference());return result.exists()?result.data():null;
}
function restore(value){
 if(!validate(value.payload))throw Error('Cloud snapshot contains invalid data.');
 // Suppress feedback while importing remote data.
 initialized=false;
 bridge.importSnapshot(value.payload);
 revision=value.revision;
 dirty=false;
 initialized=true;
 status(`Restored cloud backup (revision ${revision}).`);
}
async function firstSync(restoreOnly){
 const current=await remote();
 if(!current){
  if(restoreOnly)throw Error('No cloud backup exists for this account.');
  if(!confirm('There is no cloud backup. Upload all your current Monviora family profiles? Export a local JSON backup first.'))return;
  const payload=bridge.exportSnapshot();
  await runTransaction(db,async tx=>{
   const ref=reference();const fresh=await tx.get(ref);
   if(fresh.exists())throw Error('Another device initialized the cloud backup. Review before proceeding.');
   tx.set(ref,{payload,revision:1,updatedAt:serverTimestamp()});
  });
  revision=1;initialized=true;dirty=JSON.stringify(payload)!==JSON.stringify(bridge.exportSnapshot());
  status('Initial cloud backup created.');if(dirty)onLocalSave();return;
 }
 if(restoreOnly||!bridge.hasLocalData()){
  if(confirm('Restore cloud data onto this device? This REPLACES all local family profiles. Export a JSON backup first.'))restore(current);
  return;
 }
 if(confirm('Cloud and this device both have data. Restore the cloud copy? This REPLACES all local family profiles. Cancel to keep both unchanged.'))restore(current);
 else status('Sync paused: existing local and cloud data were left unchanged.');
}
async function sync(restoreOnly=false){
 if(running||!user)return;
 if(!online()){status('Offline: changes remain saved on this device and will be retried while the app is open.');return}
 running=true;
 try{
  if(!initialized){await firstSync(restoreOnly);return}
  if(restoreOnly){const latest=await remote();if(!latest)throw Error('Cloud backup no longer exists.');if(confirm('Replace all local Monviora family profiles with cloud data? Export a backup first.'))restore(latest);return}
  if(!dirty){const latest=await remote();if(!latest||latest.revision!==revision){initialized=false;status('Cloud changed on another device. Sync paused; choose Restore from cloud after exporting your local backup.')}else status('Cloud up to date.');return}
  const payload=bridge.exportSnapshot();
  const next=revision+1;
  await runTransaction(db,async tx=>{
    const ref=reference(), snap=await tx.get(ref);
    if(!snap.exists()||snap.data().revision!==revision)throw Error('Conflict: cloud backup changed. No data overwritten. Export a backup and reconcile.');
    tx.update(ref,{payload,revision:next,updatedAt:serverTimestamp()});
  });
  revision=next;
  dirty=JSON.stringify(payload)!==JSON.stringify(bridge.exportSnapshot());
  status(`Cloud synced (revision ${revision}).`);
  if(dirty)schedule();
 }catch(e){
  const message=errText(e);
  if(message.includes('Conflict:'))initialized=false;
  status('Sync paused: '+message);console.warn('Firebase sync:',message);
 }finally{running=false}
}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>sync(),1800)}
function onLocalSave(){if(!user||!initialized)return;dirty=true;schedule()}
window.MyFinanceCloud={onLocalSave};
function fail(e){status(errText(e))}
byId('cloudSyncNow').onclick=()=>sync();
byId('cloudRestore').onclick=()=>sync(true);
byId('cloudSignIn').onclick=async()=>{
 try{await signInWithEmailAndPassword(auth,byId('cloudEmail').value.trim(),byId('cloudPassword').value);byId('cloudPassword').value=''}catch(e){fail(e)}
};
byId('cloudSignUp').onclick=async()=>{
 try{await createUserWithEmailAndPassword(auth,byId('cloudEmail').value.trim(),byId('cloudPassword').value);byId('cloudPassword').value=''}catch(e){fail(e)}
};
byId('cloudSignOut').onclick=async()=>{try{await signOut(auth)}catch(e){fail(e)}};
if(!configured){
 ui();status('Firebase not connected: enter your web app configuration in firebase-config.js.');
 byId('cloudSignIn').disabled=true;byId('cloudSignUp').disabled=true;
}else{
 try{
  const app=initializeApp(config);auth=getAuth(app);db=getFirestore(app);
  // User's session persists, while finance records continue to live locally as before.
  await setPersistence(auth,browserLocalPersistence);
  onAuthStateChanged(auth,next=>{
   const oldId=user?.uid;user=next;
   if(oldId!==next?.uid)reset();
   ui();status(next?`Signed in as ${next.email}. Select Sync now to start or resume cloud sync.`:'Local-only until signed in.');
  },fail);
  window.addEventListener('online',()=>{if(user&&initialized&&dirty)schedule()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&user&&initialized&&dirty)schedule()});
  setInterval(()=>{if(user&&initialized&&online())sync()},60000);
 }catch(e){ui();fail(e)}
}

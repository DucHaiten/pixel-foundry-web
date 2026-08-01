const DB_NAME='luotx-offline-v1';const STORE='saved';let dbPromise;
function openDB(){if(dbPromise)return dbPromise;dbPromise=new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE)){const s=db.createObjectStore(STORE,{keyPath:'id'});s.createIndex('savedAt','savedAt')}};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});return dbPromise}
function done(tx){return new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
export async function putSaved(row){const db=await openDB(),tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(row);await done(tx);return row}
export async function hasSaved(id){const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction(STORE).objectStore(STORE).getKey(String(id));r.onsuccess=()=>resolve(r.result!==undefined);r.onerror=()=>reject(r.error)})}
export async function getSaved(id){const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction(STORE).objectStore(STORE).get(String(id));r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
export async function listSaved(){const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>resolve((r.result||[]).sort((a,b)=>(b.savedAt||0)-(a.savedAt||0)));r.onerror=()=>reject(r.error)})}
export async function removeSaved(id){const db=await openDB(),tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(String(id));await done(tx)}
export async function clearSaved(){const db=await openDB(),tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();await done(tx)}
export async function savedStats(){const rows=await listSaved();return{count:rows.length,bytes:rows.reduce((n,x)=>n+Number(x.size||x.blob?.size||0),0)}}

const DB_NAME="classai-recordings";
const STORE="recordingChunks";

function database():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,2);
    request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:["sessionId","index"]})};
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  });
}
export async function persistChunk(sessionId:string,index:number,blob:Blob){const db=await database();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put({sessionId,index,blob});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});}
export async function assembleRecording(sessionId:string,type:string){const db=await database();const rows=await new Promise<any[]>((resolve,reject)=>{const tx=db.transaction(STORE,"readonly");const request=tx.objectStore(STORE).getAll(IDBKeyRange.bound([sessionId,0],[sessionId,Number.MAX_SAFE_INTEGER]));request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});return new Blob(rows.sort((a,b)=>a.index-b.index).map(x=>x.blob),{type});}
export async function deleteRecording(sessionId:string){const db=await database();await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");const range=IDBKeyRange.bound([sessionId,0],[sessionId,Number.MAX_SAFE_INTEGER]);const request=tx.objectStore(STORE).openCursor(range);request.onsuccess=()=>{const cursor=request.result;if(cursor){cursor.delete();cursor.continue()}};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});}

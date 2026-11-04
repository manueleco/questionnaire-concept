function open(): Promise<IDBDatabase> { return new Promise((resolve, reject) => { const r = indexedDB.open('scroll-questionnaire-audio', 1); r.onupgradeneeded = () => r.result.createObjectStore('sets'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }); }
export async function saveAudio(id: string, files: File[]) { const db = await open(); try {
    await new Promise<void>((resolve, reject) => { const tx = db.transaction('sets', 'readwrite'); tx.objectStore('sets').clear(); tx.objectStore('sets').put(files, id); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
}
finally {
    db.close();
} }
export async function loadAudio(id: string): Promise<File[] | undefined> { const db = await open(); try {
    return await new Promise((resolve, reject) => { const r = db.transaction('sets').objectStore('sets').get(id); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
}
finally {
    db.close();
} }
export async function clearAudio() { const db = await open(); try {
    await new Promise<void>((resolve, reject) => { const tx = db.transaction('sets', 'readwrite'); tx.objectStore('sets').clear(); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
}
finally {
    db.close();
} }

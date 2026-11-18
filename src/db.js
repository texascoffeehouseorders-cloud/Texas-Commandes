/* Couche base de données : Firebase (Firestore + connexion par compte du shop).
   L'application utilise une petite interface simple (doc / collection / onSnapshot / set / update / delete)
   pour rester indépendante de Firebase. */
import { firebaseConfig } from "./firebase-config.js";
import seed from "./seed.json";

export function isConfigured(){ return !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId); }

let fb = null; // modules Firebase chargés à la demande

async function loadFirebase(){
  if(fb) return fb;
  const [appMod, fsMod, authMod] = await Promise.all([
    import("firebase/app"), import("firebase/firestore"), import("firebase/auth")
  ]);
  const app = appMod.initializeApp(firebaseConfig);
  let firestore;
  try{
    firestore = fsMod.initializeFirestore(app, { localCache: fsMod.persistentLocalCache({ tabManager: fsMod.persistentMultipleTabManager() }) });
  }catch(e){ firestore = fsMod.getFirestore(app); }
  // Persistance de la connexion compatible avec l'application Android (WebView)
  const auth = authMod.initializeAuth(app, { persistence: [authMod.indexedDBLocalPersistence, authMod.browserLocalPersistence] });
  fb = { app, fs: fsMod, authMod, firestore, auth };
  return fb;
}

/* ---------- Connexion ---------- */
export async function onAuth(cb){
  const { authMod, auth } = await loadFirebase();
  return authMod.onAuthStateChanged(auth, cb);
}
export async function login(email, password){
  const { authMod, auth } = await loadFirebase();
  return authMod.signInWithEmailAndPassword(auth, email.trim(), password);
}
export async function logout(){
  const { authMod, auth } = await loadFirebase();
  return authMod.signOut(auth);
}

/* ---------- Adaptateur ---------- */
function wrapDocSnap(s){ return { id:s.id, exists:s.exists(), data:()=>s.data(), metadata:{ fromCache:s.metadata.fromCache, hasPendingWrites:s.metadata.hasPendingWrites } }; }
function wrapQuerySnap(s){ const docs=s.docs.map(wrapDocSnap); return { docs, size:docs.length, empty:!docs.length, metadata:{ fromCache:s.metadata.fromCache } }; }
function mapErr(e){ const c=(e&&e.code)||""; return { code: c.includes("permission")?"invalid_argument": c.includes("unavailable")?"unavailable": c.includes("resource-exhausted")?"quota_exceeded": c, message:(e&&e.message)||"" }; }

export function makeDb(){
  const { fs, firestore } = fb;
  function docRef(path){
    const ref = fs.doc(firestore, path);
    return {
      path, id: ref.id,
      get: () => fs.getDoc(ref).then(wrapDocSnap),
      set: (d) => fs.setDoc(ref, d).catch(e=>{ throw mapErr(e); }),
      // fusion en profondeur (les sous-objets comme "lines" sont fusionnés, pas remplacés)
      update: (d) => fs.setDoc(ref, d, { merge:true }).catch(e=>{ throw mapErr(e); }),
      delete: () => fs.deleteDoc(ref).catch(e=>{ throw mapErr(e); }),
      onSnapshot: (next, err) => fs.onSnapshot(ref, { includeMetadataChanges:true }, s=>next(wrapDocSnap(s)), e=>err&&err(mapErr(e)))
    };
  }
  function coll(path, cons){
    cons = cons || [];
    const q = () => cons.length ? fs.query(fs.collection(firestore, path), ...cons) : fs.collection(firestore, path);
    return {
      path,
      doc: (id) => docRef(path + "/" + (id || fs.doc(fs.collection(firestore, path)).id)),
      where: (f, op, v) => coll(path, cons.concat([fs.where(f, op, v)])),
      orderBy: (f, dir) => coll(path, cons.concat([fs.orderBy(f, dir || "asc")])),
      limit: (n) => coll(path, cons.concat([fs.limit(n)])),
      get: () => fs.getDocs(q()).then(wrapQuerySnap),
      onSnapshot: (next, err) => fs.onSnapshot(q(), { includeMetadataChanges:true }, s=>next(wrapQuerySnap(s)), e=>err&&err(mapErr(e)))
    };
  }
  return { doc: docRef, collection: (p) => coll(p) };
}

/* ---------- Premier démarrage : chargement des 215 articles (une seule fois, même si plusieurs appareils démarrent ensemble) ---------- */
export async function seedIfEmpty(){
  const { fs, firestore } = fb;
  const metaRef = fs.doc(firestore, "meta/seed");
  const done = await fs.runTransaction(firestore, async (tx) => {
    const m = await tx.get(metaRef);
    if (m.exists()) return false;
    tx.set(metaRef, { at: Date.now(), count: seed.length });
    return true;
  });
  if (!done) return false;
  const batch = fs.writeBatch(firestore);
  seed.forEach((it) => { const { id, ...data } = it; batch.set(fs.doc(firestore, "items/" + id), data); });
  await batch.commit();
  return true;
}

export async function initDb(){ await loadFirebase(); return makeDb(); }

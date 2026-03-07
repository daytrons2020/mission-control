import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, onSnapshot, enableIndexedDbPersistence } from 'firebase/firestore'

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.')
  } else if (err.code === 'unimplemented') {
    console.warn('Browser does not support offline persistence')
  }
})

// Items Collection
export const itemsCollection = collection(db, 'items')
export const sessionsCollection = collection(db, 'sessions')

// Item CRUD operations
export async function getAllItems() {
  const snapshot = await getDocs(itemsCollection)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

export async function getItemBySKU(sku) {
  const q = query(itemsCollection, where('sku', '==', sku))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
}

export async function createItem(item) {
  const docRef = doc(itemsCollection)
  await setDoc(docRef, { ...item, createdAt: new Date().toISOString() })
  return docRef.id
}

export async function updateItem(id, updates) {
  const docRef = doc(db, 'items', id)
  await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() })
}

export async function deleteItem(id) {
  const docRef = doc(db, 'items', id)
  await deleteDoc(docRef)
}

// Session operations
export async function saveSession(session) {
  const docRef = doc(sessionsCollection)
  await setDoc(docRef, { ...session, createdAt: new Date().toISOString() })
  return docRef.id
}

export async function getSessions() {
  const snapshot = await getDocs(sessionsCollection)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// Subscribe to items (real-time updates)
export function subscribeToItems(callback) {
  return onSnapshot(itemsCollection, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    callback(items)
  })
}

import { initializeApp } from "firebase/app"
import { getFirestore, doc, collection, getDoc, addDoc  } from "firebase/firestore/lite"

const app = initializeApp({
  apiKey: "AIzaSyDzNThlJZ5jv4aObY-9_a9N2QjA605LW_E",
  databaseURL: "https://input-inspector.firebaseio.com",
  projectId: "input-inspector",
})

const db = getFirestore()

export async function create(collectionName, data) {
  data = JSON.parse(JSON.stringify(data))
  return await addDoc(collection(db, collectionName), data)
}

export async function load(collectionName, id) {
  const docSnap = await getDoc(doc(db, collectionName, id))
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
}

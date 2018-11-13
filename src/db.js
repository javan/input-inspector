import firebase from "firebase/app"
import "firebase/firestore"

firebase.initializeApp({
  apiKey: "AIzaSyDzNThlJZ5jv4aObY-9_a9N2QjA605LW_E",
  databaseURL: "https://input-inspector.firebaseio.com",
  projectId: "input-inspector",
})

const db = firebase.firestore()
db.settings({ timestampsInSnapshots: true })

export async function create(collectionName, data) {
  data = JSON.parse(JSON.stringify(data))
  return db.collection(collectionName).add(data)
}

export async function load(collectionName, id) {
  const doc = await db.collection(collectionName).doc(id).get()
  return doc.exists ? { id: doc.id, ...doc.data() } : null
}

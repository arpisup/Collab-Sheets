import { getApp, getApps, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT!,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

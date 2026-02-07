// Firebase configuration using environment variables
// To set up:
// 1. Copy .env.example to .env
// 2. Fill in your Firebase credentials from Firebase Console
// 3. Restart the dev server for changes to take effect

import { initializeApp } from 'firebase/app'
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

// Auth functions
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider)
        return { user: result.user, error: null }
    } catch (error) {
        return { user: null, error: error.message }
    }
}

export async function signInWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password)
        return { user: result.user, error: null }
    } catch (error) {
        return { user: null, error: error.message }
    }
}

export async function signUpWithEmail(email, password) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password)
        return { user: result.user, error: null }
    } catch (error) {
        return { user: null, error: error.message }
    }
}

export async function logOut() {
    try {
        await signOut(auth)
        return { error: null }
    } catch (error) {
        return { error: error.message }
    }
}

export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback)
}

export { auth }

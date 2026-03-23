import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyDGsKXIlD02twv0bjlWqlc4u3t70dhZA_M',
  authDomain: 'vue-chat-aaf83.firebaseapp.com',
  databaseURL: 'https://vue-chat-aaf83-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'vue-chat-aaf83',
  storageBucket: 'vue-chat-aaf83.firebasestorage.app',
  messagingSenderId: '943336548960',
  appId: '1:943336548960:web:b574d34951abf3af023105',
  measurementId: 'G-M3ERN6GEQX',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getDatabase(app)
export const provider = new GoogleAuthProvider()

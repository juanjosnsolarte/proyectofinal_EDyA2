// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyBwqFriODwhKI-UqGDZ1Tb9XG6Lh1ZJXrM",
  authDomain: "proyectofinal-edya2.firebaseapp.com",
  projectId: "proyectofinal-edya2",
  storageBucket: "proyectofinal-edya2.firebasestorage.app",
  messagingSenderId: "641537935641",
  appId: "1:641537935641:web:9a07f1d1686fcd215b9d88",
  measurementId: "G-Z8BQC26BNY",
  databaseURL: "https://proyectofinal-edya2-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Auth, BD y Realtime Database
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
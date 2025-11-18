// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBwqFriODwhKI-UqGDZ1Tb9XG6Lh1ZJXrM",
  authDomain: "proyectofinal-edya2.firebaseapp.com",
  projectId: "proyectofinal-edya2",
  storageBucket: "proyectofinal-edya2.firebasestorage.app",
  messagingSenderId: "641537935641",
  appId: "1:641537935641:web:9a07f1d1686fcd215b9d88",
  measurementId: "G-Z8BQC26BNY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
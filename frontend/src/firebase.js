// src/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore } from "firebase/firestore"; // Add Firestore import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfHPgqOS2bGpOePBbTQtVhS4pElGTVZqc",
  authDomain: "mozartify.firebaseapp.com",
  projectId: "mozartify",
  storageBucket: "mozartify.appspot.com",
  messagingSenderId: "856218081350",
  appId: "1:856218081350:web:698ccb314fab40c6a49247",
  measurementId: "G-3T0PHBKGWZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

// Initialize Firestore
const db = getFirestore(app); // Initialize Firestore

// Export Firestore and Storage
export { storage, db, ref, uploadBytesResumable, getDownloadURL };
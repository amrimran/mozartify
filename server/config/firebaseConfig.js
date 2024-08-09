// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfHPgqOS2bGpOePBbTQtVhS4pElGTVZqc",
  authDomain: "mozartify.firebaseapp.com",
  projectId: "mozartify",
  storageBucket: "mozartify.appspot.com",
  messagingSenderId: "856218081350",
  appId: "1:856218081350:web:698ccb314fab40c6a49247",
  measurementId: "G-3T0PHBKGWZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

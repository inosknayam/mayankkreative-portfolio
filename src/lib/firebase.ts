// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFOOD00pWu6vzzJZwLN3jtWkWc8lgU9ZE",
  authDomain: "mayankkreative1.firebaseapp.com",
  projectId: "mayankkreative1",
  storageBucket: "mayankkreative1.firebasestorage.app",
  messagingSenderId: "357338629076",
  appId: "1:357338629076:web:4b33c747b091ff62b54c41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };

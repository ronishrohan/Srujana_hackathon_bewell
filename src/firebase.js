// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxjAurTLr08sJOAMD_jgPg8RouNR9ea7A",
  authDomain: "gcem-768ca.firebaseapp.com",
  projectId: "gcem-768ca",
  storageBucket: "gcem-768ca.firebasestorage.app",
  messagingSenderId: "108655430918",
  appId: "1:108655430918:web:189bef0cef84852efc6287",
  measurementId: "G-X0N8S4N2NN"
};

// 184480

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, analytics }
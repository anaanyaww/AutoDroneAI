// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "yourkey",
  authDomain: "yourkey",
  projectId: "yourkey",
  storageBucket: "yourkey",
  messagingSenderId: "689355327035",
  appId: "1yourkey0f2fe1e",
  measurementId: "GyourkeyBVDHYQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // This will be used for authentication
export default app;

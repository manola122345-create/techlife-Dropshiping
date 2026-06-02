import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxC2-_wlmrUixLl_n9nuvJAkCghpZcU6Y",
  authDomain: "autods-88833.firebaseapp.com",
  projectId: "autods-88833",
  storageBucket: "autods-88833.firebasestorage.app",
  messagingSenderId: "639937065457",
  appId: "1:639937065457:web:0db668c8ec519c544e5450"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

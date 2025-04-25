import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAI-iFGnBqn7xtoo6cq5gL29lAUPc4EPk",
  authDomain: "mypocketaii.firebaseapp.com",
  projectId: "mypocketaii",
  storageBucket: "mypocketaii.firebasestorage.app",
  messagingSenderId: "539736707557",
  appId: "1:539736707557:web:b89620e69205b1089b1f0c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export { auth, db };

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBViYsHHilJT_Xyqp8R8R0A1R0FsuoR8EM",
  authDomain: "main-76246.firebaseapp.com",
  databaseURL: "https://main-76246-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "main-76246",
  storageBucket: "main-76246.appspot.com",
  messagingSenderId: "56159644841",
  appId: "1:56159644841:web:c19de9f430cc32b1a64db8",
  measurementId: "G-5BQ07YEDW0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const functions = getFunctions(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Firebase Functions
export const createPayPalOrder = httpsCallable(functions, 'createPayPalOrder');
export const verifyPayment = httpsCallable(functions, 'verifyPayment');
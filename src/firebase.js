import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA7Hxm-DAg7VhG2eWQHizZ8s6d6UYIPaJI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hallgatoi-portal-hm98.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hallgatoi-portal-hm98',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hallgatoi-portal-hm98.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '859314370187',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:859314370187:web:4f7c85c1fa0c7ac41f468e',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

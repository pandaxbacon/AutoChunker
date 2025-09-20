import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDvRTv6OgtEhcfN5Il-3ULK4zk_PRO9mbk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lumberjack-23104.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lumberjack-23104",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lumberjack-23104.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "766583031079",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:766583031079:web:6854abc98fa34307509502",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-EJJKRNQHG8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

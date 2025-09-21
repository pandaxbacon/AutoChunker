// Firebase Configuration for Lumberjack
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Your Firebase config - replace with your actual config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "lumberjack-23104.firebaseapp.com",
  projectId: "lumberjack-23104",
  storageBucket: "lumberjack-23104.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;

// TODO: Replace the config above with your actual Firebase project config
// You can find this in Firebase Console > Project Settings > General > Your apps

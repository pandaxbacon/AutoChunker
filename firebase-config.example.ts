// Firebase Configuration Example
// Copy this file to client/src/firebase-config.ts and add your Firebase credentials

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;

// Example usage in components:
/*
import { db } from '../firebase-config';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Save document
const saveDocument = async (documentData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'documents'), {
      ...documentData,
      createdAt: new Date(),
    });
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding document: ', e);
    throw e;
  }
};

// Load documents
const loadDocuments = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'documents'));
    const documents: any[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    return documents;
  } catch (e) {
    console.error('Error loading documents: ', e);
    throw e;
  }
};
*/

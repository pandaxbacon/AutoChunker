import { storage } from '../firebase-config';
import { ref, uploadBytes, getDownloadURL, getMetadata } from 'firebase/storage';

export interface UploadResult {
  downloadURL: string;
  fileName: string;
  size: number;
  contentType: string;
  exists: boolean;
}

export async function uploadToFirebase(file: File): Promise<UploadResult> {
  try {
    // Create a reference to the file in Firebase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `documents/${fileName}`);
    
    // Check if file with same name already exists
    let exists = false;
    try {
      await getMetadata(storageRef);
      exists = true;
      console.log(`File ${fileName} already exists in storage`);
    } catch (error) {
      // File doesn't exist, which is what we want
      exists = false;
    }
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      downloadURL,
      fileName: snapshot.ref.name,
      size: snapshot.metadata.size,
      contentType: snapshot.metadata.contentType || file.type,
      exists
    };
    
  } catch (error) {
    console.error('Firebase upload error:', error);
    throw new Error(`Failed to upload to Firebase: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function checkFileExists(fileName: string): Promise<boolean> {
  try {
    const storageRef = ref(storage, `documents/${fileName}`);
    await getMetadata(storageRef);
    return true;
  } catch (error) {
    return false;
  }
}

export function getFirebaseFileURL(fileName: string): string {
  const storageRef = ref(storage, `documents/${fileName}`);
  return storageRef.toString();
}

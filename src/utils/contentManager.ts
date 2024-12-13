import { firestore, storage } from '../config/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { securityLogger } from './securityLogger';

interface ContentMetadata {
  title: string;
  description?: string;
  author: string;
  tags?: string[];
  status: 'draft' | 'published';
  type: 'page' | 'post' | 'image';
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export const createContent = async (
  content: string,
  metadata: Omit<ContentMetadata, 'createdAt' | 'updatedAt'>,
  file?: File
) => {
  try {
    let url;
    if (file) {
      const storageRef = ref(storage, `content/${file.name}`);
      await uploadBytes(storageRef, file);
      url = await getDownloadURL(storageRef);
    }

    const contentData = {
      ...metadata,
      content,
      url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(firestore, 'content'), contentData);

    securityLogger.logDataEvent(
      'create',
      metadata.author,
      'content',
      true
    );

    return {
      id: docRef.id,
      ...contentData
    };
  } catch (error) {
    securityLogger.logDataEvent(
      'create',
      metadata.author,
      'content',
      false
    );
    throw error;
  }
};

export const updateContent = async (
  id: string,
  content: string,
  metadata: Partial<ContentMetadata>,
  file?: File
) => {
  try {
    const contentRef = doc(firestore, 'content', id);
    const contentDoc = await getDoc(contentRef);
    
    if (!contentDoc.exists()) {
      throw new Error('Content not found');
    }

    let url = metadata.url;
    if (file) {
      // Delete old file if exists
      if (contentDoc.data().url) {
        const oldFileRef = ref(storage, contentDoc.data().url);
        await deleteObject(oldFileRef);
      }

      // Upload new file
      const storageRef = ref(storage, `content/${file.name}`);
      await uploadBytes(storageRef, file);
      url = await getDownloadURL(storageRef);
    }

    const updates = {
      ...metadata,
      content,
      url,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(contentRef, updates);

    securityLogger.logDataEvent(
      'update',
      metadata.author || 'system',
      'content',
      true
    );

    return {
      id,
      ...contentDoc.data(),
      ...updates
    };
  } catch (error) {
    securityLogger.logDataEvent(
      'update',
      metadata.author || 'system',
      'content',
      false
    );
    throw error;
  }
};

export const deleteContent = async (id: string, author: string) => {
  try {
    const contentRef = doc(firestore, 'content', id);
    const contentDoc = await getDoc(contentRef);
    
    if (!contentDoc.exists()) {
      throw new Error('Content not found');
    }

    // Delete associated file if exists
    if (contentDoc.data().url) {
      const fileRef = ref(storage, contentDoc.data().url);
      await deleteObject(fileRef);
    }

    await deleteDoc(contentRef);

    securityLogger.logDataEvent(
      'delete',
      author,
      'content',
      true
    );
  } catch (error) {
    securityLogger.logDataEvent(
      'delete',
      author,
      'content',
      false
    );
    throw error;
  }
};
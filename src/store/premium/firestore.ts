import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { PurchaseRecord } from './types';

// Update user points in Firestore
export const updateUserPoints = async (userId: string, points: number) => {
  const userRef = doc(firestore, 'users', userId);
  await setDoc(userRef, {
    points,
    lastUpdated: new Date().toISOString()
  }, { merge: true });
};

// Record purchase in Firestore
export const recordPurchaseInFirestore = async (purchase: PurchaseRecord) => {
  const purchaseRef = doc(firestore, 'purchases', purchase.id);
  await setDoc(purchaseRef, purchase);

  // Update user's points
  const userRef = doc(firestore, 'users', purchase.userId);
  const userDoc = await getDoc(userRef);
  const currentPoints = userDoc.exists() ? (userDoc.data()?.points || 0) : 0;

  await setDoc(userRef, {
    points: currentPoints + purchase.points,
    lastUpdated: new Date().toISOString()
  }, { merge: true });
};

// Get user's premium data from Firestore
export const getUserPremiumData = async (userId: string) => {
  const userRef = doc(firestore, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) return null;
  
  return {
    points: userDoc.data().points || 0,
    purchasedFeatures: userDoc.data().purchasedFeatures || [],
    enabledFeatures: userDoc.data().enabledFeatures || []
  };
};

// Get user's purchase history
export const getUserPurchases = async (userId: string) => {
  const purchasesRef = collection(firestore, 'purchases');
  const purchasesQuery = query(
    purchasesRef,
    where('userId', '==', userId),
    where('status', '==', 'completed')
  );
  
  const snapshot = await getDocs(purchasesQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as PurchaseRecord[];
};

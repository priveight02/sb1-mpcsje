import { PurchaseRecord } from './types';

// Create a new purchase record
export const createPurchaseRecord = (
  packageId: string,
  points: number,
  userId: string,
  sessionId?: string
): PurchaseRecord => ({
  id: crypto.randomUUID(),
  packageId,
  points,
  date: new Date().toISOString(),
  userId,
  status: 'completed',
  sessionId
});

// Validate a pending purchase
export const validatePurchase = (purchase: any): boolean => {
  if (!purchase) return false;
  
  const now = Date.now();
  const timestamp = purchase.timestamp || 0;
  
  // Validate purchase is recent (within last hour)
  if (now - timestamp > 3600000) return false;
  
  // Validate required fields
  if (!purchase.packageId || !purchase.points || !purchase.userId) {
    return false;
  }
  
  return true;
};

// Get pending purchase from localStorage
export const getPendingPurchase = () => {
  const data = localStorage.getItem('pendingPurchase');
  return data ? JSON.parse(data) : null;
};

// Clear pending purchase from localStorage
export const clearPendingPurchase = () => {
  localStorage.removeItem('pendingPurchase');
};

// Get/Set last purchased package
export const getLastPurchasedPackage = () => {
  return localStorage.getItem('lastPurchasedPackage');
};

export const setLastPurchasedPackage = (packageId: string) => {
  localStorage.setItem('lastPurchasedPackage', packageId);
};
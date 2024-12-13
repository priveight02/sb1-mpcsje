import UAParser from 'ua-parser-js';

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  model?: string;
}

export const getDeviceInfo = (userAgent: string): DeviceInfo => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  let type: DeviceInfo['type'] = 'desktop';
  if (result.device.type === 'mobile') type = 'mobile';
  if (result.device.type === 'tablet') type = 'tablet';

  return {
    type,
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    model: result.device.model
  };
};

export const storeDeviceInfo = async (userId: string) => {
  const deviceInfo = getDeviceInfo(navigator.userAgent);
  
  // Store in Firestore
  const { firestore } = await import('../config/firebase');
  const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
  
  await setDoc(doc(firestore, 'users', userId, 'devices', crypto.randomUUID()), {
    ...deviceInfo,
    lastSeen: serverTimestamp(),
    userAgent: navigator.userAgent
  });

  return deviceInfo;
};

export const getDeviceStats = async () => {
  const { firestore } = await import('../config/firebase');
  const { collection, query, getDocs } = await import('firebase/firestore');
  
  const devicesRef = collection(firestore, 'devices');
  const snapshot = await getDocs(query(devicesRef));
  
  const stats = {
    mobile: 0,
    tablet: 0,
    desktop: 0,
    total: 0
  };

  snapshot.forEach(doc => {
    const data = doc.data();
    stats[data.type]++;
    stats.total++;
  });

  return stats;
};
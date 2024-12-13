import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

interface PrivacySettings {
  encryptData: boolean;
  encryptionKey?: string;
  hideStreak: boolean;
  hideProgress: boolean;
  privateMode: boolean;
  dataRetentionDays: number;
  exportPassword?: string;
}

interface PrivacyStore {
  settings: PrivacySettings;
  updateSettings: (settings: Partial<PrivacySettings>) => void;
  encryptData: (data: any) => string;
  decryptData: (encryptedData: string) => any;
  generateEncryptionKey: () => string;
  setExportPassword: (password: string) => void;
}

export const usePrivacyStore = create<PrivacyStore>()(
  persist(
    (set, get) => ({
      settings: {
        encryptData: false,
        hideStreak: false,
        hideProgress: false,
        privateMode: false,
        dataRetentionDays: 365,
      },

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      generateEncryptionKey: () => {
        const key = uuidv4();
        set((state) => ({
          settings: { ...state.settings, encryptionKey: key },
        }));
        return key;
      },

      encryptData: (data) => {
        const { settings } = get();
        if (!settings.encryptionKey) {
          throw new Error('Encryption key not set');
        }
        return CryptoJS.AES.encrypt(
          JSON.stringify(data),
          settings.encryptionKey
        ).toString();
      },

      decryptData: (encryptedData) => {
        const { settings } = get();
        if (!settings.encryptionKey) {
          throw new Error('Encryption key not set');
        }
        const bytes = CryptoJS.AES.decrypt(encryptedData, settings.encryptionKey);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      },

      setExportPassword: (password) =>
        set((state) => ({
          settings: { ...state.settings, exportPassword: password },
        })),
    }),
    {
      name: 'privacy-storage',
    }
  )
);
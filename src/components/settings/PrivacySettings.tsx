import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, Eye, EyeOff, Copy, RefreshCw, X } from 'lucide-react';
import { usePrivacyStore } from '../../store/privacyStore';
import * as Dialog from '@radix-ui/react-dialog';
import toast from 'react-hot-toast';

const RegenerateKeyDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => (
  <Dialog.Root open={isOpen} onOpenChange={onClose}>
    <Dialog.Portal>
      <Dialog.Overlay 
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                               w-full max-w-md bg-white dark:bg-gray-800 rounded-xl p-6">
        <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Regenerate Encryption Key?
        </Dialog.Title>
        <div className="mb-6">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            Are you sure you want to generate a new encryption key?
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            This action will:
          </div>
          <ul className="list-disc list-inside space-y-2 mt-2 text-gray-500 dark:text-gray-400">
            <li>Create a new encryption key</li>
            <li>Make previously exported data unreadable</li>
            <li>Cannot be undone</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg
                     hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg
                     hover:bg-red-700"
          >
            Regenerate Key
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

export const PrivacySettings: React.FC = () => {
  const { settings, updateSettings, generateEncryptionKey } = usePrivacyStore();
  const [showKey, setShowKey] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleEncryptionToggle = () => {
    if (!settings.encryptData && !settings.encryptionKey) {
      const key = generateEncryptionKey();
      updateSettings({ encryptData: true, encryptionKey: key });
      setShowKey(true);
      toast.success('Encryption enabled! Make sure to save your key.');
    } else {
      updateSettings({ encryptData: !settings.encryptData });
      if (settings.encryptData) {
        toast.success('Encryption disabled');
      } else {
        toast.success('Encryption enabled');
      }
    }
  };

  const handleCopyKey = () => {
    if (settings.encryptionKey) {
      navigator.clipboard.writeText(settings.encryptionKey)
        .then(() => toast.success('Encryption key copied to clipboard'))
        .catch(() => toast.error('Failed to copy key'));
    }
  };

  const handleRegenerateKey = () => {
    setIsRegenerating(true);
    
    // Simulate key generation process with animation
    setTimeout(() => {
      const newKey = generateEncryptionKey();
      updateSettings({ encryptionKey: newKey });
      setIsRegenerating(false);
      setShowKey(true);
      toast.success('New encryption key generated! Make sure to save it.');
    }, 1500);
  };

  const ToggleSwitch: React.FC<{
    checked: boolean;
    onChange: () => void;
    label: string;
    description: string;
  }> = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{label}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{description}</div>
      </div>
      <div className="relative">
        <motion.button
          onClick={onChange}
          className={`w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
          }`}
          animate={{ backgroundColor: checked ? 'rgb(79, 70, 229)' : 'rgb(229, 231, 235)' }}
        >
          <motion.div
            className="w-5 h-5 rounded-full bg-white shadow-sm"
            animate={{
              x: checked ? 20 : 2,
              y: 2,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </motion.button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
          <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">Privacy Settings</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your privacy and security preferences
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Data Encryption */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Data Encryption</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Encrypt your data for additional security
              </div>
            </div>
          </div>
          <div className="relative">
            <motion.button
              onClick={handleEncryptionToggle}
              className={`w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                settings.encryptData ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <motion.div
                className="w-5 h-5 rounded-full bg-white shadow-sm"
                animate={{
                  x: settings.encryptData ? 20 : 2,
                  y: 2,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
        </div>

        {/* Encryption Key */}
        {settings.encryptData && settings.encryptionKey && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-gray-900 dark:text-white">Encryption Key</div>
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">
                {showKey ? settings.encryptionKey : '••••••••••••••••'}
              </code>
              <button
                onClick={handleCopyKey}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <Copy size={20} />
              </button>
            </div>

            <motion.button
              onClick={() => setShowRegenerateConfirm(true)}
              disabled={isRegenerating}
              className="flex items-center justify-center gap-2 w-full p-2 text-red-600
                       hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/20
                       disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={isRegenerating ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: isRegenerating ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCw className="w-5 h-5" />
              </motion.div>
              <span>{isRegenerating ? 'Generating New Key...' : 'Regenerate Key'}</span>
            </motion.button>
          </div>
        )}

        {/* Privacy Options */}
        <div className="space-y-3">
          <ToggleSwitch
            checked={settings.hideStreak}
            onChange={() => updateSettings({ hideStreak: !settings.hideStreak })}
            label="Hide Streak Count"
            description="Keep your streak count private"
          />

          <ToggleSwitch
            checked={settings.hideProgress}
            onChange={() => updateSettings({ hideProgress: !settings.hideProgress })}
            label="Hide Progress"
            description="Keep your progress private"
          />

          <ToggleSwitch
            checked={settings.privateMode}
            onChange={() => updateSettings({ privateMode: !settings.privateMode })}
            label="Private Mode"
            description="Hide all personal data from others"
          />
        </div>
      </div>

      <RegenerateKeyDialog 
        isOpen={showRegenerateConfirm}
        onClose={() => setShowRegenerateConfirm(false)}
        onConfirm={handleRegenerateKey}
      />
    </div>
  );
};
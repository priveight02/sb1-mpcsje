import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';

export const EmailSettings: React.FC = () => {
  const { user, updateUserEmail } = useAuthStore();
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [showVerificationSent, setShowVerificationSent] = useState(false);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail.trim() || !currentPassword.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newEmail === user?.email) {
      toast.error('New email must be different from current email');
      return;
    }

    try {
      setIsChanging(true);
      await updateUserEmail(newEmail, currentPassword);
      setNewEmail('');
      setCurrentPassword('');
      setShowVerificationSent(true);
      toast.success('Verification email sent to new address');
    } catch (error: any) {
      console.error('Failed to update email:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please sign in again before changing your email');
      } else {
        toast.error(error.message || 'Failed to update email');
      }
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
          <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">Email Settings</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your email preferences and security
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Current Email
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            user?.emailVerified ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <span className={user?.emailVerified ? 'text-green-600' : 'text-yellow-600'}>
            {user?.emailVerified ? 'Verified' : 'Not Verified'}
          </span>
        </div>
      </div>

      {showVerificationSent ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                Verification Email Sent
              </p>
              <p className="text-sm text-green-600/90 dark:text-green-400/90 mt-1">
                Please check your new email address ({newEmail}) to complete the verification process.
              </p>
              <button
                onClick={() => setShowVerificationSent(false)}
                className="mt-3 text-sm text-green-600 dark:text-green-400 hover:underline"
              >
                Change email again
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Email Address
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                       dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter new email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                         dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter current password"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-600 dark:text-yellow-500">
              <p className="font-medium">Important Security Notice</p>
              <p>Changing your email address requires re-authentication and email verification. Make sure you have access to your current email.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isChanging}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChanging ? 'Updating Email...' : 'Update Email Address'}
          </button>
        </form>
      )}
    </div>
  );
};
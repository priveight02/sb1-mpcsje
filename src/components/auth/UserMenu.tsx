import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface UserMenuProps {
  onAuthClick: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onAuthClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isGuest, logout } = useAuthStore();
  const navigate = useNavigate();

  const isAuthenticated = user || isGuest;

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      toast.success('Successfully signed out');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleSettingsClick = () => {
    navigate('/user-settings');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={isAuthenticated ? () => setIsOpen(!isOpen) : onAuthClick}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium overflow-hidden">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{isAuthenticated ? (user?.displayName?.[0]?.toUpperCase() || 'G') : <User size={20} />}</span>
          )}
        </div>
        <span className="text-white">
          {isAuthenticated ? (isGuest ? 'Guest' : user?.displayName || 'User') : 'Sign In'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && isAuthenticated && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
            >
              <div className="p-2 space-y-1">
                {!isGuest && (
                  <button
                    onClick={handleSettingsClick}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
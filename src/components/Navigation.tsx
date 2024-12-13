import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, Settings, PlusCircle, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserMenu } from './auth/UserMenu';
import { AuthModal } from './auth/AuthModal';
import { useAuthStore } from '../store/authStore';

interface NavigationProps {
  onAddHabit: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onAddHabit }) => {
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const { user, isGuest } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = user || isGuest;

  const tabs = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'notes', icon: BookOpen, label: 'Notes', path: '/notes', protected: true },
    { id: 'add', icon: PlusCircle, label: 'Add', protected: true },
    { id: 'calendar', icon: Calendar, label: 'Calendar', path: '/calendar', protected: true },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings', protected: true },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (!isAuthenticated && tab.protected) {
      setShowAuthModal(true);
      return;
    }

    if (tab.id === 'add') {
      onAddHabit();
    } else if (tab.path) {
      navigate(tab.path);
    }
  };

  // Show auth modal on initial load if accessing protected route
  React.useEffect(() => {
    const currentTab = tabs.find(tab => tab.path === location.pathname);
    if (!isAuthenticated && currentTab?.protected) {
      setShowAuthModal(true);
      navigate('/');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Handle auth modal close
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    if (!isAuthenticated) {
      navigate('/');
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 w-full bg-gray-800 border-t border-gray-700 px-6 pb-6 pt-2 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {tabs.map(({ id, icon: Icon, label, path, protected: isProtected }) => (
            <button
              key={id}
              onClick={() => handleTabClick({ id, icon: Icon, label, path, protected: isProtected })}
              className={`relative flex flex-col items-center ${
                id === 'add' ? '-mt-8' : ''
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-3 rounded-full ${
                  id === 'add'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-400'
                }`}
              >
                <Icon
                  size={id === 'add' ? 24 : 20}
                  className={
                    location.pathname === path
                      ? 'text-indigo-400'
                      : ''
                  }
                />
              </motion.div>
              <span
                className={`text-xs mt-1 ${
                  location.pathname === path
                    ? 'text-indigo-400'
                    : 'text-gray-400'
                }`}
              >
                {label}
              </span>
              {location.pathname === path && id !== 'add' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-2 w-12 h-1 rounded-full bg-indigo-400"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="absolute top-0 right-6 -translate-y-full">
          <UserMenu onAuthClick={() => setShowAuthModal(true)} />
        </div>
      </nav>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose}
      />
    </>
  );
};
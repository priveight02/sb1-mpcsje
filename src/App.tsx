import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Notes } from './components/Notes';
import { Calendar } from './components/Calendar';
import { Settings } from './components/Settings';
import { UserSettings } from './components/settings/UserSettings';
import { AddHabitModal } from './components/AddHabitModal';
import { HabitList } from './components/HabitList';
import { SuccessPage } from './components/store/SuccessPage';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from './store/themeStore';
import { ThemeProvider } from './components/ThemeProvider';

const App: React.FC = () => {
  const [showAddHabit, setShowAddHabit] = useState(false);
  const { currentTheme } = useThemeStore();

  // Apply theme classes to body
  useEffect(() => {
    document.body.className = `theme-${currentTheme}`;
  }, [currentTheme]);

  return (
    <Router>
      <ThemeProvider>
        <div className={`min-h-screen ${currentTheme}`}>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white',
              style: {
                background: '#1f2937',
                color: '#fff',
              },
            }}
          />
          
          <div className="pb-24">
            <Routes>
              <Route path="/" element={<HabitList />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/user-settings/*" element={<UserSettings />} />
              <Route path="/purchase/success" element={<SuccessPage />} />
            </Routes>
          </div>

          <Navigation 
            onAddHabit={() => setShowAddHabit(true)}
          />

          <AddHabitModal 
            isOpen={showAddHabit} 
            onClose={() => setShowAddHabit(false)} 
          />
        </div>
      </ThemeProvider>
    </Router>
  );
};

export default App;
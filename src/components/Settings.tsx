import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHabitStore } from '../store/habitStore';
import { NotificationSettingsModal } from './NotificationSettingsModal';
import { ShareHabitsModal } from './settings/ShareHabitsModal';
import { BattleModal } from './BattleModal';
import { BattleJoinModal } from './BattleJoinModal';
import { BattleControlPanel } from './battle/BattleControlPanel';
import { DataManagementModal } from './settings/DataManagement';
import { PrivacySettings } from './settings/PrivacySettings';
import { SettingsLayout } from './settings/SettingsLayout';
import { ShareSection } from './settings/sections/ShareSection';
import { BattleSection } from './settings/sections/BattleSection';
import { InsightsSection } from './settings/sections/InsightsSection';
import { ThemeSection } from './settings/sections/ThemeSection';
import { NotificationsSection } from './settings/sections/NotificationsSection';
import { DataSection } from './settings/sections/DataSection';
import { AdminDashboard } from './admin/AdminDashboard';
import { useAuthStore } from '../store/authStore';
import { X } from 'lucide-react';

export const Settings: React.FC = () => {
  const clearAllData = useHabitStore((state) => state.clearAllData);
  const { user } = useAuthStore();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShareHabits, setShowShareHabits] = useState(false);
  const [showCreateBattle, setShowCreateBattle] = useState(false);
  const [showJoinBattle, setShowJoinBattle] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [selectedBattleId, setSelectedBattleId] = useState<string | null>(null);
  const [showBattleControl, setShowBattleControl] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const isAdmin = user?.email === 'astral@riseup.net';

  const handleBattleSelect = (battleId: string) => {
    setSelectedBattleId(battleId);
    setShowBattleControl(true);
  };

  return (
    <SettingsLayout>
      <div className="space-y-4">
        <ShareSection onShowShareHabits={() => setShowShareHabits(true)} />
        
        <BattleSection
          onShowCreateBattle={() => setShowCreateBattle(true)}
          onShowJoinBattle={() => setShowJoinBattle(true)}
          onBattleSelect={handleBattleSelect}
        />
        
        <InsightsSection />
        
        <ThemeSection />
        
        <NotificationsSection onShowNotifications={() => setShowNotifications(true)} />
        
        <DataSection onClearData={clearAllData} />

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Admin Panel</h2>
            <p className="text-gray-400 mb-4">Access system-wide analytics and controls</p>
            <button
              onClick={() => setShowAdminPanel(true)}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Open Admin Dashboard
            </button>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <NotificationSettingsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      <ShareHabitsModal
        isOpen={showShareHabits}
        onClose={() => setShowShareHabits(false)}
      />
      <BattleModal
        isOpen={showCreateBattle}
        onClose={() => setShowCreateBattle(false)}
      />
      <BattleJoinModal
        isOpen={showJoinBattle}
        onClose={() => setShowJoinBattle(false)}
      />
      <DataManagementModal
        isOpen={showDataManagement}
        onClose={() => setShowDataManagement(false)}
      />
      {showBattleControl && selectedBattleId && (
        <BattleControlPanel
          battleId={selectedBattleId}
          onClose={() => {
            setShowBattleControl(false);
            setSelectedBattleId(null);
          }}
        />
      )}
      {showPrivacySettings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-6"
          >
            <PrivacySettings />
            <button
              onClick={() => setShowPrivacySettings(false)}
              className="mt-6 w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg
                       text-gray-600 dark:text-gray-400 hover:bg-gray-200
                       dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {showAdminPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 overflow-y-auto"
          >
            <div className="min-h-screen p-4">
              <div className="relative max-w-7xl mx-auto">
                <button
                  onClick={() => setShowAdminPanel(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg
                           hover:bg-gray-700/50 transition-colors z-10"
                >
                  <X size={24} />
                </button>
                <AdminDashboard />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SettingsLayout>
  );
};
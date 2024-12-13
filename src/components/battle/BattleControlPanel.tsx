import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Users, Trophy, Link as LinkIcon, Share2, Clock, ArrowUp, ArrowDown, Crown, 
  Shield, Copy, LogOut, Trash2, Play, Pause, Settings, Activity,
  MessageCircle, BarChart, Target
} from 'lucide-react';
import { useBattleStore } from '../../store/battleStore';
import { useAuthStore } from '../../store/authStore';
import { BattleChat } from './BattleChat';
import { BattleStats } from './BattleStats';
import toast from 'react-hot-toast';

interface BattleControlPanelProps {
  battleId: string;
  onClose: () => void;
}

export const BattleControlPanel: React.FC<BattleControlPanelProps> = ({ battleId, onClose }) => {
  const battle = useBattleStore((state) => state.getBattleById(battleId));
  const leaveBattle = useBattleStore((state) => state.leaveBattle);
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'chat'>('overview');

  if (!battle) return null;

  const isOwner = battle.ownerId === user?.uid;
  const battleLink = `${window.location.origin}/battle/${battleId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(battleLink)
      .then(() => toast.success('Battle link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleLeaveBattle = () => {
    if (window.confirm('Are you sure you want to leave this battle?')) {
      leaveBattle(battleId);
      onClose();
      toast.success('Left battle successfully');
    }
  };

  const handleDeleteBattle = () => {
    if (window.confirm('Are you sure you want to delete this battle? This action cannot be undone.')) {
      leaveBattle(battleId); // Owner leaving deletes the battle
      onClose();
      toast.success('Battle deleted successfully');
    }
  };

  return (
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
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {battle.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {battle.participants.length} participants
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Battle Status */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {new Date(battle.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">
                {battle.status}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: Users },
              { id: 'stats', label: 'Statistics', icon: BarChart },
              { id: 'chat', label: 'Chat', icon: MessageCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors
                         ${activeTab === id
                    ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Participants */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Participants
                  </h3>
                  <div className="space-y-3">
                    {battle.participants.map((participant) => (
                      <div
                        key={participant.userId}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {participant.isOwner && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="text-gray-900 dark:text-white">
                            {participant.username}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {participant.progress.completedHabits} habits completed
                          </span>
                          <div className="flex items-center gap-1 text-green-500">
                            <Target size={16} />
                            <span className="text-sm">
                              {participant.progress.streak} streak
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Battle Link */}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={battleLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 
                             dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                             hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Copy size={20} />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleLeaveBattle}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 
                             rounded-lg dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <LogOut size={16} />
                    Leave Battle
                  </button>
                  {isOwner && (
                    <button
                      onClick={handleDeleteBattle}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 
                               rounded-lg dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={16} />
                      Delete Battle
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <BattleStats battleId={battleId} />
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <BattleChat battleId={battleId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
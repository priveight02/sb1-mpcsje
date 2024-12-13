import React from 'react';
import { Trophy, Swords, Users, List } from 'lucide-react';
import { SettingsCard } from '../SettingsCard';
import { useBattleStore } from '../../../store/battleStore';
import { motion, AnimatePresence } from 'framer-motion';

interface BattleSectionProps {
  onShowCreateBattle: () => void;
  onShowJoinBattle: () => void;
  onBattleSelect: (battleId: string) => void;
}

export const BattleSection: React.FC<BattleSectionProps> = ({
  onShowCreateBattle,
  onShowJoinBattle,
  onBattleSelect
}) => {
  const [showBattlesList, setShowBattlesList] = React.useState(false);
  const participantBattles = useBattleStore((state) => state.getParticipantBattles());

  return (
    <SettingsCard
      icon={Trophy}
      title="Habits Battle"
      description="Compete with friends in habit challenges"
    >
      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={onShowCreateBattle}
            className="flex-1 flex items-center justify-center gap-2 p-4 rounded-lg
                   bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400
                   hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
          >
            <Swords className="w-5 h-5" />
            <span className="font-medium">Create New Battle</span>
          </button>
          
          <button
            onClick={() => setShowBattlesList(!showBattlesList)}
            className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 
                     dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 
                     transition-colors relative"
          >
            <List className="w-5 h-5" />
            {participantBattles.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 
                             rounded-full text-white text-xs flex items-center 
                             justify-center">
                {participantBattles.length}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={onShowJoinBattle}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-lg
                   bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                   hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                   border-2 border-dashed border-gray-200 dark:border-gray-700"
        >
          <Users className="w-5 h-5" />
          <span className="font-medium">Join Existing Battle</span>
        </button>

        <AnimatePresence>
          {showBattlesList && participantBattles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 mt-3">
                {participantBattles.map((battle) => (
                  <motion.button
                    key={battle.id}
                    onClick={() => onBattleSelect(battle.id)}
                    className="w-full flex items-center justify-between p-3 
                             bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 
                             dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-900 dark:text-white">
                        {battle.title}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SettingsCard>
  );
};
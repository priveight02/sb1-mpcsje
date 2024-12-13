import React from 'react';
import { Brain } from 'lucide-react';
import { SettingsCard } from '../SettingsCard';
import { useHabitStore } from '../../../store/habitStore';
import { PredictionInsights } from '../../insights/PredictionInsights';

export const InsightsSection: React.FC = () => {
  const habits = useHabitStore((state) => state.habits);
  const [selectedHabitForInsights, setSelectedHabitForInsights] = React.useState<string | null>(null);

  return (
    <SettingsCard
      icon={Brain}
      title="Insights & Predictions"
      description="View AI-powered insights for your habits"
    >
      {habits.length > 0 ? (
        <div className="space-y-4">
          <select
            value={selectedHabitForInsights || ''}
            onChange={(e) => setSelectedHabitForInsights(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg
                     border border-gray-200 dark:border-gray-600"
          >
            <option value="">Select a habit</option>
            {habits.map((habit) => (
              <option key={habit.id} value={habit.id}>
                {habit.title}
              </option>
            ))}
          </select>

          {selectedHabitForInsights && (
            <PredictionInsights habitId={selectedHabitForInsights} />
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
          Create some habits to see insights
        </p>
      )}
    </SettingsCard>
  );
};
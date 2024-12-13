import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, Lock, Shield, FileJson, X, Eye, EyeOff } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { usePrivacyStore } from '../../store/privacyStore';
import { useCalendarStore } from '../../store/calendarStore';
import toast from 'react-hot-toast';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [exportPassword, setExportPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const { settings: privacySettings, encryptData, decryptData } = usePrivacyStore();
  const habits = useHabitStore((state) => state.habits);
  const calendar = useCalendarStore((state) => state.scheduledTasks);

  const handleExport = async () => {
    try {
      const exportData = {
        habits,
        calendar,
        exportDate: new Date().toISOString(),
        version: '1.0',
      };

      let finalData = exportData;
      if (privacySettings.encryptData && exportPassword) {
        finalData = encryptData(exportData);
      }

      const blob = new Blob([JSON.stringify(finalData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trackhab-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      const fileContent = await importFile.text();
      let importedData = JSON.parse(fileContent);

      if (privacySettings.encryptData) {
        if (!exportPassword) {
          toast.error('Please enter the export password');
          return;
        }
        importedData = decryptData(importedData);
      }

      // Validate imported data structure
      if (!importedData.habits || !Array.isArray(importedData.habits)) {
        throw new Error('Invalid data format');
      }

      // Import data
      const habitStore = useHabitStore.getState();
      const calendarStore = useCalendarStore.getState();

      // Merge habits
      importedData.habits.forEach((habit: any) => {
        if (!habitStore.habits.find(h => h.id === habit.id)) {
          habitStore.addHabit(habit);
        }
      });

      // Merge calendar events
      if (importedData.calendar) {
        importedData.calendar.forEach((task: any) => {
          if (!calendarStore.scheduledTasks.find(t => t.id === task.id)) {
            calendarStore.addTask(task);
          }
        });
      }

      toast.success('Data imported successfully!');
      setImportFile(null);
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data. Please check the file format.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xl font-semibold dark:text-white">Data Management</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Export Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Export Data
                </h3>
                
                {privacySettings.encryptData && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Export Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={exportPassword}
                        onChange={(e) => setExportPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600
                                 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter password to encrypt export"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg
                           bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Export Data
                </button>
              </div>

              {/* Import Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Import Data
                </h3>

                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                             file:mr-4 file:py-2 file:px-4 file:rounded-lg
                             file:border-0 file:text-sm file:font-medium
                             file:bg-indigo-50 file:text-indigo-700
                             dark:file:bg-indigo-900/30 dark:file:text-indigo-400
                             hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/40"
                  />
                  {importFile && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Selected file: {importFile.name}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleImport}
                  disabled={!importFile}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg
                           bg-green-600 text-white hover:bg-green-700 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-5 h-5" />
                  Import Data
                </button>
              </div>

              {/* Privacy Notice */}
              <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  {privacySettings.encryptData
                    ? 'Your data will be encrypted before export. Make sure to save your password!'
                    : 'Consider enabling encryption in privacy settings for added security.'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
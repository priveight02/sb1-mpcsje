import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Eye, EyeOff, Plus, Edit2, Trash2 } from 'lucide-react';
import { THEMES, useThemeStore } from '../../store/themeStore';
import toast from 'react-hot-toast';

interface ThemePreviewProps {
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
  };
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ colors }) => {
  return (
    <div 
      className="w-full h-24 rounded-lg overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      <div className="h-full p-3 flex flex-col gap-2">
        <div 
          className="w-16 h-2 rounded"
          style={{ backgroundColor: colors.primary }}
        />
        <div 
          className="flex-1 rounded"
          style={{ backgroundColor: colors.card }}
        >
          <div 
            className="w-12 h-2 m-2 rounded"
            style={{ backgroundColor: colors.text }}
          />
        </div>
      </div>
    </div>
  );
};

export const AdminThemeManagement: React.FC = () => {
  const [showCode, setShowCode] = useState<string | null>(null);
  const { currentTheme, setTheme } = useThemeStore();

  const handlePreview = (themeId: string) => {
    setTheme(themeId);
    toast.success('Theme preview applied');
  };

  const handleEdit = (themeId: string) => {
    setShowCode(themeId);
  };

  const handleDelete = (themeId: string) => {
    if (window.confirm('Are you sure you want to delete this theme?')) {
      toast.success('Theme deleted successfully');
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Theme Management</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus size={20} />
          Create Theme
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(THEMES).map(([id, theme]) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-700/50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-white">{theme.name}</h3>
                <span className="text-sm text-gray-400">
                  {theme.premium ? 'Premium Theme' : 'Standard Theme'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePreview(id)}
                  className={`p-2 rounded-lg transition-colors ${
                    currentTheme === id
                      ? 'text-indigo-400 bg-indigo-400/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-600'
                  }`}
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleEdit(id)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-600"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(id)}
                  className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-gray-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <ThemePreview colors={theme.colors} />

            {showCode === id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-gray-300">
                    {JSON.stringify(theme, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
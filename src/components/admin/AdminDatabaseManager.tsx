import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, HardDrive, RefreshCw, Download, Upload, AlertTriangle, Search } from 'lucide-react';
import { format } from 'date-fns';

interface DatabaseStats {
  size: number;
  tables: number;
  records: number;
  lastBackup: string;
  performance: {
    queryTime: number;
    writeTime: number;
    readTime: number;
  };
}

export const AdminDatabaseManager: React.FC = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulated database statistics
  const stats: DatabaseStats = {
    size: 256, // MB
    tables: 12,
    records: 15234,
    lastBackup: new Date().toISOString(),
    performance: {
      queryTime: 45, // ms
      writeTime: 12, // ms
      readTime: 8, // ms
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsBackingUp(false);
  };

  return (
    <div className="space-y-6">
      {/* Database Overview */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium text-white">Database Size</h3>
          </div>
          <div className="text-2xl font-bold text-white">{stats.size} MB</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-green-400" />
            <h3 className="font-medium text-white">Total Tables</h3>
          </div>
          <div className="text-2xl font-bold text-white">{stats.tables}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-purple-400" />
            <h3 className="font-medium text-white">Total Records</h3>
          </div>
          <div className="text-2xl font-bold text-white">{stats.records.toLocaleString()}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-5 h-5 text-yellow-400" />
            <h3 className="font-medium text-white">Last Backup</h3>
          </div>
          <div className="text-lg font-bold text-white">
            {format(new Date(stats.lastBackup), 'MMM d, HH:mm')}
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-400 mb-1">Query Time</div>
            <div className="text-2xl font-bold text-white">{stats.performance.queryTime}ms</div>
            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(stats.performance.queryTime / 100) * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400 mb-1">Write Time</div>
            <div className="text-2xl font-bold text-white">{stats.performance.writeTime}ms</div>
            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${(stats.performance.writeTime / 100) * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400 mb-1">Read Time</div>
            <div className="text-2xl font-bold text-white">{stats.performance.readTime}ms</div>
            <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${(stats.performance.readTime / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Database Actions */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Backup & Restore</h3>
          <div className="space-y-4">
            <button
              onClick={handleBackup}
              disabled={isBackingUp}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isBackingUp ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
            </button>

            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
              <Upload className="w-5 h-5" />
              Restore from Backup
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4">Database Health</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-yellow-500/10 text-yellow-500 rounded-lg">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm">Recommended: Optimize database indexes for better performance</p>
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <RefreshCw className="w-5 h-5" />
              Optimize Database
            </button>
          </div>
        </div>
      </div>

      {/* Table Browser */}
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Table Browser</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tables..."
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 text-sm font-medium text-gray-400">Table Name</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Records</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Size</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {['users', 'habits', 'analytics', 'settings'].map((table) => (
                <tr key={table} className="hover:bg-gray-700/50">
                  <td className="py-3 text-white">{table}</td>
                  <td className="py-3 text-gray-300">{Math.floor(Math.random() * 1000)}</td>
                  <td className="py-3 text-gray-300">{Math.floor(Math.random() * 100)}MB</td>
                  <td className="py-3 text-gray-300">
                    {format(new Date(), 'MMM d, HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
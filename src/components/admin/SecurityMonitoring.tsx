import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, AlertTriangle, Clock, User, Activity, Globe,
  Filter, Search, RefreshCw, CheckCircle2, XCircle, 
  AlertCircle, MapPin, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { format, formatDistanceToNow } from 'date-fns';
import { useSecurityMonitoring } from '../../hooks/useSecurityMonitoring';

export const SecurityMonitoring: React.FC = () => {
  const [filter, setFilter] = useState({
    severity: 'all',
    type: 'all',
    search: '',
    timeRange: '24h'
  });

  const { 
    securityLogs,
    systemHealth,
    startRealtimeMonitoring,
    stopRealtimeMonitoring,
    getSecurityMetrics
  } = useAdminStore();

  const { logUserAction } = useSecurityMonitoring();

  useEffect(() => {
    startRealtimeMonitoring();
    return () => stopRealtimeMonitoring();
  }, []);

  const metrics = getSecurityMetrics();

  const filteredLogs = securityLogs
    .filter(log => {
      if (filter.severity !== 'all' && log.severity !== filter.severity) return false;
      if (filter.type !== 'all' && log.type !== filter.type) return false;
      if (filter.search && !log.message.toLowerCase().includes(filter.search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'auth': return User;
      case 'access': return Shield;
      case 'system': return Activity;
      case 'data': return Database;
      case 'admin': return Settings;
      default: return AlertCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-medium text-white">Critical Events</h3>
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics.criticalIncidents}
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm">
            {metrics.criticalTrend > 0 ? (
              <>
                <ArrowUpRight className="w-4 h-4 text-red-500" />
                <span className="text-red-500">+{metrics.criticalTrend}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="w-4 h-4 text-green-500" />
                <span className="text-green-500">{metrics.criticalTrend}%</span>
              </>
            )}
            <span className="text-gray-400 ml-1">vs last period</span>
          </div>
        </motion.div>

        {/* Add more metric cards here */}
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-gray-800 rounded-xl p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search security logs..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>

        <select
          value={filter.severity}
          onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value }))}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filter.type}
          onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="all">All Types</option>
          <option value="auth">Authentication</option>
          <option value="access">Access</option>
          <option value="system">System</option>
          <option value="data">Data</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={filter.timeRange}
          onChange={(e) => setFilter(prev => ({ ...prev, timeRange: e.target.value }))}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Security Logs */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Severity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredLogs.map((log) => {
                const TypeIcon = getTypeIcon(log.type);
                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{log.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-300">{log.message}</span>
                    </td>
                    <td className="px-4 py-3">
                      {log.metadata?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-300">
                            {log.metadata.location}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, Activity, AlertTriangle } from 'lucide-react';
import { EmailTemplateList } from './EmailTemplateList';
import { EmailStats } from './EmailStats';
import { EmailLogs } from './EmailLogs';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';
import toast from 'react-hot-toast';

interface EmailMetrics {
  sent: number;
  failed: number;
  openRate: number;
  clickRate: number;
}

export const EmailDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<EmailMetrics>({
    sent: 0,
    failed: 0,
    openRate: 0,
    clickRate: 0
  });

  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      const logsRef = collection(firestore, 'emailLogs');
      const daysAgo = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const logsQuery = query(
        logsRef,
        where('sentAt', '>=', startDate.toISOString())
      );

      const snapshot = await getDocs(logsQuery);
      const logs = snapshot.docs.map(doc => doc.data());

      const sent = logs.filter(log => log.status === 'sent').length;
      const failed = logs.filter(log => log.status === 'failed').length;
      const opened = logs.filter(log => log.openedAt).length;
      const clicked = logs.filter(log => log.clickedAt).length;

      setMetrics({
        sent,
        failed,
        openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
        clickRate: opened > 0 ? Math.round((clicked / opened) * 100) : 0
      });
    } catch (error) {
      console.error('Failed to load email metrics:', error);
      toast.error('Failed to load email metrics');
    }
  };

  return (
    <div className="space-y-6 bg-gray-900 p-6 rounded-xl">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-5 h-5 text-green-400" />
            <h3 className="font-medium text-white">Sent Emails</h3>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.sent}</div>
          <div className="text-sm text-gray-400">Last {timeRange}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium text-white">Open Rate</h3>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.openRate}%</div>
          <div className="text-sm text-gray-400">Average</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="font-medium text-white">Click Rate</h3>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.clickRate}%</div>
          <div className="text-sm text-gray-400">Average</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="font-medium text-white">Failed</h3>
          </div>
          <div className="text-2xl font-bold text-white">{metrics.failed}</div>
          <div className="text-sm text-gray-400">Last {timeRange}</div>
        </motion.div>
      </div>

      {/* Email Stats Chart */}
      <EmailStats timeRange={timeRange} onTimeRangeChange={setTimeRange} />

      {/* Email Templates */}
      <EmailTemplateList />

      {/* Email Logs */}
      <EmailLogs />
    </div>
  );
};
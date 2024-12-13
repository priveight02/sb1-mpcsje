import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Plus, Search, Filter, RefreshCw, CheckCircle2, XCircle2, 
  AlertTriangle, Clock, Users, Send, Settings, Template
} from 'lucide-react';
import { EmailTemplateModal } from './EmailTemplateModal';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { sendTemplatedEmail } from '../../utils/email';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface EmailStats {
  sent: number;
  failed: number;
  openRate: number;
  clickRate: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'notification' | 'newsletter' | 'reset_password';
  createdAt: string;
  updatedAt: string;
}

export const EmailNotificationManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [stats, setStats] = useState<EmailStats>({
    sent: 0,
    failed: 0,
    openRate: 0,
    clickRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('7d');
  const { user } = useAuthStore();

  const loadTemplatesAndStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch templates
      const templatesRef = collection(firestore, 'emailTemplates');
      const templatesQuery = query(templatesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(templatesQuery);
      
      const loadedTemplates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmailTemplate[];
      
      setTemplates(loadedTemplates);

      // Fetch email stats
      const statsRef = collection(firestore, 'emailStats');
      const statsQuery = query(statsRef, orderBy('timestamp', 'desc'), limit(1));
      const statsSnapshot = await getDocs(statsQuery);
      
      if (!statsSnapshot.empty) {
        const latestStats = statsSnapshot.docs[0].data() as EmailStats;
        setStats(latestStats);
      }

    } catch (error) {
      console.error('Failed to load email data:', error);
      toast.error('Failed to load email data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplatesAndStats();
  }, [timeRange]);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || template.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleTestEmail = async (templateId: string) => {
    if (!user?.email) {
      toast.error('No test email address available');
      return;
    }

    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      await sendTemplatedEmail(user.email, templateId, {
        userName: user.displayName || 'User',
        date: new Date().toLocaleDateString()
      });

      toast.success('Test email sent successfully');
    } catch (error) {
      console.error('Failed to send test email:', error);
      toast.error('Failed to send test email');
    }
  };

  return (
    <div className="space-y-6">
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
          <div className="text-2xl font-bold text-white">{stats.sent}</div>
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
          <div className="text-2xl font-bold text-white">{stats.openRate}%</div>
          <div className="text-sm text-gray-400">Average</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            <h3 className="font-medium text-white">Click Rate</h3>
          </div>
          <div className="text-2xl font-bold text-white">{stats.clickRate}%</div>
          <div className="text-sm text-gray-400">Average</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <XCircle2 className="w-5 h-5 text-red-400" />
            <h3 className="font-medium text-white">Failed</h3>
          </div>
          <div className="text-2xl font-bold text-white">{stats.failed}</div>
          <div className="text-sm text-gray-400">Last {timeRange}</div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 bg-gray-800 rounded-xl p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="all">All Types</option>
          <option value="welcome">Welcome</option>
          <option value="notification">Notification</option>
          <option value="newsletter">Newsletter</option>
          <option value="reset_password">Password Reset</option>
        </select>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>

        <button
          onClick={() => loadTemplatesAndStats()}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
        >
          <RefreshCw size={20} />
        </button>

        <button
          onClick={() => setShowTemplateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                   transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          New Template
        </button>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No email templates found
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Template className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="font-medium text-white">{template.name}</h3>
                    <p className="text-sm text-gray-400">{template.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    template.type === 'welcome' ? 'bg-green-500/20 text-green-400' :
                    template.type === 'notification' ? 'bg-blue-500/20 text-blue-400' :
                    template.type === 'newsletter' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {template.type}
                  </span>
                  <button
                    onClick={() => handleTestEmail(template.id)}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                  >
                    <Send size={16} />
                  </button>
                  <button
                    onClick={() => {/* Implement edit */}}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Last modified: {new Date(template.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {template.type === 'welcome' ? 'Sent on user registration' :
                   template.type === 'notification' ? 'Sent on events' :
                   template.type === 'newsletter' ? 'Sent manually' :
                   'Sent on password reset'}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showTemplateModal && (
          <EmailTemplateModal
            onClose={() => setShowTemplateModal(false)}
            onSuccess={loadTemplatesAndStats}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
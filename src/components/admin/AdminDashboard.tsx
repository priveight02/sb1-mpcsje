import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Users, Shield, BarChart, FileText, 
  Palette, Settings, Lock, Database, Server, Mail,
  FileSpreadsheet
} from 'lucide-react';
import { AdminStats } from './AdminStats';
import { AdminUserManagement } from './AdminUserManagement';
import { ContentManagement } from './content/ContentManagement';
import { AdminThemeManagement } from './AdminThemeManagement';
import { AdminSecurityLogs } from './AdminSecurityLogs';
import { AdminSystemHealth } from './AdminSystemHealth';
import { AdminSettings } from './AdminSettings';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminDatabaseManager } from './AdminDatabaseManager';
import { AdminServerMonitor } from './AdminServerMonitor';
import { EmailDashboard } from './email/EmailDashboard';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

type TabId = 'overview' | 'users' | 'analytics' | 'security' | 'content' | 'themes' | 'system' | 'database' | 'server' | 'settings' | 'email';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'themes', label: 'Themes', icon: Palette },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'server', label: 'Server', icon: Server },
    { id: 'settings', label: 'Settings', icon: Lock }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminStats />;
      case 'users':
        return <AdminUserManagement />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'security':
        return <AdminSecurityLogs />;
      case 'content':
        return <ContentManagement />;
      case 'themes':
        return <AdminThemeManagement />;
      case 'email':
        return <EmailDashboard />;
      case 'system':
        return <AdminSystemHealth />;
      case 'database':
        return <AdminDatabaseManager />;
      case 'server':
        return <AdminServerMonitor />;
      case 'settings':
        return <AdminSettings />;
      default:
        return null;
    }
  };

  return (
    <PanelGroup direction="horizontal">
      {/* Sidebar */}
      <Panel defaultSize={20} minSize={15} maxSize={25}>
        <div className="h-screen bg-gray-800 p-4">
          <div className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabId)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-indigo-500 transition-colors" />

      {/* Main Content */}
      <Panel defaultSize={80}>
        <div className="h-screen overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </Panel>
    </PanelGroup>
  );
};
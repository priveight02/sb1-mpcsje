import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Send, Settings, Trash2, RefreshCw } from 'lucide-react';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';
import { useAuthStore } from '../../../store/authStore';
import { EmailTemplateEditor } from './EmailTemplateEditor';
import { EmailCampaignModal } from './EmailCampaignModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'notification' | 'newsletter' | 'reset_password';
  createdAt: string;
  updatedAt: string;
}

export const EmailTemplateList: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const templatesRef = collection(firestore, 'emailTemplates');
      const templatesQuery = query(templatesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(templatesQuery);
      
      const loadedTemplates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmailTemplate[];
      
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await deleteDoc(doc(firestore, 'emailTemplates', templateId));
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleSendCampaign = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowCampaignModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Email Templates</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadTemplates()}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={() => setShowTemplateEditor(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                     transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            New Template
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No email templates found
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-400" />
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
                    onClick={() => handleSendCampaign(template)}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                  >
                    <Send size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setShowTemplateEditor(true);
                    }}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                  >
                    <Settings size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-gray-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Last modified: {format(new Date(template.updatedAt), 'MMM d, yyyy HH:mm')}
                </div>
                <div className="flex items-center gap-1">
                  {template.type === 'welcome' ? 'Sent on user registration' :
                   template.type === 'notification' ? 'Sent on events' :
                   template.type === 'newsletter' ? 'Sent manually' :
                   'Sent on password reset'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Template Editor Modal */}
      <AnimatePresence>
        {showTemplateEditor && (
          <EmailTemplateEditor
            template={selectedTemplate || undefined}
            onClose={() => {
              setShowTemplateEditor(false);
              setSelectedTemplate(null);
            }}
            onSave={() => {
              loadTemplates();
              setShowTemplateEditor(false);
              setSelectedTemplate(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Campaign Modal */}
      <AnimatePresence>
        {showCampaignModal && selectedTemplate && (
          <EmailCampaignModal
            template={selectedTemplate}
            onClose={() => {
              setShowCampaignModal(false);
              setSelectedTemplate(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
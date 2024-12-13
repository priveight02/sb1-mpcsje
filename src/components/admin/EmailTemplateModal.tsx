import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Mail } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuthStore } from '../../store/authStore';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { securityLogger } from '../../utils/securityLogger';
import toast from 'react-hot-toast';

interface EmailTemplateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    type: 'notification' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const templateData = {
        ...formData,
        createdBy: user?.uid || 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(firestore, 'emailTemplates'), templateData);

      securityLogger.logDataEvent(
        'create',
        user?.uid || 'system',
        'email_template',
        true
      );

      toast.success('Email template created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create template:', error);
      securityLogger.logDataEvent(
        'create',
        user?.uid || 'system',
        'email_template',
        false
      );
      toast.error('Failed to create template');
    }
  };

  return (
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
        className="bg-gray-800 rounded-xl w-full max-w-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-semibold text-white">New Email Template</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Enter template name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject Line
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Enter email subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Template Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="welcome">Welcome Email</option>
              <option value="notification">Notification</option>
              <option value="newsletter">Newsletter</option>
              <option value="reset_password">Password Reset</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Body
            </label>
            <div className="bg-gray-700 rounded-lg overflow-hidden">
              <ReactQuill
                theme="snow"
                value={formData.body}
                onChange={(content) => setFormData({ ...formData, body: content })}
                className="text-white"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'clean']
                  ]
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                     transition-colors flex items-center gap-2"
            >
              <Save size={20} />
              Save Template
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw } from 'lucide-react';
import { ContentList } from './ContentList';
import { ContentEditor } from './ContentEditor';
import { ContentStats } from './ContentStats';
import toast from 'react-hot-toast';

export const ContentManagement: React.FC = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPages: 42,
    totalImages: 18,
    totalViews: 12500,
    averageViewsPerPage: 208,
    publishedContent: 35,
    draftContent: 25,
    lastPublished: new Date().toISOString(),
    topPerformingContent: [
      { title: 'Getting Started Guide', views: 2500, type: 'page' },
      { title: 'Feature Overview', views: 1800, type: 'page' },
      { title: 'Hero Banner', views: 1200, type: 'image' },
      { title: 'Tutorial Video', views: 950, type: 'page' },
    ],
  });

  const handleEdit = (content: any) => {
    setEditingContent(content);
    setShowEditor(true);
  };

  const handleDelete = async (contentId: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        // Delete content logic here
        toast.success('Content deleted successfully');
      } catch (error) {
        console.error('Failed to delete content:', error);
        toast.error('Failed to delete content');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Content Management</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditor(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                     transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Content
          </button>
        </div>
      </div>

      {/* Content Stats */}
      <ContentStats stats={stats} />

      {/* Content List */}
      <ContentList
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Content Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <ContentEditor
            content={editingContent}
            onClose={() => {
              setShowEditor(false);
              setEditingContent(null);
            }}
            onSave={() => {
              setShowEditor(false);
              setEditingContent(null);
              // Refresh content list
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Image, Link, Edit2, Trash2, Plus, Search, 
  Filter, MessageSquare, Calendar, Eye, EyeOff, Copy, 
  RefreshCw, CheckCircle2, XCircle2, AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ContentModal } from './ContentModal';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { securityLogger } from '../../utils/securityLogger';
import toast from 'react-hot-toast';

interface Content {
  id: string;
  title: string;
  type: 'page' | 'image' | 'link';
  status: 'published' | 'draft';
  author: string;
  lastModified: string;
  description?: string;
  url?: string;
  content?: string;
  views?: number;
  tags?: string[];
}

export const ContentManagement: React.FC = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { user } = useAuthStore();

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const contentRef = collection(firestore, 'content');
      const contentQuery = query(contentRef, orderBy('lastModified', 'desc'));
      const snapshot = await getDocs(contentQuery);
      
      const contentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Content[];

      setContent(contentData);
      
      securityLogger.logDataEvent(
        'read',
        user?.uid || 'system',
        'content',
        true
      );
    } catch (error) {
      console.error('Failed to load content:', error);
      securityLogger.logDataEvent(
        'read',
        user?.uid || 'system',
        'content',
        false
      );
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleDelete = async (contentId: string) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      await deleteDoc(doc(firestore, 'content', contentId));
      await loadContent();
      
      securityLogger.logDataEvent(
        'delete',
        user?.uid || 'system',
        'content',
        true
      );
      
      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Failed to delete content:', error);
      securityLogger.logDataEvent(
        'delete',
        user?.uid || 'system',
        'content',
        false
      );
      toast.error('Failed to delete content');
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: Content['type']) => {
    switch (type) {
      case 'page':
        return FileText;
      case 'image':
        return Image;
      case 'link':
        return Link;
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Stats */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium text-white">Total Pages</h3>
          </div>
          <div className="text-2xl font-bold text-white">
            {content.filter(c => c.type === 'page').length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Image className="w-5 h-5 text-green-400" />
            <h3 className="font-medium text-white">Media Items</h3>
          </div>
          <div className="text-2xl font-bold text-white">
            {content.filter(c => c.type === 'image').length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-purple-400" />
            <h3 className="font-medium text-white">Total Views</h3>
          </div>
          <div className="text-2xl font-bold text-white">
            {content.reduce((sum, item) => sum + (item.views || 0), 0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h3 className="font-medium text-white">Draft Items</h3>
          </div>
          <div className="text-2xl font-bold text-white">
            {content.filter(c => c.status === 'draft').length}
          </div>
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
            placeholder="Search content..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="all">All Types</option>
          <option value="page">Pages</option>
          <option value="image">Images</option>
          <option value="link">Links</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <button
          onClick={loadContent}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
        >
          <RefreshCw size={20} />
        </button>

        <button
          onClick={() => setShowContentModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                   transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Content
        </button>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No content found
          </div>
        ) : (
          filteredContent.map((item) => {
            const TypeIcon = getTypeIcon(item.type);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <TypeIcon className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="font-medium text-white">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-400">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.status}
                    </span>
                    {item.type === 'link' && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.url || '');
                          toast.success('Link copied to clipboard');
                        }}
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                      >
                        <Copy size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingContent(item);
                        setShowContentModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-gray-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Last modified: {new Date(item.lastModified).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    By {item.author}
                  </div>
                  {item.views !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {item.views} views
                    </div>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {showContentModal && (
          <ContentModal
            content={editingContent}
            onClose={() => {
              setShowContentModal(false);
              setEditingContent(null);
            }}
            onSuccess={() => {
              loadContent();
              setShowContentModal(false);
              setEditingContent(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
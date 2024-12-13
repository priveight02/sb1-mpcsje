import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, Link, Edit2, Trash2, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface Content {
  id: string;
  title: string;
  type: 'page' | 'image' | 'link';
  status: 'published' | 'draft';
  author: string;
  lastModified: string;
}

export const AdminContentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const content: Content[] = [
    {
      id: '1',
      title: 'Privacy Policy',
      type: 'page',
      status: 'published',
      author: 'Admin',
      lastModified: '2024-01-20T10:00:00Z'
    },
    {
      id: '2',
      title: 'Hero Banner',
      type: 'image',
      status: 'published',
      author: 'Designer',
      lastModified: '2024-01-19T15:30:00Z'
    },
    {
      id: '3',
      title: 'Terms of Service',
      type: 'page',
      status: 'draft',
      author: 'Admin',
      lastModified: '2024-01-18T09:45:00Z'
    }
  ];

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

  const handleEdit = (id: string) => {
    toast.success('Opening content editor...');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      toast.success('Content deleted successfully');
    }
  };

  const filteredContent = content.filter(item => 
    (selectedType === 'all' || item.type === selectedType) &&
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Content Management</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Plus size={20} />
          Add Content
        </button>
      </div>

      <div className="flex gap-4 mb-6">
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
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
        >
          <option value="all">All Types</option>
          <option value="page">Pages</option>
          <option value="image">Images</option>
          <option value="link">Links</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredContent.map((item, index) => {
          const TypeIcon = getTypeIcon(item.type);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <TypeIcon className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-medium text-white">{item.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>By {item.author}</span>
                    <span>•</span>
                    <span>Last modified: {new Date(item.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.status === 'published' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {item.status}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-600"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-gray-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, FileText, Image, Link, Upload } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuthStore } from '../../../store/authStore';
import { createContent, updateContent } from '../../../utils/contentManager';
import toast from 'react-hot-toast';

interface ContentEditorProps {
  content?: {
    id: string;
    title: string;
    description?: string;
    type: 'page' | 'image' | 'link';
    status: 'draft' | 'published';
    body: string;
    tags?: string[];
  };
  onClose: () => void;
  onSave: () => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  onClose,
  onSave,
}) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: content?.title || '',
    description: content?.description || '',
    type: content?.type || 'page',
    status: content?.status || 'draft',
    body: content?.body || '',
    tags: content?.tags || [],
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      setIsSubmitting(true);

      if (content?.id) {
        await updateContent(
          content.id,
          formData.body,
          {
            title: formData.title,
            description: formData.description,
            type: formData.type,
            status: formData.status,
            tags: formData.tags,
            author: user?.uid || 'system'
          },
          file
        );
      } else {
        await createContent(
          formData.body,
          {
            title: formData.title,
            description: formData.description,
            type: formData.type,
            status: formData.status,
            tags: formData.tags,
            author: user?.uid || 'system'
          },
          file
        );
      }

      toast.success(content?.id ? 'Content updated successfully' : 'Content created successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Content operation error:', error);
      toast.error(content?.id ? 'Failed to update content' : 'Failed to create content');
    } finally {
      setIsSubmitting(false);
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
              <FileText className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-semibold text-white">
                {content ? 'Edit Content' : 'Create Content'}
              </h2>
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
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Enter content title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              placeholder="Enter content description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="page">Page</option>
                <option value="post">Post</option>
                <option value="image">Image</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {formData.type === 'image' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Image
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">
                      SVG, PNG, JPG or GIF (MAX. 800x400px)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              {file && (
                <p className="mt-2 text-sm text-gray-400">
                  Selected file: {file.name}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content
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
                      ['link', 'image', 'clean']
                    ]
                  }}
                />
              </div>
            </div>
          )}

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
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                     transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {isSubmitting ? 'Saving...' : 'Save Content'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
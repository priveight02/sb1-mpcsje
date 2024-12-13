import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, Eye, Clock } from 'lucide-react';

interface ContentStats {
  totalPages: number;
  totalImages: number;
  totalViews: number;
  averageViewsPerPage: number;
  publishedContent: number;
  draftContent: number;
  lastPublished: string;
  topPerformingContent: {
    title: string;
    views: number;
    type: 'page' | 'image';
  }[];
}

interface ContentStatsProps {
  stats: ContentStats;
}

export const ContentStats: React.FC<ContentStatsProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
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
            {stats.totalPages}
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
            {stats.totalImages}
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
            {stats.totalViews.toLocaleString()}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <h3 className="font-medium text-white">Published/Draft</h3>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.publishedContent}/{stats.draftContent}
          </div>
        </motion.div>
      </div>

      {/* Top Performing Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <h3 className="text-lg font-medium text-white mb-4">Top Performing Content</h3>
        <div className="space-y-4">
          {stats.topPerformingContent.map((content, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {content.type === 'page' ? (
                  <FileText className="w-5 h-5 text-blue-400" />
                ) : (
                  <Image className="w-5 h-5 text-green-400" />
                )}
                <span className="text-white">{content.title}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Eye className="w-4 h-4" />
                <span>{content.views.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Content Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 rounded-xl p-6"
      >
        <h3 className="text-lg font-medium text-white mb-4">Content Distribution</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Pages vs Media</span>
              <span>{Math.round((stats.totalPages / (stats.totalPages + stats.totalImages)) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${(stats.totalPages / (stats.totalPages + stats.totalImages)) * 100}%`
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Published vs Draft</span>
              <span>
                {Math.round((stats.publishedContent / (stats.publishedContent + stats.draftContent)) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${(stats.publishedContent / (stats.publishedContent + stats.draftContent)) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
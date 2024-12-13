import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Send, Filter, Search } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore, functions } from '../../../config/firebase';
import { httpsCallable } from 'firebase/functions';
import toast from 'react-hot-toast';

interface EmailCampaignModalProps {
  template: {
    id: string;
    name: string;
    subject: string;
  };
  onClose: () => void;
}

interface User {
  id: string;
  email: string;
  displayName: string;
  lastLoginAt: string;
  status: 'active' | 'inactive';
}

export const EmailCampaignModal: React.FC<EmailCampaignModalProps> = ({
  template,
  onClose
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersRef = collection(firestore, 'users');
      const usersQuery = query(usersRef, where('email', '!=', null));
      const snapshot = await getDocs(usersQuery);
      
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleSendCampaign = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    try {
      setIsSending(true);
      const sendCampaign = httpsCallable(functions, 'sendEmailCampaign');
      await sendCampaign({
        templateId: template.id,
        userIds: selectedUsers
      });
      
      toast.success(`Campaign sent to ${selectedUsers.length} recipients`);
      onClose();
    } catch (error) {
      console.error('Failed to send campaign:', error);
      toast.error('Failed to send campaign');
    } finally {
      setIsSending(false);
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
            <div>
              <h2 className="text-xl font-semibold text-white">Send Campaign</h2>
              <p className="text-sm text-gray-400 mt-1">
                Template: {template.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* User List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length}
                    onChange={handleSelectAll}
                    className="rounded text-indigo-600 focus:ring-indigo-500 bg-gray-700 border-gray-600"
                  />
                  <span>Select All ({filteredUsers.length} users)</span>
                </div>
                <span>{selectedUsers.length} selected</span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => {
                        setSelectedUsers(prev =>
                          prev.includes(user.id)
                            ? prev.filter(id => id !== user.id)
                            : [...prev, user.id]
                        );
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500 bg-gray-700 border-gray-600"
                    />
                    <div className="ml-3">
                      <div className="text-white">{user.displayName}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                    <div className={`ml-auto px-2 py-1 text-xs rounded-full ${
                      user.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.status}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSendCampaign}
              disabled={selectedUsers.length === 0 || isSending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                     transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={20} />
              {isSending ? 'Sending...' : `Send to ${selectedUsers.length} Recipients`}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
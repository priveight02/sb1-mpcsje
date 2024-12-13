import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Bell, Plus, Save, AlarmClock } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { Task } from '../../types/task';
import toast from 'react-hot-toast';

interface TaskModalProps {
  onClose: () => void;
  editTask?: Task;
}

export const TaskModal: React.FC<TaskModalProps> = ({ onClose, editTask }) => {
  const { addTask, updateTask } = useTaskStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    dueDate: new Date().toISOString().split('T')[0],
    scheduledTime: '',
    reminders: {
      enabled: false,
      alarmEnabled: false,
      times: [] as string[],
      notifyBefore: 15,
      alarmTime: ''
    }
  });

  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title,
        description: editTask.description || '',
        priority: editTask.priority,
        dueDate: editTask.dueDate,
        scheduledTime: editTask.scheduledTime || '',
        reminders: {
          enabled: editTask.reminders.enabled,
          alarmEnabled: editTask.reminders.alarmEnabled || false,
          times: editTask.reminders.times || [],
          notifyBefore: editTask.reminders.notifyBefore || 15,
          alarmTime: editTask.reminders.alarmTime || ''
        }
      });
    }
  }, [editTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    if (formData.reminders.alarmEnabled && !formData.reminders.alarmTime) {
      toast.error('Please set an alarm time');
      return;
    }

    try {
      if (editTask) {
        updateTask(editTask.id, {
          ...editTask,
          ...formData
        });
        toast.success('Task updated successfully!');
      } else {
        addTask(formData);
        toast.success('Task created successfully!');
      }
      onClose();
    } catch (error) {
      toast.error(editTask ? 'Failed to update task' : 'Failed to create task');
      console.error('Task operation error:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            {editTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg 
                     hover:bg-gray-700 transition-colors"
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
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter task title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter task description"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                     text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Due Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                         text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Scheduled Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                         text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-medium text-gray-300">
                Enable Reminders
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.reminders.enabled}
              onChange={(e) => setFormData({
                ...formData,
                reminders: { ...formData.reminders, enabled: e.target.checked }
              })}
              className="rounded text-indigo-600 focus:ring-indigo-500 bg-gray-700 border-gray-600"
            />
          </label>

          {formData.reminders.enabled && (
            <div className="mt-3 p-4 bg-gray-700/50 rounded-lg space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Notify Before (minutes)
                </label>
                <input
                  type="number"
                  value={formData.reminders.notifyBefore}
                  onChange={(e) => setFormData({
                    ...formData,
                    reminders: { ...formData.reminders, notifyBefore: Number(e.target.value) }
                  })}
                  min="1"
                  max="120"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                           text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="border-t border-gray-600 pt-4">
                <label className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlarmClock className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-medium text-gray-300">
                      Set Alarm
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.reminders.alarmEnabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      reminders: { ...formData.reminders, alarmEnabled: e.target.checked }
                    })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 bg-gray-700 border-gray-600"
                  />
                </label>

                {formData.reminders.alarmEnabled && (
                  <div className="mt-2">
                    <label className="block text-sm text-gray-300 mb-1">
                      Alarm Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="time"
                        value={formData.reminders.alarmTime}
                        onChange={(e) => setFormData({
                          ...formData,
                          reminders: { ...formData.reminders, alarmTime: e.target.value }
                        })}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg 
                                 text-white focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                     transition-colors flex items-center gap-2"
          >
            {editTask ? <Save size={20} /> : <Plus size={20} />}
            {editTask ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};
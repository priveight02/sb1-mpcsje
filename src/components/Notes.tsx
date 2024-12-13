import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { useHabitStore } from '../store/habitStore';
import * as Tabs from '@radix-ui/react-tabs';
import toast from 'react-hot-toast';

export const Notes: React.FC = () => {
  const { habits, addNote, deleteNote, updateNote } = useHabitStore();
  const [selectedHabit, setSelectedHabit] = useState(habits[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  const handleAddNote = () => {
    if (!selectedHabit) {
      toast.error('Please select a habit first');
      return;
    }
    setIsEditing(true);
    setNoteContent('');
  };

  const handleSaveNote = () => {
    if (!noteContent.trim()) {
      toast.error('Note cannot be empty');
      return;
    }
    
    addNote(selectedHabit, {
      id: crypto.randomUUID(),
      content: noteContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    setIsEditing(false);
    setNoteContent('');
    toast.success('Note saved successfully');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pb-24 max-w-3xl mx-auto"
    >
      <div className="sticky top-0 bg-white dark:bg-gray-900 pt-8 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notes</h1>
          <button
            onClick={handleAddNote}
            className="btn btn-primary flex items-center gap-2"
            disabled={!habits.length}
          >
            <Plus size={20} />
            Add Note
          </button>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Create some habits first to start taking notes!
        </div>
      ) : (
        <Tabs.Root
          value={selectedHabit || habits[0]?.id}
          onValueChange={setSelectedHabit}
          className="space-y-4"
        >
          <Tabs.List className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {habits.map((habit) => (
              <Tabs.Trigger
                key={habit.id}
                value={habit.id}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors
                  ${selectedHabit === habit.id
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
              >
                {habit.title}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {habits.map((habit) => (
            <Tabs.Content
              key={habit.id}
              value={habit.id}
              className="space-y-4"
            >
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write your note here..."
                    className="w-full h-48 p-4 rounded-lg border border-gray-300 dark:border-gray-600 
                             dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn bg-gray-100 text-gray-700 hover:bg-gray-200
                               dark:bg-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNote}
                      className="btn btn-primary"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {habit.notes?.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <CalendarIcon size={16} />
                          {format(new Date(note.createdAt), 'MMM d, yyyy')}
                          <Tag size={16} className="ml-2" />
                          {habit.title}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setNoteContent(note.content);
                              setIsEditing(true);
                            }}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100
                                     dark:text-gray-400 dark:hover:bg-gray-700"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this note?')) {
                                deleteNote(habit.id, note.id);
                                toast.success('Note deleted successfully');
                              }
                            }}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50
                                     dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                        {note.content}
                      </div>
                    </motion.div>
                  ))}
                  {!habit.notes?.length && !isEditing && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No notes yet. Click the "Add Note" button to create one!
                    </div>
                  )}
                </AnimatePresence>
              )}
            </Tabs.Content>
          ))}
        </Tabs.Root>
      )}
    </motion.div>
  );
};
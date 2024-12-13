import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Clock } from 'lucide-react';
import { useBattleStore } from '../../store/battleStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface BattleChatProps {
  battleId: string;
}

export const BattleChat: React.FC<BattleChatProps> = ({ battleId }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const messages = useBattleStore((state) => state.getMessages(battleId));
  const sendMessage = useBattleStore((state) => state.sendMessage);
  const syncMessages = useBattleStore((state) => state.syncMessages);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Set up real-time message polling
  useEffect(() => {
    // Initial sync
    syncMessages(battleId);

    // Set up polling interval for real-time updates
    const pollInterval = setInterval(() => {
      syncMessages(battleId);
    }, 3000); // Poll every 3 seconds

    // Request notification permission if needed
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      clearInterval(pollInterval);
    };
  }, [battleId, syncMessages]);

  const handleSend = async () => {
    if (!message.trim() || isSending || !user) {
      if (!user) toast.error('Please sign in to send messages');
      return;
    }

    setIsSending(true);
    try {
      await sendMessage(battleId, {
        userId: user.uid,
        username: user.displayName || 'Anonymous',
        content: message.trim(),
        timestamp: new Date().toISOString()
      });

      setMessage('');
      
      // Force scroll to bottom after sending
      if (chatRef.current) {
        setTimeout(() => {
          chatRef.current?.scrollTo({
            top: chatRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[400px]">
      {/* Messages */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-400"
            >
              No messages yet. Start the conversation!
            </motion.div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex items-start gap-3 ${
                  msg.userId === user?.uid ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center
                             ${msg.userId === user?.uid 
                               ? 'bg-indigo-100 dark:bg-indigo-900/50' 
                               : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  <User className={`w-4 h-4 ${
                    msg.userId === user?.uid
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                </div>
                <div
                  className={`max-w-[70%] ${
                    msg.userId === user?.uid
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600'
                  } rounded-lg p-3`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${
                      msg.userId === user?.uid
                        ? 'text-indigo-100'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {msg.username}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className={`w-3 h-3 ${
                        msg.userId === user?.uid
                          ? 'text-indigo-200'
                          : 'text-gray-500 dark:text-gray-400'
                      }`} />
                      <span className={`text-xs ${
                        msg.userId === user?.uid
                          ? 'text-indigo-200'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {format(new Date(msg.timestamp), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={user ? "Type your message..." : "Sign in to chat"}
          disabled={!user || isSending}
          className="flex-1 min-h-[2.5rem] max-h-32 p-2 bg-gray-50 dark:bg-gray-700 
                   border border-gray-300 dark:border-gray-600 rounded-lg resize-none
                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed"
          rows={1}
        />
        <motion.button
          onClick={handleSend}
          disabled={!message.trim() || !user || isSending}
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className={`w-5 h-5 ${isSending ? 'animate-pulse' : ''}`} />
        </motion.button>
      </div>
    </div>
  );
};
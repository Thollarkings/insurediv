import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { LogOut, ShieldCheck, User, X } from 'lucide-react';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';

const Admin = () => {
  // Convex hooks
  const messages = useQuery(api.messages.listMessages) || [];
  const sendMessage = useMutation(api.messages.sendMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const editMessage = useMutation(api.messages.editMessage);
  const pinMessage = useMutation(api.messages.pinMessage);

  // Local state
  const [newMessage, setNewMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  // Check if user is admin on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const user = await api.staff.getCurrentUser();
        setCurrentUser(user);
        setIsAdmin(user?.role === 'admin');
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    checkAdminStatus();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (body) => {
    try {
      await sendMessage({ body });
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message: ' + err.message);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await deleteMessage({ messageId });
    } catch (err) {
      console.error('Failed to delete message:', err);
      alert('Failed to delete message: ' + err.message);
    }
  };

  const handleEdit = async (messageId, newBody) => {
    try {
      await editMessage({ messageId, newBody });
    } catch (err) {
      console.error('Failed to edit message:', err);
      alert('Failed to edit message: ' + err.message);
    }
  };

  const handlePin = async (messageId) => {
    try {
      await pinMessage({ messageId });
    } catch (err) {
      console.error('Failed to pin message:', err);
      alert('Failed to pin message: ' + err.message);
    }
  };

  // If not authenticated, redirect to login (handled by ConvexAuthProvider)
  if (!currentUser) {
    return null; // ConvexAuthProvider will show the login UI
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-bold text-[#002147]">Behind the Scenes</h1>
            <p className="text-gray-500">
              Signed in as <strong>{currentUser?.name}</strong> (
              {currentUser?.role === 'admin' ? 'Admin' : 'Staff'}
              )
            </p>
          </div>
          <button
            onClick={() => api.auth.signOut()}
            className="flex items-center gap-2 text-[#002147] font-bold hover:text-[#D4AF37] transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 flex flex-col h-[70vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b bg-[#002147] text-white flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            <h4 className="font-bold">Top Notch-Chat — Secure Staff Channel</h4>
            <span className="flex items-center gap-1.5 text-xs text-green-400 font-semibold">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Live
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                No messages yet. Start the conversation!
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessage
                key={msg._id}
                message={msg}
                currentUserEmail={currentUser?.email}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPin={handlePin}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput
            onSend={handleSend}
            placeholder="Type a secure message..."
          />
        </div>
      </div>
    </div>
  );
};

export default Admin;

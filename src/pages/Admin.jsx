import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useAuthActions } from '@convex-dev/auth/react';
import { api } from '../../convex/_generated/api';
import { LogOut, ShieldCheck, User } from 'lucide-react';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';

// =============================================================================
// LoginForm Component
// =============================================================================

function LoginForm({ signIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn('password', { email, password, flow: 'signIn' });
    } catch (err) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#002147] rounded-3xl mb-6">
            <ShieldCheck className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h1 className="text-4xl font-bold text-[#002147] mb-4">Staff Login</h1>
          <p className="text-xl text-gray-600">Sign in to access the admin portal</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#002147]/10 rounded-2xl mb-4">
              <User className="w-7 h-7 text-[#002147]" />
            </div>
            <h2 className="text-2xl font-bold text-[#002147] mb-2">Sign In</h2>
            <p className="text-gray-500">Use your staff credentials to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-bold text-[#002147] mb-2 block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@topnotchib.com"
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-[#002147] outline-none"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-bold text-[#002147] mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your password"
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-[#002147] outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#002147] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#D4AF37] hover:text-[#002147] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Admin Page Component
// =============================================================================

const Admin = () => {
  // Convex hooks
  const messages = useQuery(api.messages.listMessages) || [];
  const sendMessage = useMutation(api.messages.sendMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const editMessage = useMutation(api.messages.editMessage);
  const pinMessage = useMutation(api.messages.pinMessage);
  const currentUser = useQuery(api.staff.getCurrentUser);
  const { signIn, signOut } = useAuthActions();

  // Local state
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isInitialMount = useRef(true);
  const previousMessageCount = useRef(0);

  const isAdmin = currentUser?.role === 'admin';

   // Messages are returned oldest-first from the query, flex-col shows oldest-at-top
   const messagesForDisplay = messages;

  // Scroll to bottom with smooth behavior for new messages
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, []);

  // Handle new messages (auto-scroll only if user is near bottom)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // On initial load, scroll to bottom immediately
      setTimeout(() => scrollToBottom('auto'), 50);
      return;
    }

    // Only auto-scroll if new message was added (not deleted/edited)
    if (messages.length > previousMessageCount.current) {
      scrollToBottom('smooth');
    }
    previousMessageCount.current = messages.length;
  }, [messages.length, scrollToBottom]);

  // Handle resize: maintain scroll position relative to bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Keep bottom alignment stable during resize
        scrollToBottom('auto');
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [scrollToBottom]);

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

  // If loading currentUser, show nothing
  if (currentUser === undefined) {
    return null;
  }

  // If not authenticated, show login UI with email/password form
  if (!currentUser) {
    return <LoginForm signIn={signIn} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-bold text-[#002147]">Behind the Scenes</h1>
            <p className="text-gray-500">
              Signed in as <strong>{currentUser?.name}</strong> (
              {currentUser?.role === 'admin' ? 'Admin' : 'Staff'})
            </p>
          </div>
          <button
            onClick={() => signOut()}
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

           {/* Messages - oldest at top, newest at bottom */}
           <div
             ref={messagesContainerRef}
             className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50 flex flex-col"
           >
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                No messages yet. Start the conversation!
              </div>
            )}
            {messagesForDisplay.map((msg) => (
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
            <div ref={messagesEndRef} className="h-0 flex-shrink-0" />
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
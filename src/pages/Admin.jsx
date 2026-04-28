import { useState, useEffect } from 'react';
import { Lock, User, Send, ShieldCheck, LogOut, AlertCircle, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');

  // Load user on mount / token change
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
      fetchMessages();
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } catch (err) {
      setError('Failed to fetch user data');
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/messages/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid email or password');
        return;
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setMessages([]);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ body: newMessage })
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleClearMessages = async () => {
    try {
      await fetch(`${API_URL}/messages/clear`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear messages', err);
    }
  };

  const currentUserName = currentUser?.name ?? 'Unknown';

  // Unauthenticated view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#002147] px-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg p-10 rounded-3xl border border-white/20 shadow-2xl">
          <div className="text-center mb-10">
            <ShieldCheck className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Staff Portal</h1>
            <p className="text-gray-400">Secure entry for Top Notch Insurance Brokers personnel</p>
            <p className="text-xs text-gray-500 mt-2">Restricted Area • Top Notch Security Protocols Active</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Staff Email</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37] outline-none"
                  placeholder="your@topnotchib.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-xl text-white focus:ring-2 focus:ring-[#D4AF37] outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[#D4AF37] text-[#002147] py-4 rounded-xl font-bold text-lg hover:bg-white transition-all shadow-xl"
            >
              Sign In
            </button>
          </form>

          <p className="text-center mt-8 text-gray-500 text-xs uppercase tracking-tighter">
            Restricted Area • Top Notch Security Protocols Active
          </p>
        </div>
      </div>
    );
  }

  // Authenticated view - Chat interface
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-bold text-[#002147]">Behind the Scenes</h1>
            <p className="text-gray-500">Signed in as <strong>{currentUser?.name ?? currentUser?.email ?? 'Unknown'}</strong></p>
          </div>
          <button
            onClick={logout}
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
            <button
              onClick={handleClearMessages}
              className="ml-auto mr-3 flex items-center gap-1.5 text-xs text-red-300 hover:text-red-200 transition-colors font-semibold"
              title="Clear all messages"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
            <span className="flex items-center gap-1.5 text-xs text-green-400 font-semibold">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Live
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">No messages yet. Start the conversation!</div>
            )}
            {[...messages].reverse().map((msg) => (
              <div
                key={msg._id}
                className={`flex flex-col ${msg.author === currentUserName ? 'items-end ml-auto' : 'items-start'} max-w-[75%]`}
              >
                <div className={`p-4 rounded-2xl text-sm shadow-sm ${msg.author === currentUserName ? 'bg-[#D4AF37] text-[#002147] rounded-tr-none font-medium' : 'bg-[#002147] text-white rounded-tl-none'}`}>
                  {msg.body}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs text-gray-500 font-bold mt-0.5 px-1">{msg.author ?? 'Unknown'}</span>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t flex gap-4 bg-white">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#D4AF37] outline-none"
              placeholder="Type a secure message..."
            />
            <button type="submit" className="bg-[#002147] text-white p-4 rounded-xl hover:bg-[#D4AF37] transition-colors shadow-lg">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;

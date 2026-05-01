import { useState } from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ onSend, placeholder = "Type a message..." }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (message.trim()) {
            await onSend(message.trim());
            setMessage('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-3">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#D4AF37] outline-none"
                placeholder={placeholder}
            />
            <button type="submit" className="bg-[#002147] text-white px-6 py-3 rounded-xl hover:bg-[#D4AF37] transition-colors shadow-lg">
                <Send className="w-5 h-5" />
            </button>
        </form>
    );
};

export default ChatInput;
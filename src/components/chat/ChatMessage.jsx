import { Edit, Pin, Trash2, X, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Helper function to format time ago
function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
    };

    for (const [intervalName, intervalSeconds] of Object.entries(intervals)) {
        const count = Math.floor(seconds / intervalSeconds);
        if (count >= 1) {
            return `${count} ${intervalName}${count > 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
}

// Default reaction emojis matching Facebook Messenger
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😠'];

const ChatMessage = ({
    message,
    currentUserEmail,
    isAdmin,
    onEdit,
    onDelete,
    onPin
}) => {
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(message.body);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const menuRef = useRef(null);
    const menuButtonRef = useRef(null);
    const reactionsRef = useRef(null);

    const isOwnMessage = message.authorEmail === currentUserEmail;
    const canEdit = isOwnMessage;
    const canDelete = isOwnMessage || isAdmin;
    const canPin = isAdmin && !isOwnMessage;

    // Close menus on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
            if (reactionsRef.current && !reactionsRef.current.contains(event.target)) {
                setShowReactions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close menus on Escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
                setShowReactions(false);
                menuButtonRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleSaveEdit = async () => {
        if (editText.trim()) {
            await onEdit(message._id, editText.trim());
            setEditing(false);
        }
    };

    const handleDeleteConfirm = async () => {
        await onDelete(message._id);
        setConfirmDelete(false);
        setMenuOpen(false);
    };

    const toggleMenu = () => {
        setShowReactions(false);
        setMenuOpen(!menuOpen);
    };

    const toggleReactions = (e) => {
        e.stopPropagation();
        setMenuOpen(false);
        setShowReactions(!showReactions);
    };

    const handleReaction = (emoji) => {
        console.log('Add reaction:', emoji, 'to message:', message._id);
        setShowReactions(false);
    };

    const menuActions = [
        ...(canEdit ? [{ icon: Edit, label: 'Edit', action: () => { setEditing(true); setMenuOpen(false); } }] : []),
        ...(canPin && !message.pinned ? [{ icon: Pin, label: 'Pin', action: async () => { await onPin(message._id); setMenuOpen(false); } }] : []),
        ...(canDelete ? [{ icon: Trash2, label: 'Delete', action: () => { setConfirmDelete(true); setMenuOpen(false); }, destructive: true }] : []),
    ];

    // Determine read receipt status
    // Simulated: in real app, this would come from message.readBy or similar
    const readReceiptStatus = isOwnMessage ? 'seen' : null; // 'sent' | 'delivered' | 'seen' | null

    const renderReadReceipt = () => {
        if (!isOwnMessage || !readReceiptStatus) return null;
        
        const ReceiptIcon = readReceiptStatus === 'seen' ? CheckCheck : 
                           readReceiptStatus === 'delivered' ? CheckCheck : Check;
        const receiptColor = readReceiptStatus === 'seen' ? '#0084ff' : '#65676b';
        
        return (
            <div className="flex items-center gap-[2px] ml-1 mt-0.5 shrink-0">
                <ReceiptIcon 
                    className="w-3 h-3" 
                    style={{ color: receiptColor }}
                    strokeWidth={readReceiptStatus === 'seen' ? 2.5 : 2}
                />
                {readReceiptStatus === 'delivered' && (
                    <Check className="w-3 h-3" style={{ color: '#65676b' }} strokeWidth={2} />
                )}
            </div>
        );
    };

    if (editing) {
        return (
            <div className={`flex flex-col ${isOwnMessage ? 'items-end ml-auto' : 'items-start'} max-w-[75%]`}>
                <div className="w-full mb-2">
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#D4AF37] outline-none resize-none"
                        rows={3}
                        autoFocus
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setEditing(false)}
                        className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveEdit}
                        disabled={!editText.trim()}
                        className="px-3 py-1.5 text-xs text-[#D4AF37] hover:text-[#B8860B] rounded-lg hover:bg-yellow-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Save
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-full mb-4 px-4 group`}>
                {/* Message bubble container */}
                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%] sm:max-w-[65%] md:max-w-[60%] lg:max-w-[55%] xl:max-w-[50%]`}>
                    {/* Sender name for non-self messages */}
                    {!isOwnMessage && (
                        <span className="text-[12px] font-medium text-[#65676b] mb-1 ml-2">
                            {message.authorName || message.authorEmail}
                        </span>
                    )}
                    
                    {/* Message bubble with Messenger styling */}
                    <div
                        className={`relative rounded-[18px] px-4 py-2 ${
                            isOwnMessage
                                ? 'bg-[#b3d1ff] text-[#001a4d]'           // Messenger blue 2x lighter, very deep blue text
                                : 'bg-[#e4e6eb] text-[#050505]'
                        }`}
                        style={{
                            boxShadow: '0 2px 4px 12px rgba(0, 0, 0, 0.08)',
                        }}
                        onMouseEnter={() => setShowReactions(false)}
                    >
                        <p className="text-[15px] leading-[1.4] break-words whitespace-pre-wrap">
                            {message.body}
                        </p>
                        
                        {/* Message footer: timestamp + read receipt */}
                        <div className={`flex items-center gap-1 mt-1 ${
                            isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                        }`}>
                        <span className="text-[11px] text-[#050505] leading-none">
                            {formatTimeAgo(message.timestamp)}
                        </span>
                            {renderReadReceipt()}
                        </div>
                        
                        {/* Edited indicator */}
                        {message.edited && (
                            <span className={`text-[11px] ${
                                isOwnMessage ? 'text-[#e4e6eb]' : 'text-[#65676b]'
                            } ml-1`}>
                                (edited)
                            </span>
                        )}
                    </div>
                </div>

                {/* Hover actions container */}
                <div className={`flex items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                    isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                }`}>
                    {/* Reaction picker trigger */}
                    <button
                        onClick={toggleReactions}
                        onMouseEnter={() => setShowReactions(true)}
                        onMouseLeave={() => setShowReactions(false)}
                        className="w-7 h-7 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center transition-colors"
                        aria-label="Add reaction"
                    >
                        <span className="text-[16px] leading-none">😊</span>
                    </button>

                    {/* Overflow menu trigger */}
                    <div className="relative" ref={menuRef}>
                        <button
                            ref={menuButtonRef}
                            onClick={toggleMenu}
                            className="w-7 h-7 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center transition-colors"
                            aria-label="Message actions"
                            aria-haspopup="true"
                            aria-expanded={menuOpen}
                        >
                            <MoreVertical className="w-4 h-4 text-[#65676b]" />
                        </button>

                        {menuOpen && menuActions.length > 0 && (
                            <div
                                className="absolute bottom-full mb-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                                role="menu"
                                aria-label="Message actions menu"
                            >
                                {menuActions.map((action, idx) => (
                                    <button
                                        key={idx}
                                        onClick={action.action}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                action.action();
                                            }
                                        }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                                            action.destructive
                                                ? 'text-red-600 hover:bg-red-50'
                                                : 'text-[#050505] hover:bg-[#f0f2f5]'
                                        }`}
                                        role="menuitem"
                                        type="button"
                                    >
                                        <action.icon className="w-4 h-4" />
                                        <span>{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Reaction picker popup */}
                {showReactions && (
                    <div
                        ref={reactionsRef}
                        className={`absolute ${isOwnMessage ? '-right-8' : '-left-8'} bottom-full mb-2 bg-white rounded-full shadow-lg border border-gray-200 p-1.5 flex items-center gap-1 z-50`}
                        onMouseEnter={() => setShowReactions(true)}
                        onMouseLeave={() => setShowReactions(false)}
                    >
                        {REACTION_EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => handleReaction(emoji)}
                                className="w-7 h-7 rounded-full hover:bg-[#f0f2f5] flex items-center justify-center text-sm transition-colors"
                                type="button"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete confirmation modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-[#050505] mb-4">
                            Confirm Deletion
                        </h3>
                        <p className="mb-4 text-[#65676b]">
                            Are you sure you want to delete this message? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                className="px-4 py-2 bg-[#f0f2f5] text-[#050505] rounded-lg hover:bg-[#e4e6eb] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 bg-[#f02849] text-white rounded-lg hover:bg-[#e02647] transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatMessage;
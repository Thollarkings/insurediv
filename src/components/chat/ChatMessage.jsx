import { Edit, Pin, Trash2, X } from 'lucide-react';
import { useState } from 'react';

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

    const handleSaveEdit = async () => {
        if (editText.trim()) {
            await onEdit(message._id, editText.trim());
            setEditing(false);
        }
    };

    return (
        <div className={`flex flex-col ${message.authorEmail === currentUserEmail ? 'items-end ml-auto' : 'items-start'} max-w-[75%]`}>
            {/* Message actions (hover) */}
            <div className="flex w-full justify-between items-start mb-1">
                <span className="text-xs text-gray-500 font-bold">
                    {message.authorName}
                </span>
                {message.authorEmail === currentUserEmail && (
                    <>
                        {editing ? (
                            <>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="text-xs text-gray-500 hover:text-gray-600 mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="text-xs text-[#D4AF37] hover:text-[#B8860B] mr-2"
                                >
                                    Save
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setEditing(true);
                                        setEditText(message.body);
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-600 mr-2"
                                >
                                    Edit
                                </button>
                                {!message.pinned && (
                                    <PinButton
                                        messageId={message._id}
                                        isPinned={message.pinned}
                                        onPin={onPin}
                                    />
                                )}
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    className="text-xs text-gray-500 hover:text-gray-600"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </>
                )}
                {isAdmin && message.authorEmail !== currentUserEmail && (
                    <>
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="text-xs text-gray-500 hover:text-gray-600 mr-2"
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>

            {/* Message content */}
            <div
                className={`p-4 rounded-2xl text-sm shadow-sm ${message.authorEmail === currentUserEmail
                        ? 'bg-[#D4AF37] text-[#002147] rounded-tr-none font-medium'
                        : 'bg-[#002147] text-white rounded-tl-none'
                    }`}
            >
                {message.body}
                {message.edited && <span className="text-xs text-gray-500 ml-1">(edited)</span>}
            </div>

            {/* Timestamp and actions */}
            <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] text-gray-400">
                    {formatTimeAgo(message.timestamp)}
                </span>
                {message.pinned && (
                    <span className="text-xs text-[#D4AF37]">
                        <Pin className="w-3 h-3" /> Pinned
                    </span>
                )}
            </div>

            {/* Edit modal */}
            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-[#002147] mb-4">Edit Message</h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveEdit();
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-[#002147] mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#D4AF37] outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#D4AF37] text-[#002147] rounded hover:bg-white"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-[#002147] mb-4">
                            Confirm Deletion
                        </h3>
                        <p className="mb-4">
                            Are you sure you want to delete this message? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onDelete(message._id);
                                    setConfirmDelete(false);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PinButton = ({ messageId, isPinned, onPin }) => {
    const handlePin = async () => {
        await onPin(messageId);
    };

    return (
        <button
            onClick={handlePin}
            className="text-xs text-gray-500 hover:text-gray-600"
        >
            {isPinned ? 'Unpin' : 'Pin'}
        </button>
    );
};

export default ChatMessage;
import React, { use, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BsChatDotsFill } from 'react-icons/bs';
import { AuthContext } from '../provider/AuthContext';
const GroupChatIcon = () => {
    const { isLight, user, currentGroup } = use(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const [lastSeenCount, setLastSeenCount] = useState(0);
    const messagesContainerRef = useRef(null);

    const groupId = currentGroup?.id || currentGroup?._id || 'general';
    const storageKey = `group-chat:${groupId}`;

    const defaultMessages = useMemo(() => ([
        {
            id: 'welcome-1',
            senderId: 'system',
            senderName: 'Group Bot',
            text: `Welcome to ${currentGroup?.title || 'your group'} chat!`,
            createdAt: new Date().toISOString(),
        },
        {
            id: 'welcome-2',
            senderId: 'system',
            senderName: 'Group Bot',
            text: 'Share updates, meal plans, and reminders here.',
            createdAt: new Date().toISOString(),
        },
    ]), [currentGroup?.title]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                    return;
                }
            }
        } catch {
            // Ignore corrupted local storage entries and reset with defaults.
        }

        setMessages(defaultMessages);
    }, [storageKey, defaultMessages]);

    useEffect(() => {
        if (!messages.length) return;
        localStorage.setItem(storageKey, JSON.stringify(messages));
    }, [messages, storageKey]);

    useEffect(() => {
        if (!isOpen) return;
        setLastSeenCount(messages.length);
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [isOpen, messages.length]);

    const unreadCount = Math.max(messages.length - lastSeenCount, 0);

    const handleSend = () => {
        const trimmed = messageText.trim();
        if (!trimmed) return;

        const nextMessage = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            senderId: user?.uid || user?.email || 'unknown-user',
            senderName: user?.displayName || user?.email || 'You',
            text: trimmed,
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, nextMessage]);
        setMessageText('');
    };

    const onInputKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const currentUserId = user?.uid || user?.email || '';

    const chatWindow = (
        <div className="fixed inset-0 z-200 flex flex-col pointer-events-none">
            <div
                className="absolute inset-0 bg-black/45 pointer-events-auto"
                onClick={() => setIsOpen(false)}
            />

            <div className="absolute inset-x-0 bottom-4 top-16 sm:inset-auto sm:bottom-6 sm:right-6 sm:top-auto sm:w-105 sm:max-w-[92vw] pointer-events-auto px-4 sm:px-0">
                <div
                    className={`h-full sm:h-[70vh] sm:max-h-[calc(100vh-100px)] rounded-t-3xl sm:rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${isLight
                        ? 'bg-white border-gray-200'
                        : 'bg-gray-900 border-gray-700'
                        }`}
                >
                    <div className={`px-4 py-3 border-b flex-shrink-0 ${isLight ? 'border-gray-200 bg-linear-to-r from-cyan-50 to-blue-50' : 'border-gray-700 bg-linear-to-r from-gray-800 to-gray-900'}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Group Chat</p>
                                <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{currentGroup?.title || 'General Chat'}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className={`rounded-lg px-2 py-1 text-sm ${isLight ? 'bg-white/70 text-gray-700 hover:bg-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0">
                        {messages.map((msg) => {
                            const isMine = msg.senderId === currentUserId;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[82%] rounded-2xl px-3 py-2 ${isMine
                                            ? 'bg-violet-600 text-white rounded-br-sm'
                                            : (isLight ? 'bg-gray-100 text-gray-900 rounded-bl-sm' : 'bg-gray-800 text-gray-100 rounded-bl-sm')
                                            }`}
                                    >
                                        {!isMine && (
                                            <p className={`text-[11px] mb-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{msg.senderName}</p>
                                        )}
                                        <p className="text-sm leading-relaxed wrap-break-word">{msg.text}</p>
                                        <p className={`mt-1 text-[10px] ${isMine ? 'text-white/80' : (isLight ? 'text-gray-500' : 'text-gray-400')}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className={`p-3 border-t flex-shrink-0 ${isLight ? 'border-gray-200 bg-white' : 'border-gray-700 bg-gray-900'}`}>
                        <div className="flex items-end gap-2">
                            <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={onInputKeyDown}
                                placeholder="Write a message..."
                                rows={2}
                                className={`flex-1 resize-none rounded-xl border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-800 border-gray-600 text-gray-100'} focus:outline-none focus:ring-2 focus:ring-violet-500`}
                            />
                            <button
                                type="button"
                                onClick={handleSend}
                                className="rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-sm font-medium text-white"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="btn btn-ghost btn-circle"
                aria-label="Open group chat"
            >
                <div className="indicator">
                    <BsChatDotsFill className="h-6 w-6" />
                    {unreadCount > 0 && (
                        <span className="badge badge-sm px-1 indicator-item bg-red-500 rounded-3xl text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>
            </button>

            {isOpen && createPortal(chatWindow, document.body)}
        </div>
    );
};

export default GroupChatIcon;
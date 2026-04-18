import React, { use, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BsChatDotsFill } from 'react-icons/bs';
import { FiLoader, FiSend, FiX } from 'react-icons/fi';
import { AuthContext } from '../provider/AuthContext';
import { getChatMessages, getChatTypingStatus, markChatMessagesRead, sendChatMessage, setChatTypingStatus } from '../utils/chatApi';

const getShortName = (value) => {
    const rawName = String(value || '').trim();

    if (!rawName) {
        return 'Someone';
    }

    return rawName.split(/\s+/)[0];
};

const GroupChatIcon = () => {
    const { isLight, user, currentGroup } = use(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const messagesContainerRef = useRef(null);
    const typingStopTimerRef = useRef(null);
    const isTypingRef = useRef(false);

    const groupId = currentGroup?.id || currentGroup?._id || null;
    const currentUserEmail = String(user?.email || '').toLowerCase();

    const normalizeMessage = useCallback((item) => {
        const sender = item?.userID;
        const readers = Array.isArray(item?.readBy)
            ? item.readBy.map((entry) => ({
                userEmail: entry?.userID?.email || '',
                userName: getShortName(entry?.userID?.displayName || entry?.userID?.email || ''),
                readAt: entry?.readAt || null,
            }))
            : [];

        return {
            id: item?._id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            senderId: sender?._id || sender?.email || 'system',
            senderEmail: sender?.email || '',
            senderName: getShortName(sender?.displayName || sender?.email || 'Group Member'),
            text: String(item?.text || '').trim(),
            createdAt: item?.createdAt || new Date().toISOString(),
            readBy: readers,
        };
    }, []);

    const applyReadReceiptLocally = useCallback(() => {
        if (!currentUserEmail) {
            return;
        }

        setMessages((prev) => prev.map((msg) => {
            const alreadyRead = Array.isArray(msg.readBy)
                ? msg.readBy.some((entry) => String(entry.userEmail || '').toLowerCase() === currentUserEmail)
                : false;

            if (alreadyRead) {
                return msg;
            }

            return {
                ...msg,
                readBy: [
                    ...(Array.isArray(msg.readBy) ? msg.readBy : []),
                    {
                        userEmail: currentUserEmail,
                        userName: getShortName(user?.displayName || user?.email || 'You'),
                        readAt: new Date().toISOString(),
                    },
                ],
            };
        }));
    }, [currentUserEmail, user?.displayName, user?.email]);

    const markGroupMessagesAsRead = useCallback(async () => {
        if (!user || !groupId || !isOpen) {
            return;
        }

        try {
            const token = await user.getIdToken();
            await markChatMessagesRead({ groupID: groupId }, token);
            applyReadReceiptLocally();
        } catch {
            // Silent fail to keep chat smooth during temporary network issues.
        }
    }, [applyReadReceiptLocally, groupId, isOpen, user]);

    const updateTypingStatus = useCallback(async (typingValue) => {
        if (!user || !groupId || !isOpen) {
            return;
        }

        if (isTypingRef.current === typingValue) {
            return;
        }

        try {
            const token = await user.getIdToken();
            await setChatTypingStatus({ groupID: groupId, isTyping: typingValue }, token);
            isTypingRef.current = typingValue;
        } catch {
            // Keep chat usable if typing status updates fail.
        }
    }, [groupId, isOpen, user]);

    useEffect(() => {
        const loadInitialMessages = async () => {
            if (!user || !groupId) {
                setMessages([]);
                return;
            }

            try {
                setIsLoading(true);
                const token = await user.getIdToken();
                const data = await getChatMessages(token, { groupID: groupId, limit: 120 });
                const mapped = Array.isArray(data?.data) ? data.data.map(normalizeMessage) : [];
                setMessages(mapped);
            } catch {
                setMessages([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialMessages();
    }, [user, groupId, normalizeMessage]);

    useEffect(() => {
        if (!user || !groupId) {
            return;
        }

        const pollMessages = async () => {
            try {
                const token = await user.getIdToken();
                const data = await getChatMessages(token, { groupID: groupId, limit: 120 });
                const mapped = Array.isArray(data?.data) ? data.data.map(normalizeMessage) : [];
                setMessages(mapped);
                if (isOpen) {
                    await markGroupMessagesAsRead();
                }
            } catch {
                // Keep last successful messages on polling failures.
            }
        };

        const intervalId = setInterval(pollMessages, 5000);
        return () => clearInterval(intervalId);
    }, [user, groupId, isOpen, markGroupMessagesAsRead, normalizeMessage]);

    useEffect(() => {
        if (!user || !groupId || !isOpen) {
            setTypingUsers([]);
            return;
        }

        const pollTypingUsers = async () => {
            try {
                const token = await user.getIdToken();
                const data = await getChatTypingStatus(token, { groupID: groupId });
                setTypingUsers(Array.isArray(data?.data) ? data.data : []);
            } catch {
                // Ignore intermittent typing polling failures.
            }
        };

        pollTypingUsers();
        const intervalId = setInterval(pollTypingUsers, 2000);
        return () => clearInterval(intervalId);
    }, [user, groupId, isOpen]);

    useEffect(() => {
        markGroupMessagesAsRead();
    }, [markGroupMessagesAsRead]);

    useEffect(() => {
        if (!isOpen) {
            if (typingStopTimerRef.current) {
                clearTimeout(typingStopTimerRef.current);
                typingStopTimerRef.current = null;
            }

            if (isTypingRef.current) {
                setTimeout(() => {
                    updateTypingStatus(false);
                }, 0);
            }
        }
    }, [isOpen, updateTypingStatus]);

    useEffect(() => {
        return () => {
            if (typingStopTimerRef.current) {
                clearTimeout(typingStopTimerRef.current);
                typingStopTimerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [isOpen, messages.length]);

    const unreadCount = messages.reduce((count, message) => {
        const readByCurrentUser = Array.isArray(message.readBy)
            ? message.readBy.some((entry) => String(entry.userEmail || '').toLowerCase() === currentUserEmail)
            : false;

        return readByCurrentUser ? count : count + 1;
    }, 0);

    const handleSend = async () => {
        const trimmed = messageText.trim();
        if (!trimmed || !user || !groupId) return;

        try {
            setIsSending(true);
            await updateTypingStatus(false);
            const token = await user.getIdToken();
            const data = await sendChatMessage({ groupID: groupId, text: trimmed }, token);
            const created = data?.data ? normalizeMessage(data.data) : null;

            if (created) {
                setMessages((prev) => [...prev, created]);
            }

            setMessageText('');
        } catch {
            // Keep quiet here to avoid noisy toasts while typing in chat.
        } finally {
            setIsSending(false);
        }
    };

    const handleMessageInputChange = async (value) => {
        setMessageText(value);

        if (!isOpen) {
            return;
        }

        const normalizedValue = String(value || '').trim();
        if (!normalizedValue) {
            if (typingStopTimerRef.current) {
                clearTimeout(typingStopTimerRef.current);
                typingStopTimerRef.current = null;
            }

            await updateTypingStatus(false);
            return;
        }

        await updateTypingStatus(true);

        if (typingStopTimerRef.current) {
            clearTimeout(typingStopTimerRef.current);
        }

        typingStopTimerRef.current = setTimeout(() => {
            updateTypingStatus(false);
            typingStopTimerRef.current = null;
        }, 2200);
    };

    const onInputKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

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
                    <div className={`px-4 py-3 border-b shrink-0 ${isLight ? 'border-gray-200 bg-linear-to-r from-cyan-50 to-blue-50' : 'border-gray-700 bg-linear-to-r from-gray-800 to-gray-900'}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Group Chat</p>
                                <h3 className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{currentGroup?.title || 'General Chat'}</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className={`rounded-lg px-2 py-1 text-sm ${isLight ? 'bg-white/70 text-gray-700 hover:bg-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
                                aria-label="Close chat"
                                title="Close"
                            >
                                <FiX className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0">
                        {isLoading && (
                            <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                Loading messages...
                            </p>
                        )}

                        {!isLoading && messages.length === 0 && (
                            <div className={`rounded-xl border px-3 py-2 text-sm ${isLight ? 'bg-gray-50 border-gray-200 text-gray-600' : 'bg-gray-800 border-gray-700 text-gray-300'}`}>
                                No messages yet. Start your group conversation.
                            </div>
                        )}

                        {messages.map((msg) => {
                            const isMine = String(msg.senderEmail || '').toLowerCase() === currentUserEmail;
                            const seenByOthers = isMine
                                ? (Array.isArray(msg.readBy)
                                    ? msg.readBy
                                        .filter((entry) => String(entry.userEmail || '').toLowerCase() !== currentUserEmail)
                                        .map((entry) => entry.userName || entry.userEmail)
                                    : [])
                                : [];
                            const uniqueSeenByOthers = Array.from(new Set(seenByOthers.filter(Boolean)));
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
                                        {isMine && uniqueSeenByOthers.length > 0 && (
                                            <p className="mt-0.5 text-[10px] text-white/90">
                                                Seen by {uniqueSeenByOthers.join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {typingUsers.length > 0 && (
                            <div className="flex justify-start">
                                <div className={`max-w-[82%] rounded-2xl px-3 py-2 ${isLight ? 'bg-gray-100 text-gray-700' : 'bg-gray-800 text-gray-200'}`}>
                                    <p className="text-xs italic">
                                        {typingUsers.map((entry) => getShortName(entry.displayName || entry.email || 'Someone')).join(', ')} is typing...
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`p-3 border-t shrink-0 ${isLight ? 'border-gray-200 bg-white' : 'border-gray-700 bg-gray-900'}`}>
                        <div className="flex items-end gap-2">
                            <textarea
                                value={messageText}
                                onChange={(e) => handleMessageInputChange(e.target.value)}
                                onKeyDown={onInputKeyDown}
                                placeholder="Write a message..."
                                rows={2}
                                className={`flex-1 resize-none rounded-xl border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-800 border-gray-600 text-gray-100'} focus:outline-none focus:ring-2 focus:ring-violet-500`}
                            />
                            <button
                                type="button"
                                onClick={handleSend}
                                disabled={isSending}
                                className="rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                                aria-label={isSending ? 'Sending message' : 'Send message'}
                                title="Send"
                            >
                                {isSending ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiSend className="h-4 w-4" />}
                                <span className="sr-only">{isSending ? 'Sending...' : 'Send'}</span>
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
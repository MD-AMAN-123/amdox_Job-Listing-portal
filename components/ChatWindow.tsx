import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MessageCircle, Loader2, CheckCheck, Check } from 'lucide-react';
import { Chat, Message, User, ViewState } from '../types';
import { chatService } from '../services/chatService';
import { Button } from './ui/Button';

interface ChatWindowProps {
    chat: Chat;
    currentUser: User;
    onBack: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chat, currentUser, onBack }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Determine the other user
    const otherUserId = currentUser.id === chat.employerId ? chat.seekerId : chat.employerId;
    const isEmployer = currentUser.id === chat.employerId;

    useEffect(() => {
        loadMessages();
        markAsRead();

        // Subscribe to real-time messages
        const unsubscribe = chatService.subscribeToMessages(chat.id, (message) => {
            setMessages((prev) => [...prev, message]);
            if (message.senderId !== currentUser.id) {
                chatService.markMessagesAsRead(chat.id, currentUser.id);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [chat.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        try {
            const msgs = await chatService.getMessages(chat.id);
            setMessages(msgs);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async () => {
        try {
            await chatService.markMessagesAsRead(chat.id, currentUser.id);
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await chatService.sendMessage(chat.id, currentUser.id, currentUser.name, newMessage.trim());
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).format(date);
    };

    const formatDate = (date: Date) => {
        const today = new Date();
        const messageDate = new Date(date);

        if (messageDate.toDateString() === today.toDateString()) {
            return 'Today';
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }

        return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 px-6 py-4 flex items-center gap-4 shadow-sm">
                <button
                    onClick={onBack}
                    className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1">
                    <h2 className="text-white font-bold text-lg">{chat.jobTitle}</h2>
                    <p className="text-blue-100 text-sm">
                        {isEmployer ? 'Chatting with Candidate' : 'Chatting with Employer'}
                    </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                    <MessageCircle className="h-5 w-5" />
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600 mb-2" />
                        <p>Loading messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Start the conversation</h3>
                        <p className="text-sm text-center max-w-sm">
                            Send your first message to begin discussing the position.
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => {
                            const isMine = message.senderId === currentUser.id;
                            const showDate =
                                index === 0 ||
                                formatDate(messages[index - 1].sentAt) !== formatDate(message.sentAt);

                            return (
                                <div key={message.id}>
                                    {showDate && (
                                        <div className="flex justify-center my-4">
                                            <span className="bg-gray-200/80 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                                                {formatDate(message.sentAt)}
                                            </span>
                                        </div>
                                    )}

                                    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-3`}>
                                        <div className={`flex flex-col max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                                            {!isMine && (
                                                <span className="text-xs text-gray-500 font-medium mb-1 px-2">
                                                    {message.senderName}
                                                </span>
                                            )}
                                            <div
                                                className={`rounded-2xl px-4 py-3 shadow-sm ${isMine
                                                        ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-tr-sm'
                                                        : 'bg-white text-gray-900 border border-gray-200 rounded-tl-sm'
                                                    }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 px-2">
                                                <span className={`text-xs ${isMine ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    {formatTime(message.sentAt)}
                                                </span>
                                                {isMine && (
                                                    <span className="text-primary-400">
                                                        {message.read ? (
                                                            <CheckCheck className="h-3 w-3" />
                                                        ) : (
                                                            <Check className="h-3 w-3" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white">
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none transition-all"
                            rows={2}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />
                        <p className="text-xs text-gray-400 mt-1 px-1">
                            Press Enter to send, Shift+Enter for new line
                        </p>
                    </div>
                    <Button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="h-12 w-12 rounded-xl flex items-center justify-center p-0"
                    >
                        {sending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

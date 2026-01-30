import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Chat, User, ViewState } from '../types';
import { chatService } from '../services/chatService';
import { ChatList } from '../components/ChatList';
import { ChatWindow } from '../components/ChatWindow';

interface ChatViewProps {
    user: User;
    initialChatId?: string;
    onNavigate: (view: ViewState) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ user, initialChatId, onNavigate }) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChats();

        // Subscribe to real-time chat updates
        const unsubscribe = chatService.subscribeToChats(user.id, (updatedChat) => {
            setChats((prev) => {
                const index = prev.findIndex((c) => c.id === updatedChat.id);
                if (index >= 0) {
                    const newChats = [...prev];
                    newChats[index] = updatedChat;
                    return newChats.sort((a, b) => {
                        const aTime = a.lastMessageAt?.getTime() || 0;
                        const bTime = b.lastMessageAt?.getTime() || 0;
                        return bTime - aTime;
                    });
                } else {
                    return [updatedChat, ...prev];
                }
            });
        });

        return () => {
            unsubscribe();
        };
    }, [user.id]);

    useEffect(() => {
        if (initialChatId && chats.length > 0) {
            const chat = chats.find((c) => c.id === initialChatId);
            if (chat) {
                setSelectedChat(chat);
            }
        }
    }, [initialChatId, chats]);

    const loadChats = async () => {
        try {
            const userChats = await chatService.getUserChats(user.id);
            setChats(userChats);
        } catch (error) {
            console.error('Error loading chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChat = (chat: Chat) => {
        setSelectedChat(chat);
    };

    const handleBackToList = () => {
        setSelectedChat(null);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <button
                    onClick={() => onNavigate({ name: 'DASHBOARD' })}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Dashboard
                </button>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 flex items-center justify-center text-white">
                        <MessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                        <p className="text-gray-500 mt-1">
                            {chats.length === 0
                                ? 'No conversations yet'
                                : `${chats.length} conversation${chats.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Chat List - Hidden on mobile when chat is selected */}
                <div
                    className={`lg:col-span-4 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${selectedChat ? 'hidden lg:block' : ''
                        }`}
                >
                    <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                        <h2 className="font-semibold text-gray-900">All Conversations</h2>
                    </div>
                    <div className="h-[calc(100vh-280px)] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Loading conversations...
                            </div>
                        ) : (
                            <ChatList
                                chats={chats}
                                currentUser={user}
                                onSelectChat={handleSelectChat}
                                selectedChatId={selectedChat?.id}
                            />
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div
                    className={`lg:col-span-8 ${selectedChat ? '' : 'hidden lg:flex lg:items-center lg:justify-center'
                        }`}
                >
                    {selectedChat ? (
                        <ChatWindow chat={selectedChat} currentUser={user} onBack={handleBackToList} />
                    ) : (
                        <div className="text-center text-gray-500 py-20">
                            <MessageCircle className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Select a conversation
                            </h3>
                            <p className="text-sm max-w-sm mx-auto">
                                Choose a conversation from the list to start messaging.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

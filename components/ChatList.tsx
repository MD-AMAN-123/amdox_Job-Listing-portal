import React from 'react';
import { MessageCircle, Clock } from 'lucide-react';
import { Chat, User } from '../types';

interface ChatListProps {
    chats: Chat[];
    currentUser: User;
    onSelectChat: (chat: Chat) => void;
    selectedChatId?: string;
}

export const ChatList: React.FC<ChatListProps> = ({
    chats,
    currentUser,
    onSelectChat,
    selectedChatId,
}) => {
    const formatTime = (date: Date | undefined) => {
        if (!date) return '';

        const now = new Date();
        const messageDate = new Date(date);
        const diffMs = now.getTime() - messageDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;

        return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (chats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-sm text-center max-w-sm">
                    When an employer accepts an application, a chat will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100">
            {chats.map((chat) => {
                const isSelected = selectedChatId === chat.id;
                const hasUnread = chat.unreadCount > 0;

                return (
                    <button
                        key={chat.id}
                        onClick={() => onSelectChat(chat)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors relative ${isSelected ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${hasUnread ? 'bg-gradient-to-br from-primary-500 to-indigo-600' : 'bg-gray-400'
                                }`}>
                                {chat.jobTitle.charAt(0)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'
                                        }`}>
                                        {chat.jobTitle}
                                    </h4>
                                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                        {formatTime(chat.lastMessageAt)}
                                    </span>
                                </div>

                                {chat.lastMessage && (
                                    <p className={`text-sm truncate ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'
                                        }`}>
                                        {chat.lastMessage}
                                    </p>
                                )}

                                {hasUnread && (
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {chat.unreadCount}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

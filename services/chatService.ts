import { supabase } from './supabaseClient';
import { Chat, Message, Application } from '../types';

export const chatService = {
    // Create a new chat when application is accepted
    createChat: async (application: Application, jobTitle: string, employerId: string): Promise<Chat> => {
        const chatData = {
            application_id: application.id,
            employer_id: employerId,
            seeker_id: application.seekerId,
            job_title: jobTitle,
            unread_count: 0,
        };

        const { data, error } = await supabase
            .from('chats')
            .insert([chatData])
            .select()
            .single();

        if (error) throw error;
        return mapDbChatToChat(data);
    },

    // Get all chats for a user (employer or seeker)
    getUserChats: async (userId: string): Promise<Chat[]> => {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .or(`employer_id.eq.${userId},seeker_id.eq.${userId}`)
            .order('last_message_at', { ascending: false, nullsFirst: false });

        if (error) throw error;
        return data.map(mapDbChatToChat);
    },

    // Get chat by application ID
    getChatByApplicationId: async (applicationId: string): Promise<Chat | null> => {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .eq('application_id', applicationId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return mapDbChatToChat(data);
    },

    // Send a message
    sendMessage: async (chatId: string, senderId: string, senderName: string, content: string): Promise<Message> => {
        const messageData = {
            chat_id: chatId,
            sender_id: senderId,
            sender_name: senderName,
            content,
            read: false,
        };

        const { data, error } = await supabase
            .from('messages')
            .insert([messageData])
            .select()
            .single();

        if (error) throw error;

        // Update chat's last message
        await supabase
            .from('chats')
            .update({
                last_message: content,
                last_message_at: new Date().toISOString(),
            })
            .eq('id', chatId);

        return mapDbMessageToMessage(data);
    },

    // Get messages for a chat
    getMessages: async (chatId: string): Promise<Message[]> => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('sent_at', { ascending: true });

        if (error) throw error;
        return data.map(mapDbMessageToMessage);
    },

    // Mark messages as read
    markMessagesAsRead: async (chatId: string, userId: string): Promise<void> => {
        const { error } = await supabase
            .from('messages')
            .update({ read: true })
            .eq('chat_id', chatId)
            .neq('sender_id', userId)
            .eq('read', false);

        if (error) throw error;

        // Reset unread count for this chat
        await supabase
            .from('chats')
            .update({ unread_count: 0 })
            .eq('id', chatId);
    },

    // Subscribe to real-time messages for a chat
    subscribeToMessages: (
        chatId: string,
        onMessage: (message: Message) => void
    ) => {
        const channel = supabase
            .channel(`messages:${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}`,
                },
                (payload) => {
                    onMessage(mapDbMessageToMessage(payload.new));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },

    // Subscribe to real-time chat updates
    subscribeToChats: (
        userId: string,
        onChatUpdate: (chat: Chat) => void
    ) => {
        const channel = supabase
            .channel(`chats:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'chats',
                },
                (payload) => {
                    const chat = mapDbChatToChat(payload.new);
                    if (chat.employerId === userId || chat.seekerId === userId) {
                        onChatUpdate(chat);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
};

// Helper mapping functions
const mapDbChatToChat = (c: any): Chat => ({
    id: c.id,
    applicationId: c.application_id,
    employerId: c.employer_id,
    seekerId: c.seeker_id,
    jobTitle: c.job_title,
    lastMessage: c.last_message,
    lastMessageAt: c.last_message_at ? new Date(c.last_message_at) : undefined,
    unreadCount: c.unread_count || 0,
    createdAt: new Date(c.created_at),
});

const mapDbMessageToMessage = (m: any): Message => ({
    id: m.id,
    chatId: m.chat_id,
    senderId: m.sender_id,
    senderName: m.sender_name,
    content: m.content,
    sentAt: new Date(m.sent_at),
    read: m.read,
});

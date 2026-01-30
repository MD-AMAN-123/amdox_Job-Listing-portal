# Real-Time Chat Feature Setup Guide

## 🎉 Feature Overview

A complete real-time chat system has been added to NexusJob AI! When an employer accepts a job application, a private chat channel automatically opens between the employer and the job seeker.

### Features:
- ✅ **Real-time messaging** - Messages appear instantly using Supabase real-time subscriptions
- ✅ **Auto-chat creation** - Chat automatically created when application is accepted
- ✅ **Read receipts** - See when messages are read
- ✅ **Unread indicators** - Badge shows unread message count
- ✅ **Mobile responsive** - Beautiful UI on all devices
- ✅ **Secure** - Row Level Security policies protect user data

---

## 🗄️ Database Setup

### Step 1: Run the SQL Migration

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click "New Query"
4. Copy the entire contents of `supabase_chat_migration.sql`
5. Paste it into the SQL editor
6. Click **Run** or press `Ctrl/Cmd + Enter`

This will create:
- `chats` table - Stores conversation metadata
- `messages` table - Stores individual messages  
- Indexes for performance
- Row Level Security (RLS) policies for data protection

### Step 2: Verify Tables

Go to **Table Editor** and confirm you see:
- ✅ `chats` table with columns: id, application_id, employer_id, seeker_id, job_title, last_message, last_message_at, unread_count, created_at
- ✅ `messages` table with columns: id, chat_id, sender_id, sender_name, content, sent_at, read

---

## 🔧 How It Works

### For Employers:

1. **View Applications**
   - Go to Dashboard
   - See list of applications under "Recent Applications"

2. **Accept Application**
   - Click the green "Accept" button on any pending application
   - A chat is automatically created in the background

3. **Open Chat**
   - After accepting, a "Chat" button appears next to the application
   - Click it to start messaging with the candidate

4. **Send Messages**
   - Type your message in the text box
   - Press Enter or click the send button
   - Messages appear in real-time!

### For Job Seekers:

1. **Apply for Job**
   - Browse jobs on the home page
   - Click a job and apply with your cover letter

2. **Check Application Status**
   - Go to Dashboard → My Applications
   - See application status (Pending/Accepted/Rejected)

3. **Chat with Employer**
   - When application is "Accepted", a "Chat with Employer" button appears
   - Click it to open the conversation
   - Discuss the position directly with the employer

---

## 💬 Chat Features

### Real-Time Updates
- **Instant delivery**: Messages appear immediately without refresh
- **Online indicators**: See when messages are delivered and read
- **Auto-scroll**: Chat automatically scrolls to latest message

### Message UI
- **Timestamps**: Each message shows time sent
- **Date separators**: "Today", "Yesterday", or specific date
- **Read receipts**: ✓ (sent) ✓✓ (read)
- **Sender names**: Clear indication of who sent each message

### Responsive Design
- **Mobile**: Chat list and window adapt for small screens
- **Desktop**: Split view showing chat list + active conversation
- **Smooth animations**: Professional transitions and hover effects

---

## 🚀 Testing the Feature

### Test Flow:

1. **Create Two Accounts**:
   - Register as a Job Seeker (use one email)
   - Register as an Employer (use different email)

2. **Post a Job** (as Employer):
   - Go to Dashboard → Post New Job
   - Fill in job details
   - Submit

3. **Apply for Job** (as Job Seeker):
   - Switch to job seeker account
   - Find the job on home page
   - Apply with a cover letter

4. **Accept Application** (as Employer):
   - Switch back to employer account
   - Go to Dashboard → Recent Applications
   - Click "Accept" on the application
   - See "Chat" button appear

5. **Start Chatting**:
   - Click "Chat" button
   - Send a message
   - Switch to job seeker account
   - Go to Dashboard → My Applications
   - Click "Chat with Employer"
   - Reply to the message
   - Watch messages appear in real-time! 🎉

---

## 📁 Files Added/Modified

### New Files Created:
- `services/chatService.ts` - Chat business logic and Supabase queries
- `components/ChatWindow.tsx` - Main chat interface component
- `components/ChatList.tsx` - List of all conversations
- `views/ChatView.tsx` - Full chat view with list + window
- `supabase_chat_migration.sql` - Database schema and RLS policies

### Modified Files:
- `types.ts` - Added Chat, Message types and CHAT view state
- `views/Dashboard.tsx` - Added chat creation on accept + Chat buttons
- `App.tsx` - Added ChatView routing
- `services/chatService.ts` - Updated createChat signature

---

## 🔐 Security

The chat feature includes comprehensive security:

- **Row Level Security (RLS)**: Users can only see their own chats and messages
- **Authentication Required**: Must be logged in to access chats
- **Scoped Access**: Employers and seekers can only chat about their applications
- **No Cross-Access**: User A cannot see chats between User B and User C

---

## 🎨 UI/UX Highlights

### Chat Window:
- Gradient header with job title
- Bubble-style messages (blue for sent, white for received)
- Timestamp below each message
- Read receipts for sent messages
- Smooth auto-scroll to newest messages
- Enter to send, Shift+Enter for new line

### Chat List:
- Unread badge in red circle
- Last message preview
- Relative timestamps ("2m ago", "Yesterday", etc.)
- Selected chat highlighted
- Empty state for no conversations

---

## 🐛 Troubleshooting

### Chat not appearing after accepting application?

**Check:**
1. Database tables created successfully
2. RLS policies enabled
3. No console errors (F12 → Console)
4. Refresh the page
5. Check Supabase Dashboard → Authentication → Users (both users exist)

### Messages not appearing in real-time?

**Check:**
1. Supabase realtime enabled for tables
2. Browser console for websocket errors
3. Try refreshing both browser windows
4. Check internet connection

### "Permission denied" errors?

**Check:**
1. RLS policies created correctly
2. User is authenticated (check Supabase dashboard)
3. SQL migration ran without errors

---

## 📊 Database Schema Diagram

```
chats
├── id (uuid)
├── application_id (uuid) → applications.id
├── employer_id (uuid) → profiles.id
├── seeker_id (uuid) → profiles.id
├── job_title (text)
├── last_message (text)
├── last_message_at (timestamp)
├── unread_count (int)
└── created_at (timestamp)

messages
├── id (uuid)
├── chat_id (uuid) → chats.id
├── sender_id (uuid) → profiles.id
├── sender_name (text)
├── content (text)
├── sent_at (timestamp)
└──  read (boolean)
```

---

## 🎯 Next Steps

### Potential Enhancements:
- 📎 File attachments
- 🔔 Push notifications
- 💬 Typing indicators
- 📁 Message search
- 🗑️ Delete messages
- ⭐ Favorite/pin conversations
- 📱 Mobile app with native notifications

---

## ✅ Checklist

Before deploying to production:

- [ ] SQL migration executed successfully
- [ ] Tested full flow (apply → accept → chat)
- [ ] Verified RLS policies working
- [ ] Tested on mobile devices
- [ ] Checked for console errors
- [ ] Verified real-time updates work
- [ ] Tested with multiple users
- [ ] Updated environment variables in deployment platform

---

Need help? Check the browser console (F12) for any errors, or review the Supabase logs in your dashboard under **Logs** section.

**Happy Chatting! 💬✨**

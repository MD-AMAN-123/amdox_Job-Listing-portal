# NexusJob AI - Job Listing Portal

AI-powered job matching platform with intelligent recommendations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- Gemini API key

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   
   Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set up Supabase:**
   
   ⚠️ **IMPORTANT**: Disable email confirmation for development
   - Go to your Supabase Dashboard
   - Navigate to **Authentication** → **Providers** → **Email**
   - Turn OFF "Confirm email" toggle
   - Click Save
   
   📖 See `FIX_RATE_LIMIT.md` for detailed instructions

4. **Run the app:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 🔧 Troubleshooting

### "Email rate limit exceeded" error?
→ Read `FIX_RATE_LIMIT.md` for the complete solution

### White screen on load?
→ Check your environment variables have the `VITE_` prefix

### Other issues?
→ Check `TROUBLESHOOTING.md` for common problems

## 📚 Documentation

- `FIX_RATE_LIMIT.md` - Fix registration/login rate limit errors
- `TROUBLESHOOTING.md` - Common errors and solutions

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (Database + Auth)
- **AI**: Google Gemini

## 📝 Features

- ✅ User authentication (Job Seekers & Employers)
- ✅ Job posting and management
- ✅ Application tracking
- ✅ AI-powered job recommendations
- ✅ User profiles and dashboards

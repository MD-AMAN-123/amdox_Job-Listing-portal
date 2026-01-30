# NexusJob AI - Troubleshooting Guide

## Common Errors and Solutions

### ❌ "Email rate limit exceeded" Error

**What happened:**
Supabase has built-in rate limiting on authentication endpoints to prevent spam and abuse. This error occurs when too many authentication attempts are made in a short period.

**Why it happens:**
- Too many registration attempts with the same email
- Repeated login attempts with incorrect credentials
- Multiple password reset requests
- Testing/development causing repeated API calls

**Solutions:**

1. **Wait and Retry (Recommended)**
   - Wait 5-15 minutes before trying again
   - The rate limit will automatically reset
   - Supabase typically uses a sliding window for rate limits

2. **Use a Different Email** (For Testing)
   - Try registering with a different email address
   - This is useful during development/testing

3. **Configure Supabase Rate Limits** (For Production)
   - Go to your Supabase Dashboard
   - Navigate to Settings > API
   - Adjust rate limit settings if needed (requires paid plan for custom limits)

4. **Clear Browser Cache**
   - Sometimes old requests can be stuck
   - Clear cache and cookies for localhost
   - Try in an incognito/private window

**Prevention Tips:**
- Avoid repeatedly clicking "Create Account" or "Sign In"
- Clear form after successful registration
- Use unique test emails during development
- Implement client-side validation to reduce failed attempts

---

### ❌ White Screen / App Won't Load

**Solution:** Make sure your `.env.local` file has the correct environment variables:

```bash
GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important:** Environment variables for client-side code in Vite MUST start with `VITE_`

**For Vercel Deployment:**
1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add all three variables above
3. Redeploy your application

---

### ❌ "Invalid credentials" Error

**Solutions:**
- Double-check your email and password
- Passwords are case-sensitive
- Make sure Caps Lock is off
- If you just registered, check your email for confirmation (if enabled)
- Try the "Forgot Password" feature

---

### ❌ Database Connection Errors

**Common causes:**
- Incorrect Supabase URL or API key
- Supabase project is paused (free tier limitation)
- Network connectivity issues

**Solutions:**
1. Verify your Supabase credentials in `.env.local`
2. Check if your Supabase project is active in the dashboard
3. Ensure your internet connection is stable
4. Check Supabase status page: https://status.supabase.com

---

## Development Best Practices

1. **Use Environment Variables Safely**
   - Never commit `.env.local` to git (it's in `.gitignore`)
   - Use different Supabase projects for development and production
   - Rotate API keys regularly

2. **Handle Errors Gracefully**
   - All authentication errors now show user-friendly messages
   - Check browser console (F12) for detailed error logs
   - Report persistent errors with console logs

3. **Testing Authentication**
   - Use unique email addresses for each test
   - Wait between test attempts to avoid rate limiting
   - Consider using Supabase's test mode features

---

## Getting Help

If you continue experiencing issues:

1. **Check Browser Console** (F12 > Console tab)
   - Look for red error messages
   - Copy the full error message

2. **Check Network Tab** (F12 > Network tab)
   - Look for failed requests (red entries)
   - Check the response for error details

3. **Verify Supabase Setup**
   - Check Supabase dashboard for project status
   - Verify tables exist: `profiles`, `jobs`, `applications`
   - Check RLS (Row Level Security) policies

4. **Clear Everything and Restart**
   ```bash
   # Stop the dev server
   # Clear node modules
   rm -rf node_modules
   
   # Reinstall dependencies
   npm install
   
   # Restart dev server
   npm run dev
   ```

---

## Need More Help?

- Check Supabase documentation: https://supabase.com/docs
- Check Vite documentation: https://vitejs.dev/guide/
- Review the application logs for detailed error messages

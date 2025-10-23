# Clerk Google SSO Setup Guide for EventSynk

## ✅ All Code Changes Complete!

All necessary code changes have been implemented. Now follow these steps to complete the setup:

---

## 📋 Step 1: Create Clerk Account & Get API Keys

1. Go to [https://clerk.com](https://clerk.com) and create an account
2. Create a new application (name it "EventSynk")
3. In your Clerk Dashboard, go to **Configure** → **SSO Connections** → **OAuth**
4. Enable **Google** as an OAuth provider
5. Go to **API Keys** page
6. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

---

## 📝 Step 2: Configure Frontend Environment

1. Open `frontend/.env.local` file
2. Replace `YOUR_PUBLISHABLE_KEY_HERE` with your actual Clerk Publishable Key:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
   VITE_API_URL=http://localhost:5000
   ```

---

## 🗄️ Step 3: Update Database

Since you said you can drop the database, run these SQL commands:

```sql
-- Drop existing database and recreate
DROP DATABASE IF EXISTS eventsynk;
CREATE DATABASE eventsynk;
USE eventsynk;

-- Run your Flask migration or recreate tables
```

Or if you want to migrate existing users:

```sql
-- Add new columns
ALTER TABLE user ADD COLUMN clerk_user_id VARCHAR(255) UNIQUE;
ALTER TABLE user ADD COLUMN last_login DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Make password_hash nullable
ALTER TABLE user MODIFY password_hash VARCHAR(128) NULL;

-- After migration, drop password_hash
ALTER TABLE user DROP COLUMN password_hash;
```

---

## 🎯 Step 4: Configure Google OAuth in Clerk Dashboard

### A. Set up OAuth Redirect URLs
In Clerk Dashboard → **Paths**:
- Sign-in path: `/login`
- Sign-up path: `/register`
- After sign-in redirect: `/`
- After sign-out redirect: `/`

### B. Configure Google OAuth
1. Go to **Configure** → **SSO Connections** → **OAuth**
2. Click on **Google**
3. Enable it
4. (Optional) Restrict to your college domain:
   - Go to **Settings** → **Restrictions**
   - Add email domain restriction: `ssn.edu.in`

---

## 🚀 Step 5: Start Your Applications

### Backend:
```bash
cd backend
python app.py
```

### Frontend:
```bash
cd frontend
npm run dev
```

---

## 🧪 Step 6: Test the Integration

1. Navigate to `http://localhost:5173`
2. Click "Sign Up" or "Login"
3. You'll see Clerk's authentication UI
4. Click "Continue with Google"
5. Sign in with your Google account
6. You should be redirected back to the app and logged in!

---

## 🔧 What Changed?

### Database:
- ✅ Removed `password_hash` column
- ✅ Added `clerk_user_id` column (stores Clerk user ID)
- ✅ Added `last_login` timestamp

### Backend:
- ✅ Created `utils/clerk_auth.py` for JWT verification
- ✅ Updated `auth_routes.py` with `/sync-user` endpoint
- ✅ Replaced `@token_required` with `@clerk_token_required`
- ✅ All protected routes now verify Clerk tokens

### Frontend:
- ✅ Installed `@clerk/clerk-react@latest`
- ✅ Wrapped app with `<ClerkProvider>` in `main.jsx`
- ✅ Updated `AuthContext` to use Clerk hooks
- ✅ Replaced Login/Register pages with Clerk components
- ✅ Updated Navbar with Clerk's `<UserButton>`
- ✅ Updated axios to use Clerk session tokens

---

## 🎨 Customizing Clerk UI (Optional)

You can customize the look of Clerk's signin/signup components by modifying the `appearance` prop:

```jsx
<SignIn 
  appearance={{
    elements: {
      rootBox: 'mx-auto',
      card: 'shadow-xl',
      formButtonPrimary: 'bg-blue-600 hover:bg-blue-700'
    }
  }}
/>
```

---

## ❓ Troubleshooting

### Issue: "Missing Clerk Publishable Key" error
**Solution**: Make sure you've added `VITE_CLERK_PUBLISHABLE_KEY` to `frontend/.env.local`

### Issue: Users can't sign in
**Solution**: 
1. Check that Google OAuth is enabled in Clerk Dashboard
2. Verify redirect URLs are configured correctly
3. Check browser console for errors

### Issue: Backend returns 401 errors
**Solution**: 
1. Verify Clerk token is being sent in Authorization header
2. Check that `clerk_user_id` is properly set in database
3. Ensure user called `/auth/sync-user` after Clerk login

### Issue: Database errors
**Solution**: Drop and recreate the database, or run the migration SQL commands above

---

## 🔐 Security Notes

- The current implementation uses `verify_signature: False` for development
- For production, you should verify JWT signatures using Clerk's JWKS endpoint
- Update `backend/utils/clerk_auth.py` to fetch and cache JWKS for production

---

## 📚 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React Quickstart](https://clerk.com/docs/quickstarts/react)
- [Clerk Dashboard](https://dashboard.clerk.com)

---

## ✨ Next Steps

After completing the setup:
1. Test Google sign-in flow
2. Create a test event
3. Register for an event
4. Verify all features work with Clerk authentication
5. Deploy to production and update environment variables

---

**Need Help?** Check Clerk's documentation or their Discord community for support!

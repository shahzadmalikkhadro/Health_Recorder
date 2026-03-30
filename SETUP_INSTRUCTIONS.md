# Supabase Setup Complete! ✅

## Your Credentials Are Set

Your Supabase project has been configured with:
- **Project URL**: https://glnuukcfwjivrgclteec.supabase.co
- **Anon Key**: Already configured in supabase.js

## ⚠️ IMPORTANT: Final Setup Steps in Supabase Console

Before your app will work, you MUST create the database tables and enable authentication. Follow these steps:

### Step 1: Enable Authentication

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Enable **Email / Password** - this is required
5. (Optional) Enable **Google** for Google login

### Step 2: Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run these SQL queries:

#### Query 1: Create Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own data" ON users
  FOR ALL USING (auth.uid() = id);
```

#### Query 2: Create Reports Table
```sql
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT,
  report_date DATE,
  hospital TEXT,
  doctor TEXT,
  test_lab TEXT,
  notes TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'normal',
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  file_storage_path TEXT,
  reminder JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own reports" ON reports
  FOR ALL USING (auth.uid() = user_id);
```

### Step 3: Create Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Name it: `reports`
4. Set to **Private**
5. Click **Create bucket**

#### Add Storage Policies

1. Go to the `reports` bucket you just created
2. Click the **Policies** tab
3. Add these three policies:

**Policy 1: Upload**
```sql
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Policy 2: Read**
```sql
CREATE POLICY "Users can read their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

**Policy 3: Delete**
```sql
CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Step 4: Test Your Setup

1. Run your app: `npm run dev`
2. Go to register page and create a new account
3. Try uploading a test file
4. Check if it appears in your reports list

---

## 📁 Files Updated for Supabase

✅ **Created:**
- `supabase.js` - Supabase client configuration
- `auth-supabase.js` - Authentication functions
- `SUPABASE_MIGRATION.md` - Migration guide
- `UPLOAD_EXAMPLE.js` - Upload code example
- `DATABASE_EXAMPLES.js` - Query code examples

✅ **Updated To Use Supabase:**
- `add-reports.html` - File upload functionality
- `login2.html` - Login page
- `register3.html` - Registration page
- `view_reports.html` - View reports list
- `profile.html` - User profile
- `dashboard4.html` - Dashboard

## 🔧 Troubleshooting

### "User not found" Error
- The users table wasn't created. Follow Step 2 above.

### Upload Fails
- Check if the `reports` storage bucket exists and is Private
- Verify storage policies are added correctly

### Reports Not Showing
- Make sure you created the `reports` table
- Check if RLS (Row Level Security) policies are enabled
- Verify you're logged in

### Can't Login
- Enable Email/Password authentication in Supabase (Step 1)
- Make sure you registered an account first

---

## 📞 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Auth Docs**: https://supabase.com/docs/guides/auth
- **Storage Docs**: https://supabase.com/docs/guides/storage
- **Database Docs**: https://supabase.com/docs/guides/database

---

## ✨ Next Steps After Setup

After you've completed the Supabase setup:

1. **Test Registration**: Create a new account at `/register3.html`
2. **Test Login**: Login with your new account at `/login2.html`
3. **Upload a File**: Go to `/add-reports.html` and upload a test file
4. **View Reports**: Check `/view_reports.html` to see your uploaded reports
5. **Check Profile**: Visit `/profile.html` to update your information

**That's it! Your app should now work with Supabase!**

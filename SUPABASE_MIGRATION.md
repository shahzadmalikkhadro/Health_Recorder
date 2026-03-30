# Supabase Migration Guide

## 1. SETUP SUPABASE

### Create Account & Project
1. Go to https://supabase.com and sign up
2. Create a new project named "shahzad"
3. Once created, go to **Settings > API**
4. Copy and save:
   - **Project URL** (your-project.supabase.co)
   - **Anon Key** (public key)

Update these in `supabase.js`:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key-here'
```

---

## 2. CREATE DATABASE TABLES

Go to **Supabase Dashboard** > **SQL Editor** and run these queries:

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can access their own data" ON users
  FOR ALL USING (auth.uid() = id);
```

### Reports Table
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

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own reports
CREATE POLICY "Users can access their own reports" ON reports
  FOR ALL USING (auth.uid() = user_id);
```

---

## 3. CREATE STORAGE BUCKET

Go to **Supabase Dashboard** > **Storage**:

1. Click **Create a new bucket**
2. Name it `reports`
3. Make it **Private**
4. In the bucket's **Policies** tab, add:

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'reports' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 4. UPDATE YOUR HTML FILES

Replace Firebase imports with Supabase:

### In HTML `<script>` tags
**OLD (Firebase):**
```javascript
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, storage } from './firebase.js';
```

**NEW (Supabase):**
```javascript
import { supabase } from './supabase.js';
import { listenToAuthState, getCurrentUser } from './auth-supabase.js';
```

---

## 5. KEY CODE CHANGES

### File Upload Function
**OLD (Firebase):**
```javascript
const storageRef = ref(storage, storagePath);
await uploadBytes(storageRef, file);
const downloadURL = await getDownloadURL(storageRef);
```

**NEW (Supabase):**
```javascript
const { data, error } = await supabase.storage
  .from('reports')
  .upload(storagePath, file);

if (error) throw error;

const { data: { publicUrl } } = supabase.storage
  .from('reports')
  .getPublicUrl(storagePath);
```

### Save Report to Database
**OLD (Firebase):**
```javascript
const docRef = await addDoc(collection(db, 'reports'), {
  userId: currentUser.uid,
  title,
  type,
  // ... other fields
  createdAt: serverTimestamp(),
});
```

**NEW (Supabase):**
```javascript
const { data, error } = await supabase
  .from('reports')
  .insert([
    {
      user_id: currentUser.id,
      title,
      type,
      // ... other fields
      created_at: new Date().toISOString(),
    }
  ]);

if (error) throw error;
```

### Query Reports
**OLD (Firebase):**
```javascript
const q = query(collection(db, 'reports'), where('userId', '==', userId));
const snapshot = await getDocs(q);
```

**NEW (Supabase):**
```javascript
const { data, error } = await supabase
  .from('reports')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

if (error) throw error;
```

### Auth State Listener
**OLD (Firebase):**
```javascript
onAuthStateChanged(auth, (authState) => {
  if (authState) {
    currentUser = { uid: authState.uid };
  }
});
```

**NEW (Supabase):**
```javascript
listenToAuthState((authState) => {
  if (authState.isAuthenticated) {
    currentUser = authState.user;
  }
});
```

---

## 6. ENABLE GOOGLE OAUTH (Optional)

To use Google login in Supabase:

1. Go to **Authentication** > **Providers**
2. Enable **Google**
3. Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
4. Add Client ID and Client Secret in Supabase settings
5. Set authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

---

## 7. FILE STRUCTURE

After migration, you'll have:
```
shahzad/
├── supabase.js          (NEW - Supabase config)
├── auth-supabase.js     (NEW - Supabase auth functions)
├── firebase.js          (OLD - can delete after migration)
├── auth.js              (OLD - can delete after migration)
├── add-reports.html     (UPDATE - use Supabase SDK calls)
├── view_reports.html    (UPDATE - use Supabase queries)
├── profile.html         (UPDATE - use Supabase)
└── ... other files
```

---

## 8. TESTING CHECKLIST

After setting up:
- [ ] npm install @supabase/supabase-js
- [ ] Update supabase.js with your credentials
- [ ] Test user registration
- [ ] Test user login
- [ ] Test file upload
- [ ] Test viewing reports
- [ ] Test Google login (if enabled)

---

## NEED HELP?

- Supabase Docs: https://supabase.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase Database: https://supabase.com/docs/guides/database

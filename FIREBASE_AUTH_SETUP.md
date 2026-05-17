# Firebase Authentication Setup Guide

## Overview

This guide explains how to integrate Firebase authentication with your Etreds backend for Google OAuth login and admin role management.

---

## 📋 Prerequisites

- Firebase project created at https://console.firebase.google.com
- Backend running on Node.js with Express
- Frontend with Firebase SDK installed (Next.js app)

---

## 🔧 Backend Setup

### Step 1: Install Firebase Admin SDK

```bash
cd backend
npm install firebase-admin
```

### Step 2: Create Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Settings ⚙️ → Project Settings
4. Service Accounts tab
5. Click "Generate New Private Key"
6. Save the JSON file (keep it secure!)

### Step 3: Configure Environment Variables

#### Option A: Using Service Account JSON File

Create `backend/config/firebase-service-account.json` and paste the contents from Step 2:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

Then set in `.env.local`:

```env
FIREBASE_CONFIG_PATH=./config/firebase-service-account.json
```

⚠️ **Important:** Add to `.gitignore`:

```
config/firebase-service-account.json
```

#### Option B: Using Environment Variables

Set in `.env.local`:

```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-firebase-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-firebase-client-id
```

### Step 4: Set Admin Email and Password

```env
ADMIN_EMAIL=traditionssaha@gmail.com
ADMIN_PASSWORD=saha@Traditions2026
```

This email will automatically be assigned the ADMIN role when logging in.

---

## 🚀 Frontend Setup

### Step 1: Install Firebase SDK

```bash
cd frontend
npm install firebase
```

### Step 2: Create Firebase Config

Create `frontend/src/lib/firebase-config.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

### Step 3: Configure Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

Get these values from Firebase Console → Project Settings → Web App Configuration

### Step 4: Create Firebase Hook

Create `frontend/src/hooks/useFirebaseAuth.js`:

```javascript
import { useState, useCallback } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase-config';
import authService from '../services/auth.service';

export const useFirebaseAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Get Firebase ID token
      const token = await user.getIdToken();

      // Send to backend for verification and user creation/login
      const userData = await authService.loginWithFirebase(token, {
        email: user.email,
        displayName: user.displayName,
      });

      return userData;
    } catch (err) {
      const message = err.message || 'Google sign-in failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  return { signInWithGoogle, logout, loading, error };
};
```

### Step 5: Update Login Component

Update your Login component to use Firebase:

```jsx
"use client";

import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import authService from '../services/auth.service';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const { signInWithGoogle, loading: firebaseLoading } = useFirebaseAuth();

  // Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const userData = await authService.login(email, password);
      login(userData);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    try {
      const userData = await signInWithGoogle();
      login(userData);
      router.push('/');
    } catch (err) {
      setError('Google login failed');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {error && <p className="error">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <div className="divider">OR</div>

        <Button
          type="button"
          onClick={handleGoogleLogin}
          disabled={firebaseLoading}
          variant="secondary"
        >
          {firebaseLoading ? 'Signing in...' : '🔐 Sign in with Google'}
        </Button>
      </form>
    </div>
  );
};

export default Login;
```

---

## 🔐 Admin Role Management

### Automatic Admin Assignment

When a user with the email `traditionssaha@gmail.com` logs in (via email/password OR Google OAuth), they are automatically assigned the `ADMIN` role.

### Backend Implementation

The `firebaseLogin` function in `authController.js` automatically:

1. Verifies Firebase token
2. Finds or creates user
3. Sets `isVerified: true` for Firebase users
4. Returns `ADMIN` role if email matches `ADMIN_EMAIL`

### Frontend Usage

```javascript
// User object returned after login
{
  _id: 'user-id',
  email: 'traditionssaha@gmail.com',
  name: 'Admin User',
  role: 'ADMIN', // ← Admin role
  token: 'jwt-token'
}
```

### Check Admin Status

```javascript
// In components
const { user } = useContext(AuthContext);

if (user?.role === 'ADMIN') {
  // Show admin dashboard
}
```

---

## 📱 User Flow

### Google OAuth Flow

```
User clicks "Sign in with Google"
         ↓
Firebase popup opens
         ↓
User signs in with Google
         ↓
Firebase SDK gets ID token
         ↓
Frontend sends token to backend
         ↓
Backend verifies token with Firebase Admin SDK
         ↓
User exists? 
  YES → Update if needed
  NO  → Create new user
         ↓
Backend generates JWT token
         ↓
Frontend receives JWT + user data
         ↓
User logged in ✅
```

### Email/Password Flow

```
User enters email and password
         ↓
Frontend sends to /api/auth/login
         ↓
Backend checks password hash
         ↓
Password matches?
  YES → Generate JWT
  NO  → Return error
         ↓
Frontend receives JWT + user data
         ↓
User logged in ✅
```

---

## 🧪 Testing

### Test Google OAuth (Backend)

```bash
# Get a Firebase ID token from frontend console:
# In browser console: firebase.auth().currentUser.getIdToken()

curl -X POST http://localhost:5000/api/auth/firebase-login \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-firebase-id-token",
    "email": "user@example.com",
    "name": "User Name"
  }'
```

### Test Email/Password

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "traditionssaha@gmail.com",
    "password": "saha@Traditions2026"
  }'
```

---

## 🚀 Production Deployment

### Vercel Frontend

1. Go to Vercel dashboard
2. Set Firebase environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - etc.

### Backend (Railway/Render)

1. Set environment variables:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY_ID`
   - `FIREBASE_PRIVATE_KEY` (paste full key with `\n` for newlines)
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_CLIENT_ID`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`

### Firebase Console

1. Go to Authentication → Settings
2. Add production domain to authorized domains
3. Enable Google Sign-in

---

## 🐛 Troubleshooting

### "Invalid Firebase token"

**Problem:** Token verification fails

**Solution:**
- Verify `FIREBASE_PROJECT_ID` matches Firebase project
- Check token isn't expired (5 min max)
- Ensure Firebase SDK is initialized correctly

### "User not found after Google login"

**Problem:** User created but not verified

**Solution:**
- Check `isVerified` is set to `true` in `firebaseLogin`
- Verify database transaction completed

### "Admin role not assigned"

**Problem:** Email doesn't match admin email

**Solution:**
- Verify `ADMIN_EMAIL` env var is set correctly
- Email must be exact match (case-sensitive)
- Log in with exact admin email

---

## 📚 References

- [Firebase Admin SDK Docs](https://firebase.google.com/docs/auth/admin)
- [Firebase Frontend SDK](https://firebase.google.com/docs/auth/web)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

✅ **Setup Complete!** Your app now has both Firebase OAuth and email/password authentication with admin role management.

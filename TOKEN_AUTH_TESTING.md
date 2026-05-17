# Token Authentication Flow - Testing Guide

## Problem Fixed

The issue was that JWT tokens stored in HTTP-only cookies weren't being forwarded from Next.js API routes to the backend Express server.

## Solution Implemented

1. **Frontend API Proxy** (`api-proxy.js`):
   - Now extracts JWT token from cookies using Next.js `cookies()` function
   - Adds token to `Authorization: Bearer <token>` header
   - Forwards to backend with the token

2. **Backend Middleware** (`authMiddleware.js`):
   - Already checks for `Authorization` header first (Bearer token)
   - Falls back to cookies if no Authorization header
   - Validates token and attaches user to request

3. **Logout Route** (`logout/route.js`):
   - Properly clears the cookie on the frontend

---

## 🧪 Testing the Flow

### Step 1: Clear Browser Storage

```javascript
// In browser console:
document.cookie.split(";").forEach(c => document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"));
localStorage.clear();
sessionStorage.clear();
// Refresh page
```

### Step 2: Test Login

```bash
# In browser or with curl:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt  # Save cookies
```

Expected response:
```json
{
  "_id": "user-id",
  "name": "John Doe",
  "email": "test@example.com",
  "role": "USER",
  "token": "eyJhbGci..."
}
```

### Step 3: Test Protected Route (With Token)

```bash
# Use the token from login response or read from cookies.txt
TOKEN="eyJhbGci..."

curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

Should return user data.

### Step 4: Test Without Token

```bash
curl http://localhost:5000/api/auth/me
```

Should return: `{"message":"Not authorized, no token"}` (401)

---

## 🔍 Debugging Steps

### If Still Getting 401 Errors:

**1. Check Backend is Running**
```bash
curl http://localhost:5000/api/products
# Should return products (no auth needed for GET)
```

**2. Check Frontend Environment**
```bash
# In frontend .env.local:
echo $NEXT_PUBLIC_BACKEND_URL
# Should be: http://localhost:5000
```

**3. Check JWT Secret Matches**
```bash
# Backend .env.local - JWT_SECRET must be set
# Same secret used for sign & verify
```

**4. Debug Token Flow**
```javascript
// In browser console after login:
// Check if cookie was set
document.cookie  // Should show: authToken=...

// Or check backend cookie receipt
// Backend logs should show token being verified
```

**5. Check CORS**
```bash
# Frontend can reach backend
curl http://localhost:5000/api/auth/me
# Should fail with "Not authorized" not "CORS error"
```

---

## 📝 Token Flow Diagram

```
USER LOGIN
    ↓
POST /api/auth/login (email, password)
    ↓
Backend validates credentials
    ↓
Backend generates JWT token
    ↓
Backend sets httpOnly Cookie: authToken
Backend returns { token, user }
    ↓
Browser stores cookie automatically
Frontend receives user data
    ↓
USER NAVIGATES TO PROTECTED PAGE (/profile)
    ↓
Browser requests GET /api/profile
    ↓
Browser includes Cookie: authToken automatically
    ↓
Next.js API route receives request
    ↓
api-proxy.js extracts token from Cookie
    ↓
api-proxy.js adds Authorization: Bearer <token> header
    ↓
Backend receives request with Authorization header
    ↓
authMiddleware checks Authorization header
    ↓
Token is valid → User data attached to req.user
    ↓
Route handler executes successfully
    ↓
Response sent to frontend
```

---

## ✅ Verification Checklist

After applying fixes:

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] PostgreSQL database running (etreds)
- [ ] `.env.local` files properly configured on both frontend and backend
- [ ] Browser cookies visible (DevTools → Application → Cookies)
- [ ] Login works and sets cookie
- [ ] Profile page loads after login
- [ ] Orders page loads after login
- [ ] Logout works and clears cookie

---

## 🚀 If Issues Persist

### Check These Files Are Updated:

1. ✅ `frontend/src/lib/api-proxy.js` - Imports `cookies` from 'next/headers'
2. ✅ `frontend/src/app/api/auth/logout/route.js` - Clears cookie
3. ✅ `backend/middleware/authMiddleware.js` - Checks Authorization header
4. ✅ `backend/controllers/authController.js` - loginUser and firebaseLogin set cookies

### Add Debug Logs

**Backend** (`authMiddleware.js`):
```javascript
const protect = async (req, res, next) => {
  console.log('🔐 Auth Check:');
  console.log('  Headers:', req.headers.authorization ? '✓ Has Authorization' : '✗ No Authorization');
  console.log('  Cookies:', req.cookies.authToken ? '✓ Has authToken cookie' : '✗ No authToken cookie');
  // ... rest of middleware
};
```

**Frontend** (`api-proxy.js`):
```javascript
export async function proxyToBackend(path, options = {}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken')?.value;
  console.log(`📤 Forwarding to ${path}:`, authToken ? '✓ Token included' : '✗ No token');
  // ... rest of proxy
}
```

---

## 💾 Complete Working Example

**Frontend Login Component:**
```jsx
import authService from '@/services/auth.service';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Login() {
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // This calls authService which calls /api/auth/login
      // Backend sets authToken cookie
      // Frontend receives user data
      const userData = await authService.login(email, password);
      login(userData); // Update context
      router.push('/profile'); // Navigate
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

**After Login, Protected Route (Profile):**
```jsx
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import orderService from '@/services/order.service';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // This calls /api/orders/myorders
        // Browser includes Cookie: authToken automatically
        // Next.js API route extracts token and forwards it
        // Backend receives Authorization: Bearer <token>
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error(error.message);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <h2>Your Orders</h2>
      {orders.map(order => (
        <div key={order.id}>{order.id}</div>
      ))}
    </div>
  );
}
```

---

## 🎯 Summary

The authentication flow now works end-to-end:

1. ✅ User logs in with email/password or Google OAuth
2. ✅ Backend creates JWT token and sets HTTP-only cookie
3. ✅ Browser automatically includes cookie in subsequent requests
4. ✅ Next.js API routes extract token from cookie
5. ✅ API routes add token to Authorization header
6. ✅ Backend middleware verifies token
7. ✅ Protected routes now accessible

**Test it now - everything should work! 🚀**

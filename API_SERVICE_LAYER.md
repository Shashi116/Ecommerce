# API Service Layer Documentation

## Overview

All API calls in the frontend are now centralized through a service layer. This ensures:
- ✅ No direct `fetch()` calls in components
- ✅ Consistent error handling
- ✅ Easy to maintain and test
- ✅ Single source of truth for API endpoints
- ✅ Automatic cookie/token management

---

## Architecture

```
Component
    ↓
Service (api.client.js wrapper)
    ↓
API Proxy Routes (/api/*)
    ↓
Backend Express Server (:5000)
```

---

## 🔧 Available Services

### 1. Auth Service

**File:** `frontend/src/services/auth.service.js`

#### Register User

```javascript
import authService from '@/services/auth.service';

// In component
try {
  const response = await authService.register(
    'John Doe',
    'john@example.com',
    'password123'
  );
  console.log('OTP sent to:', response.email);
} catch (error) {
  console.error(error.message);
}
```

#### Verify OTP

```javascript
try {
  const response = await authService.verifyOtp(
    'john@example.com',
    '123456'
  );
  console.log(response.message); // "Account verified. You can now login."
} catch (error) {
  console.error(error.message);
}
```

#### Login with Email/Password

```javascript
try {
  const userData = await authService.login(
    'john@example.com',
    'password123'
  );
  // userData = { _id, name, email, role, token }
  login(userData); // Update AuthContext
} catch (error) {
  setError(error.message);
}
```

#### Login with Firebase (Google OAuth)

```javascript
import { getIdTokenResult } from 'firebase/auth';

// After Firebase sign-in
const idToken = await currentUser.getIdToken();
const userData = await authService.loginWithFirebase(idToken, {
  email: currentUser.email,
  displayName: currentUser.displayName,
});
login(userData);
```

#### Get Current User

```javascript
try {
  const user = await authService.getMe();
  console.log(user); // { id, name, email, role, isVerified }
} catch (error) {
  // User not logged in
}
```

#### Get All Users (Admin)

```javascript
try {
  const users = await authService.getUsers();
  console.log(users); // Array of all users
} catch (error) {
  console.error(error.message); // "Unauthorized" if not admin
}
```

#### Logout

```javascript
try {
  await authService.logout();
  logout(); // Clear AuthContext
} catch (error) {
  console.error(error.message);
}
```

---

### 2. Product Service

**File:** `frontend/src/services/product.service.js`

#### Get All Products

```javascript
import productService from '@/services/product.service';

try {
  const products = await productService.getAll();
  console.log(products); // Array of products
} catch (error) {
  console.error(error.message);
}
```

#### Get Product by ID

```javascript
try {
  const product = await productService.getById('product-id');
  console.log(product); // { id, name, price, stock, reviews, ... }
} catch (error) {
  console.error('Product not found');
}
```

#### Create Product (Admin)

```javascript
try {
  const formData = new FormData();
  formData.append('name', 'Product Name');
  formData.append('description', 'Description');
  formData.append('price', 99.99);
  formData.append('category', 'Electronics');
  formData.append('stock', 50);
  formData.append('image', fileInput.files[0]); // File object

  const product = await productService.create(formData);
  console.log('Product created:', product.id);
} catch (error) {
  console.error(error.message);
}
```

#### Update Product (Admin)

```javascript
try {
  const formData = new FormData();
  formData.append('name', 'Updated Name');
  formData.append('price', 89.99);
  formData.append('stock', 30);
  // Optionally append new image
  // formData.append('image', newFileInput.files[0]);

  const product = await productService.update('product-id', formData);
  console.log('Product updated');
} catch (error) {
  console.error(error.message);
}
```

#### Delete Product (Admin)

```javascript
try {
  await productService.delete('product-id');
  console.log('Product deleted');
} catch (error) {
  console.error(error.message);
}
```

---

### 3. Order Service

**File:** `frontend/src/services/order.service.js`

#### Create Order

```javascript
import orderService from '@/services/order.service';

try {
  const orderData = {
    items: [
      { productId: 'prod-1', qty: 2, price: 99.99 },
      { productId: 'prod-2', qty: 1, price: 149.99 }
    ],
    totalAmount: 349.97,
    address: {
      fullName: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      postalCode: '10001',
      country: 'USA'
    },
    paymentId: 'razorpay-payment-id' // Optional, from Razorpay
  };

  const order = await orderService.create(orderData);
  console.log('Order created:', order.id);
} catch (error) {
  console.error(error.message);
}
```

#### Get My Orders

```javascript
try {
  const orders = await orderService.getMyOrders();
  console.log(orders); // Array of user's orders with items and address
} catch (error) {
  console.error(error.message);
}
```

#### Get All Orders (Admin)

```javascript
try {
  const orders = await orderService.getAll();
  console.log(orders); // Array of all orders with user details
} catch (error) {
  console.error(error.message);
}
```

#### Update Order Status (Admin)

```javascript
try {
  const order = await orderService.updateStatus(
    'order-id',
    'SHIPPED' // or 'DELIVERED', 'CANCELLED', 'PENDING'
  );
  console.log('Order status updated');
} catch (error) {
  console.error(error.message);
}
```

---

### 4. Payment Service

**File:** `frontend/src/services/payment.service.js`

#### Get Razorpay Key

```javascript
import paymentService from '@/services/payment.service';

try {
  const data = await paymentService.getKey();
  console.log(data.key); // Razorpay public key
} catch (error) {
  console.error(error.message);
}
```

#### Create Payment Order

```javascript
try {
  const order = await paymentService.createOrder(3499); // Amount in paise (34.99 USD = 3499 paise)
  console.log(order); // { id, amount, currency, ... }
} catch (error) {
  console.error(error.message);
}
```

#### Verify Payment

```javascript
try {
  const verification = await paymentService.verify({
    razorpay_order_id: 'order-id',
    razorpay_payment_id: 'payment-id',
    razorpay_signature: 'signature'
  });
  console.log(verification.message); // "Payment verified successfully"
} catch (error) {
  console.error(error.message);
}
```

---

### 5. Analytics Service

**File:** `frontend/src/services/analytics.service.js`

#### Get Admin Stats

```javascript
import analyticsService from '@/services/analytics.service';

try {
  const stats = await analyticsService.getStats();
  console.log(stats); // { totalOrders, totalProducts, totalUsers, totalRevenue }
} catch (error) {
  console.error(error.message);
}
```

---

## 🛑 Error Handling

All services throw errors with consistent structure:

```javascript
try {
  await someService.doSomething();
} catch (error) {
  console.log(error.message);        // Human-readable message
  console.log(error.status);         // HTTP status code (401, 404, 500, etc)
  console.log(error.data);           // Full response from backend
}
```

Common errors:

```
401 Unauthorized     → User not logged in or token invalid
403 Forbidden        → Insufficient permissions (not admin)
404 Not Found        → Resource doesn't exist
400 Bad Request      → Invalid input data
500 Server Error     → Backend error
```

---

## 📝 Common Patterns

### Loading State

```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  try {
    setLoading(true);
    await service.action();
  } catch (error) {
    console.error(error.message);
  } finally {
    setLoading(false);
  }
};
```

### With Error Display

```javascript
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  try {
    setError('');
    setLoading(true);
    const result = await service.action();
    // Success
  } catch (err) {
    setError(err.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};

// In JSX
{error && <p className="error">{error}</p>}
```

### In useEffect

```javascript
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    try {
      const data = await service.getData();
      if (isMounted) {
        setData(data);
      }
    } catch (error) {
      if (isMounted) {
        setError(error.message);
      }
    }
  };

  fetchData();

  return () => {
    isMounted = false; // Cleanup
  };
}, []);
```

---

## 🚀 Migration Checklist

If updating existing components:

- [ ] Import service instead of making direct fetch calls
- [ ] Remove `fetch()` calls from component
- [ ] Update error handling to use service errors
- [ ] Use `credentials: 'same-origin'` is handled by service
- [ ] Test with actual backend

Example before/after:

### ❌ Before (Direct Fetch)

```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'same-origin'
  });
  const data = await res.json();
  if (res.ok) {
    login(data);
  }
};
```

### ✅ After (Service)

```javascript
import authService from '@/services/auth.service';

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const data = await authService.login(email, password);
    login(data);
  } catch (error) {
    setError(error.message);
  }
};
```

---

## 🔗 Extending Services

To add a new service:

1. Create `frontend/src/services/yourservice.service.js`
2. Import `api` client:

```javascript
import api from './api.client';

const yourService = {
  getAll: () => api.get('/api/your-endpoint'),
  getById: (id) => api.get(`/api/your-endpoint/${id}`),
  create: (data) => api.post('/api/your-endpoint', data),
};

export default yourService;
```

3. Use in components:

```javascript
import yourService from '@/services/yourservice.service';

const data = await yourService.getAll();
```

---

## 📚 File Structure

```
frontend/src/
├── services/
│   ├── api.client.js          ← Core client
│   ├── auth.service.js        ← Auth endpoints
│   ├── product.service.js     ← Product endpoints
│   ├── order.service.js       ← Order endpoints
│   ├── payment.service.js     ← Payment endpoints
│   └── analytics.service.js   ← Analytics endpoints
├── views/
│   └── Login.jsx              ← Uses authService
├── admin/
│   └── AdminDashboard.jsx     ← Uses analyticsService
└── context/
    └── AuthContext.jsx
```

---

✅ **All set!** Your frontend now uses a clean, maintainable API service layer.

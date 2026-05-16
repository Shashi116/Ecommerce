<div align="center">
  <img src="https://cdn-icons-png.flaticon.com/512/3514/3514491.png" alt="Saha Traditions Logo" width="80" />
  <h1>Saha Traditions - Full-Stack Next.js E-Commerce App</h1>
  <p>A full-stack e-commerce platform migrated from split MERN/CRA + Express into a Next.js app with secure API route handlers.</p>
</div>

---

## Tech Stack

- **App:** Next.js App Router, React, Redux Toolkit, AuthContext.
- **Backend routing:** Next.js route handlers under `frontend/src/app/api`.
- **Security:** JWT is stored in an `httpOnly`, `sameSite=lax` cookie instead of browser `localStorage`; admin/user API routes validate the cookie server-side.
- **Database:** MongoDB via Mongoose.
- **Payments:** Razorpay order creation and signature verification.
- **Uploads:** Cloudinary image upload from secure API routes.

---

## Quick Start

Install dependencies from the root, then run the Next.js app:

```bash
npm run install-all
npm run dev
```

Open:

```bash
http://localhost:3000
```

Build production assets:

```bash
npm run build
```

Start the production Next server after building:

```bash
npm start
```

---

## Environment Variables

For local development, the Next route handlers can reuse `backend/.env` as a fallback. For deployment, define these variables on the Next.js service:

```env
MONGO_URI=mongodb://127.0.0.1:27017/saha-traditions
JWT_SECRET=super_secret_key
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password
```

---

## Seed Data

You can still seed the MongoDB database with the legacy backend seed script:

```bash
npm run seed
```

Seed admin access:

```text
Email: admin@saha-traditions.com
Password: password123
```

---

## Notes

The `backend/` folder remains for the seed script and historical Express reference, but runtime traffic now goes through Next.js pages and API route handlers in `frontend/`.

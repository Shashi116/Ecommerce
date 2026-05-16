# MongoDB to PostgreSQL Migration Guide

## Overview

This guide walks you through migrating the ShopNest ecommerce application from MongoDB with Mongoose to PostgreSQL with Prisma ORM.

**Timeline:** ~30-45 minutes (including testing)

---

## Prerequisites

✅ **PostgreSQL installed locally** (for development)
- Download: https://www.postgresql.org/download/
- Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -d postgres:15`

✅ **Neon account** (for production) 
- Sign up at: https://neon.tech
- Free tier includes 3 projects with generous limits

✅ **MongoDB backup** (keep for reference)

---

## Step 1: Prepare PostgreSQL Database

### Local Development Setup

```bash
# Create local PostgreSQL database
createdb etreds

# Or if using Docker:
# Database will be auto-created by Prisma
```

### Production (Neon) Setup

1. Go to https://neon.tech and create account
2. Create new project called `etreds`
3. Copy the connection string:
   ```
   postgresql://user:password@host.neon.tech/etreds?schema=public&sslmode=require
   ```

---

## Step 2: Install Dependencies

```bash
cd backend

# Already done, but verify:
npm list @prisma/client prisma pg

# Should show:
# ├── @prisma/client@latest
# ├── prisma@latest
# └── pg@latest
```

---

## Step 3: Update Environment Variables

### `backend/.env.local`

```env
# Environment
NODE_ENV=development

# Database - PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/etreds?schema=public

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Email
SENDGRID_API_KEY=your-sendgrid-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
```

### `.env.production` (for production deployment)

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host.neon.tech/etreds?schema=public&sslmode=require
JWT_SECRET=production-jwt-secret-min-32-chars
RAZORPAY_KEY_ID=prod-key
RAZORPAY_KEY_SECRET=prod-secret
SENDGRID_API_KEY=prod-key
CLOUDINARY_CLOUD_NAME=prod-name
CLOUDINARY_API_KEY=prod-key
CLOUDINARY_API_SECRET=prod-secret
FRONTEND_URL=https://your-domain.com
PORT=5000
```

---

## Step 4: Generate Prisma Migrations

```bash
cd backend

# Create migration for schema
npx prisma migrate dev --name init

# This will:
# 1. Connect to your DATABASE_URL
# 2. Create all tables in PostgreSQL
# 3. Generate Prisma Client

# For production, use:
npx prisma migrate deploy
```

### Verify Tables Created

```bash
# Check PostgreSQL database
psql -d etreds -c "\dt"

# Should show tables:
# users, products, reviews, orders, order_items, addresses
```

---

## Step 5: Migrate Data from MongoDB

### Option A: If You Have Existing MongoDB Data

```bash
cd backend

# Run migration script
node scripts/migrate-mongo-to-postgres.js

# Outputs:
# 🔄 Starting MongoDB to PostgreSQL migration...
# ✅ Connected to MongoDB
# 📦 Migrating Users... ✅ Migrated X users
# 📦 Migrating Products... ✅ Migrated X products
# ...
# ✅ Migration completed successfully!
```

### Option B: Fresh Start (No Migration)

Skip the migration script - start with clean PostgreSQL database.

---

## Step 6: Test Backend Locally

```bash
cd backend

# Make sure .env.local points to local PostgreSQL
# DATABASE_URL=postgresql://user:password@localhost:5432/etreds

npm run dev

# Expected output:
# ✓ Backend running on port 5000
# ✓ Environment: development
# ✓ Allowed origins: http://localhost:3000
# 🔒 Only API requests are allowed from frontend applications
```

### Test API Endpoints

```bash
# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Test get products
curl http://localhost:5000/api/products

# Test admin stats
curl http://localhost:5000/api/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Step 7: Update Frontend Configuration

### `frontend/.env.local`

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### Test Frontend

```bash
cd frontend

npm run dev

# Open http://localhost:3000
# Test login, products, checkout flows
```

---

## Step 8: Deployment to Production

### Backend Deployment (using Railway or Render)

#### Option 1: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize Railway project
railway init

# Set environment variables
railway variables set DATABASE_URL=postgresql://...neon.tech/...
railway variables set JWT_SECRET=production-secret
railway variables set RAZORPAY_KEY_ID=prod-key
# ... set other variables

# Deploy
railway up
```

#### Option 2: Render

1. Push code to GitHub
2. Connect Render to GitHub repository
3. Create new Web Service
4. Configure:
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Add environment variables from `.env.production`
5. Deploy

### Frontend Deployment (Vercel)

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Update environment variables in Vercel dashboard:
# NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
```

### Update CORS in Production

Backend `/server.js` already configured for production. Just update `FRONTEND_URL` env var:

```env
FRONTEND_PROD_URL=https://your-frontend-domain.com
```

---

## Step 9: Run Database Backups

### PostgreSQL Backup

```bash
# Dump database
pg_dump etreds > backup_$(date +%Y%m%d).sql

# Restore from backup
psql etreds < backup_20240516.sql
```

### Automated Backups (Neon)

Neon handles backups automatically. Configure retention in dashboard.

---

## Troubleshooting

### "Connection refused" Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:** PostgreSQL not running
```bash
# Start PostgreSQL
pg_ctl -D /usr/local/var/postgres start

# Or if using Docker:
docker start postgres
```

### "Database does not exist" Error

```
Error: role does not exist
```

**Solution:** Create database
```bash
createdb etreds
npx prisma migrate deploy
```

### "Invalid connection string" Error

**Solution:** Verify `.env.local`
```bash
echo $DATABASE_URL  # Should show full connection string
```

### Migration Script Fails

```bash
# Check MongoDB connection
# Verify MONGODB_URI in .env.local

# Check PostgreSQL connection
# Verify DATABASE_URL in .env.local

# Clear Prisma cache
rm -rf node_modules/.prisma

# Regenerate
npx prisma generate
```

---

## Schema Comparison

### Before (MongoDB - Embedded Documents)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [
    { productId: ObjectId, qty: 5, price: 100 }
  ],
  address: {
    fullName: "John",
    street: "123 Main",
    city: "NYC"
  }
}
```

### After (PostgreSQL - Normalized)

```sql
-- Order Table
{
  id: UUID,
  userId: UUID,
  addressId: UUID,  -- Foreign key to Address
  totalAmount: DECIMAL,
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED'
}

-- Address Table (separate)
{
  id: UUID,
  userId: UUID,
  fullName: "John",
  street: "123 Main",
  city: "NYC"
}

-- OrderItem Table (junction)
{
  orderId: UUID,
  productId: UUID,
  qty: 5,
  price: 100
}
```

---

## Performance Optimization

### Add Indexes (already in schema)

```sql
-- Indexes for faster queries
CREATE INDEX idx_orders_userId ON orders(userId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_reviews_productId ON reviews(productId);
CREATE INDEX idx_reviews_userId ON reviews(userId);
```

### Enable Connection Pooling (Neon)

Already configured in connection string with connection pooling parameters.

---

## Rollback Plan

### If Something Goes Wrong

```bash
# Stop application
pm2 stop all

# Restore from MongoDB backup
# Keep MongoDB running alongside temporarily

# Revert code to Mongoose version
git checkout main -- .

# Restart with Mongoose
npm run dev

# Once stable, retry PostgreSQL migration
```

---

## Verification Checklist

- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] Prisma migrations applied
- [ ] Data migrated from MongoDB
- [ ] Backend tests passing
- [ ] Frontend tests passing
- [ ] Authentication working
- [ ] Products displaying
- [ ] Checkout flow working
- [ ] Admin stats visible
- [ ] Deployed to production
- [ ] Production database backup

---

## Support & Next Steps

✅ **Migration complete!** Your application is now:
- ✔️ Using PostgreSQL (relational database)
- ✔️ Using Prisma ORM (type-safe queries)
- ✔️ Production-ready and scalable
- ✔️ Deployed on Vercel + Neon

**Next:** Monitor performance and set up alerts in production.

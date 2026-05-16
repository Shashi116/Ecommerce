# ShopNest PostgreSQL Setup - Quick Start

## 🚀 Fast Track Setup (5 minutes)

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run installer (remembers password as `password`)

**Linux (Ubuntu):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### 2. Create Database

```bash
# Create etreds database
createdb etreds

# Verify
psql -l | grep etreds
```

### 3. Configure Backend

```bash
cd backend

# Copy environment template
cp .env.example .env.local

# Edit .env.local with:
DATABASE_URL=postgresql://postgres:password@localhost:5432/etreds?schema=public
```

### 4. Setup Prisma Schema

```bash
# Generate database tables
npx prisma migrate dev --name init

# View schema (optional)
npx prisma studio
```

### 5. Start Backend

```bash
npm run dev

# Should show: ✓ Backend running on port 5000
```

### 6. Start Frontend

```bash
cd ../frontend
npm run dev

# Should show: ✓ Frontend running on port 3000
```

---

## 🔧 Useful Commands

```bash
# View/edit database with GUI
npx prisma studio

# Generate Prisma types after schema changes
npx prisma generate

# Run migrations
npx prisma migrate dev

# Check migration status
npx prisma migrate status

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Seed database with sample data (if seed.js exists)
node seed.js
```

---

## 🧪 Test the Setup

```bash
# 1. Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# 2. Get products
curl http://localhost:5000/api/products

# 3. Visit frontend
open http://localhost:3000
```

---

## ⚠️ Common Issues

**"role postgres does not exist"**
```bash
# Fix: Create postgres user
createuser -P postgres
# Password: (leave blank or set one)
```

**"permission denied" on Linux**
```bash
sudo su - postgres
createdb shopnest
exit
```

**Port 5432 already in use**
```bash
# Kill existing PostgreSQL
lsof -ti:5432 | xargs kill -9

# Or use different port in DATABASE_URL
postgresql://user:password@localhost:5433/etreds
```

---

## 📚 Documentation

- [Full Migration Guide](./MIGRATION_GUIDE.md) - Complete step-by-step with troubleshooting
- [Database Schema](./backend/prisma/schema.prisma) - View all tables and relationships
- [Prisma Docs](https://www.prisma.io/docs/) - ORM documentation

---

## ✅ You're All Set!

Your development environment is ready. Start coding! 🎉

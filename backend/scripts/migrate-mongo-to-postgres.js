/**
 * Migration Script: MongoDB to PostgreSQL
 * ========================================
 * 
 * This script:
 * 1. Reads all data from MongoDB collections
 * 2. Transforms embedded documents into relational structure
 * 3. Inserts data into PostgreSQL via Prisma
 * 4. Maintains referential integrity
 * 
 * Usage:
 *   node scripts/migrate-mongo-to-postgres.js
 * 
 * Steps before running:
 * 1. Ensure MongoDB is running and accessible
 * 2. Ensure PostgreSQL database is created
 * 3. Run: npx prisma migrate deploy (to create tables)
 * 4. Run this script
 * 5. Verify data integrity
 */

import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Initialize clients
const prisma = new PrismaClient();

// MongoDB Models
const UserSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  otpHash: String,
  otpExpiresAt: Date,
  createdAt: Date,
  updatedAt: Date,
});

const ProductSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  imageUrl: String,
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  createdAt: Date,
  updatedAt: Date,
});

const ReviewSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  productId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  rating: Number,
  comment: String,
  createdAt: Date,
  updatedAt: Date,
});

const OrderSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  items: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      qty: Number,
      price: Number,
    },
  ],
  totalAmount: Number,
  address: {
    fullName: String,
    street: String,
    city: String,
    postalCode: String,
    country: String,
  },
  paymentId: String,
  status: { type: String, enum: ['Pending', 'Shipped', 'Delivered'], default: 'Pending' },
  createdAt: Date,
  updatedAt: Date,
});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Review = mongoose.model('Review', ReviewSchema);
const Order = mongoose.model('Order', OrderSchema);

// Mapping object for ObjectId conversions
const idMap = {
  users: new Map(),    // MongoDB ObjectId -> PostgreSQL UUID
  products: new Map(),
  addresses: new Map(),
};

// Helper function to map MongoDB ObjectId to PostgreSQL ID
function mapId(mongoId, collection) {
  const idStr = mongoId.toString();
  if (!idMap[collection].has(idStr)) {
    // Generate a consistent UUID-like ID from MongoDB ObjectId
    idMap[collection].set(idStr, require('crypto').randomUUID());
  }
  return idMap[collection].get(idStr);
}

async function migrateData() {
  try {
    console.log('🔄 Starting MongoDB to PostgreSQL migration...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Migrate Users
    console.log('\n📦 Migrating Users...');
    const mongoUsers = await User.find({});
    console.log(`   Found ${mongoUsers.length} users`);

    for (const user of mongoUsers) {
      const postgresId = mapId(user._id, 'users');
      await prisma.user.create({
        data: {
          id: postgresId,
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role === 'admin' ? 'ADMIN' : 'USER',
          isVerified: user.isVerified,
          otpHash: user.otpHash || null,
          otpExpiresAt: user.otpExpiresAt || null,
          createdAt: user.createdAt || new Date(),
          updatedAt: user.updatedAt || new Date(),
        },
      });
    }
    console.log(`✅ Migrated ${mongoUsers.length} users`);

    // 2. Migrate Products
    console.log('\n📦 Migrating Products...');
    const mongoProducts = await Product.find({});
    console.log(`   Found ${mongoProducts.length} products`);

    for (const product of mongoProducts) {
      const postgresId = mapId(product._id, 'products');
      await prisma.product.create({
        data: {
          id: postgresId,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
          imageUrl: product.imageUrl,
          ratings: product.ratings || 0,
          numReviews: product.numReviews || 0,
          createdAt: product.createdAt || new Date(),
          updatedAt: product.updatedAt || new Date(),
        },
      });
    }
    console.log(`✅ Migrated ${mongoProducts.length} products`);

    // 3. Migrate Reviews
    console.log('\n📦 Migrating Reviews...');
    const mongoReviews = await Review.find({});
    console.log(`   Found ${mongoReviews.length} reviews`);

    for (const review of mongoReviews) {
      const userId = mapId(review.userId, 'users');
      const productId = mapId(review.productId, 'products');

      // Skip if user or product doesn't exist
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      const productExists = await prisma.product.findUnique({ where: { id: productId } });

      if (!userExists || !productExists) {
        console.warn(
          `   ⚠️  Skipping review: user=${userId}, product=${productId}`
        );
        continue;
      }

      try {
        await prisma.review.create({
          data: {
            rating: review.rating,
            comment: review.comment,
            name: review.name,
            userId,
            productId,
            createdAt: review.createdAt || new Date(),
            updatedAt: review.updatedAt || new Date(),
          },
        });
      } catch (err) {
        // Handle duplicate review for same user-product pair
        console.warn(
          `   ⚠️  Duplicate review skipped: user=${review.userId}, product=${review.productId}`
        );
      }
    }
    console.log(`✅ Migrated ${mongoReviews.length} reviews`);

    // 4. Migrate Orders and Addresses
    console.log('\n📦 Migrating Orders and Addresses...');
    const mongoOrders = await Order.find({});
    console.log(`   Found ${mongoOrders.length} orders`);

    for (const order of mongoOrders) {
      const userId = mapId(order.userId, 'users');
      
      // Check if user exists
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        console.warn(`   ⚠️  Skipping order: user not found (${order.userId})`);
        continue;
      }

      // Create Address
      let addressId;
      if (order.address) {
        const addressData = {
          fullName: order.address.fullName,
          street: order.address.street,
          city: order.address.city,
          postalCode: order.address.postalCode,
          country: order.address.country,
          userId,
          isDefault: false,
          createdAt: order.createdAt || new Date(),
          updatedAt: order.updatedAt || new Date(),
        };

        const address = await prisma.address.create({ data: addressData });
        addressId = address.id;
        mapId(order._id, 'addresses'); // Track for reference
      }

      if (!addressId) {
        console.warn(`   ⚠️  Skipping order: no address (${order._id})`);
        continue;
      }

      // Map order status
      const statusMap = {
        'Pending': 'PENDING',
        'Shipped': 'SHIPPED',
        'Delivered': 'DELIVERED',
      };

      const orderData = {
        userId,
        addressId,
        totalAmount: order.totalAmount,
        status: statusMap[order.status] || 'PENDING',
        paymentId: order.paymentId || null,
        createdAt: order.createdAt || new Date(),
        updatedAt: order.updatedAt || new Date(),
      };

      const createdOrder = await prisma.order.create({ data: orderData });

      // Create OrderItems
      for (const item of order.items) {
        const productId = mapId(item.productId, 'products');

        const productExists = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (productExists) {
          await prisma.orderItem.create({
            data: {
              orderId: createdOrder.id,
              productId,
              qty: item.qty,
              price: item.price,
            },
          });
        } else {
          console.warn(
            `   ⚠️  Product not found for order item: ${item.productId}`
          );
        }
      }
    }
    console.log(`✅ Migrated ${mongoOrders.length} orders with items`);

    // Summary Statistics
    console.log('\n📊 Migration Summary:');
    const stats = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM users) as user_count,
        (SELECT COUNT(*) FROM products) as product_count,
        (SELECT COUNT(*) FROM reviews) as review_count,
        (SELECT COUNT(*) FROM addresses) as address_count,
        (SELECT COUNT(*) FROM orders) as order_count,
        (SELECT COUNT(*) FROM order_items) as order_item_count
    `;
    
    console.log(`   Users: ${stats[0].user_count}`);
    console.log(`   Products: ${stats[0].product_count}`);
    console.log(`   Reviews: ${stats[0].review_count}`);
    console.log(`   Addresses: ${stats[0].address_count}`);
    console.log(`   Orders: ${stats[0].order_count}`);
    console.log(`   Order Items: ${stats[0].order_item_count}`);

    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    await prisma.$disconnect();
  }
}

// Run migration
migrateData();

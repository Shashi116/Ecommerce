/**
 * Prisma Database Seed
 * Adds admin user and sample products to PostgreSQL database
 */

const { prisma } = require('../config/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Starting database seed...\n');

  try {
    // ==================== ADMIN USER ====================
    const adminEmail = process.env.ADMIN_EMAIL || 'traditionssaha@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'saha@Traditions2026';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`✓ Admin user already exists: ${adminEmail}`);
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          isVerified: true,
        },
      });

      console.log(`✅ Admin user created:`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}\n`);
    }

    // ==================== SAMPLE PRODUCTS ====================
    const existingProducts = await prisma.product.count();

    if (existingProducts > 0) {
      console.log(`✓ Database already has ${existingProducts} products, skipping product seed\n`);
    } else {
      const sampleProducts = [
        {
          name: 'Traditional Saree',
          description: 'Beautiful handwoven traditional saree with intricate patterns',
          price: 129.99,
          category: 'Clothing',
          stock: 50,
          imageUrl: 'https://via.placeholder.com/400x500?text=Traditional+Saree',
        },
        {
          name: 'Silk Dupatta',
          description: 'Premium silk dupatta with embroidered border',
          price: 49.99,
          category: 'Accessories',
          stock: 100,
          imageUrl: 'https://via.placeholder.com/400x500?text=Silk+Dupatta',
        },
        {
          name: 'Designer Kurta',
          description: 'Modern designer kurta with traditional prints',
          price: 79.99,
          category: 'Clothing',
          stock: 75,
          imageUrl: 'https://via.placeholder.com/400x500?text=Designer+Kurta',
        },
        {
          name: 'Handcrafted Bangle Set',
          description: 'Set of 12 handcrafted bangles with traditional designs',
          price: 34.99,
          category: 'Jewelry',
          stock: 60,
          imageUrl: 'https://via.placeholder.com/400x500?text=Bangle+Set',
        },
        {
          name: 'Traditional Shawl',
          description: 'Warm traditional shawl perfect for any season',
          price: 89.99,
          category: 'Accessories',
          stock: 40,
          imageUrl: 'https://via.placeholder.com/400x500?text=Traditional+Shawl',
        },
      ];

      for (const product of sampleProducts) {
        await prisma.product.create({
          data: product,
        });
      }

      console.log(`✅ Created ${sampleProducts.length} sample products\n`);
    }

    console.log('🌱 Database seed completed successfully!\n');
    console.log('📋 Admin Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}\n`);

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

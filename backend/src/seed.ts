import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Product, Testimonial } from './models';
import { connectDB, disconnectDB } from './config/database';

// Load env vars
dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🌱 Starting database seeding...\n');

    // 1. Create Admin User
    console.log('👤 Creating admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'iansanchez09@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'iansanchez0409';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      await User.create({
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`✅ Admin created: ${adminEmail}`);
    } else {
      console.log(`⚠️ Admin already exists: ${adminEmail}`);
    }

    // 2. Create Sample Products
    console.log('\n📦 Creating sample products...');
    const productsCount = await Product.countDocuments();
    
    if (productsCount === 0) {
      const sampleProducts = [
        {
          name: 'VetPro Poultry Vitamins',
          description: 'Complete vitamin supplement for poultry. Improves growth and immunity in chickens and gamefowl.',
          price: 450,
          category: 'chicken',
          image: 'https://res.cloudinary.com/daw38bilg/image/upload/v1700000000/samples/animals/chicken-meds.jpg',
          stock: 100,
          labels: ['Best Seller', 'Essential'],
          isFeatured: true,
          sku: 'VP-CH-001',
        },
        {
          name: 'Swine Booster Plus',
          description: 'High-performance feed additive for swine. Enhances weight gain and overall health.',
          price: 650,
          category: 'pig',
          image: 'https://res.cloudinary.com/daw38bilg/image/upload/v1700000000/samples/animals/pig-meds.jpg',
          stock: 75,
          labels: ['Fast Moving', 'Premium'],
          isFeatured: true,
          sku: 'SB-PG-001',
        },
        {
          name: 'Cattle Mineral Mix',
          description: 'Essential minerals and vitamins for cattle. Supports bone strength and milk production.',
          price: 850,
          category: 'cattle',
          image: 'https://res.cloudinary.com/daw38bilg/image/upload/v1700000000/samples/animals/cattle-meds.jpg',
          stock: 50,
          labels: ['New', 'Recommended'],
          isFeatured: false,
          sku: 'CM-CT-001',
        },
        {
          name: 'Fly Control Spray',
          description: 'Effective fly and insect repellent for livestock. Safe for all farm animals.',
          price: 280,
          category: 'fly',
          image: 'https://res.cloudinary.com/daw38bilg/image/upload/v1700000000/samples/animals/fly-control.jpg',
          stock: 120,
          labels: ['Essential'],
          isFeatured: false,
          sku: 'FC-FLY-001',
        },
      ];

      await Product.insertMany(sampleProducts);
      console.log(`✅ Created ${sampleProducts.length} sample products`);
    } else {
      console.log(`⚠️ Products already exist (${productsCount} found)`);
    }

    // 3. Create Sample Testimonials
    console.log('\n⭐ Creating sample testimonials...');
    const testimonialsCount = await Testimonial.countDocuments();
    
    if (testimonialsCount === 0) {
      const sampleTestimonials = [
        {
          name: 'Juan Dela Cruz',
          location: 'Bulacan',
          rating: 5,
          message: 'Mabilis ang delivery at effective ang products! Yung mga manok ko mas malusog na ngayon.',
          isApproved: true,
          isFeatured: true,
        },
        {
          name: 'Maria Santos',
          location: 'Pampanga',
          rating: 5,
          message: 'Maganda ang customer service. Tinawagan nila ako para i-confirm ang order. COD pa!',
          isApproved: true,
          isFeatured: true,
        },
        {
          name: 'Pedro Garcia',
          location: 'Cebu',
          rating: 4,
          message: 'Effective ang swine booster. Mas mabilis tumaba ang mga baboy ko.',
          isApproved: true,
          isFeatured: false,
        },
      ];

      await Testimonial.insertMany(sampleTestimonials);
      console.log(`✅ Created ${sampleTestimonials.length} sample testimonials`);
    } else {
      console.log(`⚠️ Testimonials already exist (${testimonialsCount} found)`);
    }

    console.log('\n✨ Seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   • Admin: ${adminEmail}`);
    console.log(`   • Password: ${adminPassword}`);
    console.log(`   • You can now login at: http://localhost:5173/admin-login`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

// Run seed
seedData();

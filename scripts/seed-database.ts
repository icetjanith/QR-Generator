// Database seeding script
import connectDB from '../lib/mongodb';
import User from '../models/User';
import Product from '../models/Product';
import Shop from '../models/Shop';

async function seedDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Shop.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = new User({
      email: 'admin@warranty.com',
      name: 'System Administrator',
      password: 'password123',
      role: 'admin',
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create shop
    const shop = new Shop({
      name: 'TechMart Downtown',
      address: '123 Main St, Downtown, City',
      phone: '+1234567890',
      email: 'shop@techmart.com',
      ownerName: 'Shop Owner',
      status: 'active',
    });
    await shop.save();
    console.log('Created shop');

    // Create shop owner user
    const shopOwner = new User({
      email: 'shop@warranty.com',
      name: 'Shop Owner',
      password: 'password123',
      role: 'shop_owner',
      shopId: shop._id.toString(),
    });
    await shopOwner.save();
    console.log('Created shop owner user');

    // Create sample products
    const products = [
      {
        name: 'SmartWatch Pro X1',
        description: 'Advanced fitness tracking smartwatch with heart rate monitoring',
        category: 'Wearables',
        brand: 'TechCorp',
        model: 'TWX-2024',
        warrantyDurationMonths: 24,
        imageUrl: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=300',
        specifications: {
          'Display': '1.4" AMOLED',
          'Battery': '7 days',
          'Water Resistance': '50 meters',
          'Connectivity': 'Bluetooth 5.0, WiFi',
        },
        createdBy: adminUser._id.toString(),
      },
      {
        name: 'Wireless Headphones Elite',
        description: 'Premium noise-cancelling wireless headphones',
        category: 'Audio',
        brand: 'SoundMax',
        model: 'WH-Elite-2024',
        warrantyDurationMonths: 12,
        imageUrl: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=300',
        specifications: {
          'Driver': '40mm Dynamic',
          'Frequency Response': '20Hz - 20kHz',
          'Battery': '30 hours',
          'Connectivity': 'Bluetooth 5.2',
        },
        createdBy: adminUser._id.toString(),
      },
    ];

    await Product.insertMany(products);
    console.log('Created sample products');

    console.log('✅ Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@warranty.com / password123');
    console.log('Shop Owner: shop@warranty.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
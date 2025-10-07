const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://isavameshack_db_user:DgjsDX69G6U6CMH0@domain.ufzx0pz.mongodb.net/devcollab?retryWrites=true&w=majority&appName=DEVEOPS');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@devcollab.com',
      password: 'admin123', // Change this password after first login
      username: 'admin',
      name: 'Admin User',
      country: '',
      province: '',
      languages: [],
      skills: [],
      experience: 'Expert',
      bio: 'System Administrator',
      github: '',
      portfolio: '',
      profile_image: '',
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@devcollab.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login.');

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();

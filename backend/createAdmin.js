const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const User = require('./models/User');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Delete any existing admin with this email
    await User.deleteOne({ email: 'admin@shoplux.com' });

    // Create fresh admin — .save() triggers the bcrypt pre-save hook
    const admin = new User({
      name:     'Admin User',
      email:    'admin@shoplux.com',
      password: 'admin123',
      role:     'admin',
    });
    await admin.save();

    // Verify it was saved and password works
    const saved  = await User.findOne({ email: 'admin@shoplux.com' }).select('+password');
    const valid  = await saved.comparePassword('admin123');

    console.log('');
    console.log('─────────────────────────────────────────');
    console.log('✅ Admin user created successfully!');
    console.log('   Email:    admin@shoplux.com');
    console.log('   Password: admin123');
    console.log('   Role:     admin');
    console.log('   Password check:', valid ? '✅ PASSED' : '❌ FAILED');
    console.log('─────────────────────────────────────────');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
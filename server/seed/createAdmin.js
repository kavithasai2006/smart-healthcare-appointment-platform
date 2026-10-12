import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_healthcare';

async function configureAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🍃 Connected to MongoDB:', mongoose.connection.name);

    // Accept target email from CLI arg or default to admin@smartcare.com
    const targetEmail = (process.argv[2] || 'admin@smartcare.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin@SmartCare2026';

    let user = await User.findOne({ email: targetEmail });

    if (user) {
      user.role = 'admin';
      await user.save();
      console.log(`✅ User '${targetEmail}' has been granted the 'admin' role successfully.`);
    } else {
      user = await User.create({
        fullName: 'SmartCare System Administrator',
        email: targetEmail,
        password: adminPassword,
        phone: '9999999999',
        role: 'admin',
      });
      console.log(`✅ Created initial administrator account:`);
      console.log(`   Email: ${targetEmail}`);
      console.log(`   Role: admin`);
    }

    console.log('\n🔒 Administrator configuration complete.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to configure administrator:', error);
    process.exit(1);
  }
}

configureAdmin();

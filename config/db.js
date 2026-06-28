const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    const mongoUri = process.env.MONGO_URI || '';
    let uriHost = 'unavailable';

    try {
      uriHost = new URL(mongoUri).host || 'unavailable';
    } catch (_) {
      uriHost = 'invalid-uri-format';
    }

    console.error('❌ MongoDB connection error:', error.message);
    console.error('❌ MongoDB URI host:', uriHost);
    console.error('❌ Failed to connect to MongoDB. Check MONGO_URI, network access, and Atlas IP whitelist.');
    process.exit(1);
  }
};

module.exports = connectDB;

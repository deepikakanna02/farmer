const mongoose = require('mongoose');
const { connectDB, gracefulShutdown } = require('../server');

module.exports = async () => {
  // Use test DB URI
  process.env.MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/yourdb_test';
  
  try {
    await connectDB();
    await mongoose.connection.db.dropDatabase();  // Clean DB before tests
  } catch (err) {
    console.error('Test setup failed:', err);
    throw err;
  }

  // Return teardown function for Jest
  return async () => {
    await gracefulShutdown('JEST');
  };
};

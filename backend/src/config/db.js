const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/company_workspace';

    if (mongoUri.includes('<db_password>')) {
      console.warn('⚠️  WARNING: MONGO_URI in .env contains placeholder "<db_password>".');
      console.warn('⚠️  Falling back to local MongoDB: mongodb://127.0.0.1:27017/company_workspace');
      console.warn('⚠️  To use MongoDB Atlas, replace <db_password> in backend/.env with your real database user password.');
      mongoUri = 'mongodb://127.0.0.1:27017/company_workspace';
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
